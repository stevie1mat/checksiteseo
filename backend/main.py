import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl, EmailStr, Field
from analyzer import (
    analyze_readiness,
    generate_content_strategy,
    generate_answer_strategy,
    analyze_ambiguity_issues,
    set_llm_runtime,
    reset_llm_runtime,
    get_llm_usage_snapshot,
)
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime, timedelta, timezone
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from sqlalchemy import create_engine, text
import json
import asyncio
import re
import resend
from email_templates import get_email_html
from dependencies import get_current_user, get_optional_current_user

import stripe
from urllib.parse import urlparse
import httpx
from typing import Literal

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
print(f"DEBUG: Loaded RESEND_API_KEY: {'Yes' if RESEND_API_KEY else 'No'}")

# Stripe Setup
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
EDEN_API_KEY = os.getenv("EDEN_API_KEY")
EDEN_API_BASE_URL = os.getenv("EDEN_API_BASE_URL", "https://api.edenai.run")
EDEN_DEFAULT_MODEL = os.getenv("EDEN_DEFAULT_MODEL", "openai/gpt-4o-mini")


def _env_int(name: str, default: int) -> int:
    raw_value = os.getenv(name)
    if raw_value is None:
        return default
    try:
        return int(raw_value)
    except ValueError:
        logger.warning(f"Invalid integer for {name}: {raw_value}. Falling back to {default}.")
        return default


DAILY_FREE_TOKENS = max(0, _env_int("DAILY_FREE_TOKENS", 1000))
TOKENS_PER_SCAN = max(1, _env_int("TOKENS_PER_SCAN", 1000))
TOKENS_PER_CHAT = max(1, _env_int("TOKENS_PER_CHAT", 300))
MAX_SITES_PER_USER = max(1, _env_int("MAX_SITES_PER_USER", 100))
ENABLE_LEGACY_PLAN_GATES = os.getenv("ENABLE_LEGACY_PLAN_GATES", "false").lower() == "true"

TOKEN_PACKS = {
    "starter": {
        "price_id": os.getenv("STRIPE_PRICE_ID_TOKENS_STARTER", ""),
        "tokens": max(1, _env_int("TOKEN_PACK_STARTER_TOKENS", 100)),
    },
    "growth": {
        "price_id": os.getenv("STRIPE_PRICE_ID_TOKENS_GROWTH", ""),
        "tokens": max(1, _env_int("TOKEN_PACK_GROWTH_TOKENS", 500)),
    },
    "scale": {
        "price_id": os.getenv("STRIPE_PRICE_ID_TOKENS_SCALE", ""),
        "tokens": max(1, _env_int("TOKEN_PACK_SCALE_TOKENS", 2000)),
    },
}

if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY
else:
    print("WARNING: STRIPE_SECRET_KEY not found. Stripe features will not work.")

app = FastAPI(title="AEO Readiness Auditor")

# Supabase Setup
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY")
supabase: Client = None

if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        logger.error(f"Supabase init failed: {e}")

# Email & Scheduler Setup
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

DATABASE_URL = os.getenv("DATABASE_URL")

# Initialize scheduler - use in-memory by default, upgrade to DB if available
scheduler = AsyncIOScheduler(timezone=timezone.utc)

# Database Initialization (Ensure tables exist)
from sqlalchemy import create_engine, text
from sqlalchemy.pool import NullPool

def ensure_tables_exist():
    """Initialize database tables. Non-blocking - failures won't crash the app."""
    if not DATABASE_URL:
        print("INFO: No DATABASE_URL provided. Skipping database initialization.")
        return
    
    try:
        # Use NullPool to avoid connection pool issues during startup
        # Add connection timeout and retry logic
        # Try to force IPv4 connection (Render may have IPv6 issues)
        # Supabase connection strings work with both IPv4 and IPv6
        # The error suggests IPv6 is not reachable, but psycopg2 should fallback to IPv4
        engine = create_engine(
            DATABASE_URL,
            poolclass=NullPool,
            connect_args={
                "connect_timeout": 10,  # Increased timeout for Render
                "options": "-c statement_timeout=5000"
            },
            pool_pre_ping=True  # Verify connections before using
        )
        with engine.connect() as conn:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS scheduled_scans (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    site_id UUID NOT NULL,
                    url TEXT NOT NULL,
                    user_email TEXT,
                    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
                    status TEXT NOT NULL DEFAULT 'pending',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                    error TEXT
                );
                
                -- Grant permissions for PostgREST (Supabase API) access
                GRANT SELECT ON scheduled_scans TO anon, authenticated;
                GRANT ALL ON scheduled_scans TO service_role;
                
                -- Grant permissions for site_history table
                GRANT INSERT, SELECT ON site_history TO anon, authenticated, service_role;

                CREATE TABLE IF NOT EXISTS pages (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    site_id UUID NOT NULL,
                    url TEXT,
                    checklist JSONB,
                    aeo_score INTEGER,
                    last_scanned_at TIMESTAMP WITH TIME ZONE DEFAULT now()
                );
                
                GRANT ALL ON pages TO anon, authenticated, service_role;
            """))
            conn.commit()
            print("✅ Database tables ensured.")
    except Exception as e:
        print(f"⚠️ Database initialization failed (non-critical): {e}")
        print("⚠️ App will continue with in-memory scheduler. Database features may be limited.")

def verify_database_connection():
    """Verify database connection is available. Non-blocking."""
    if not DATABASE_URL:
        return False
    
    try:
        # Test connection with timeout
        engine = create_engine(
            DATABASE_URL,
            poolclass=NullPool,
            connect_args={"connect_timeout": 5},
            pool_pre_ping=True
        )
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        print("✅ Database connection verified.")
        return True
    except Exception as e:
        print(f"⚠️ Could not verify database connection: {e}")
        print("⚠️ App will continue with in-memory scheduler. Database features may be limited.")
        return False

# CORS Setup
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _get_user_id(user: dict | object | None) -> str | None:
    if not user:
        return None
    if isinstance(user, dict):
        return user.get("id")
    return getattr(user, "id", None)

def _get_subscription_tier(user_id: str | None) -> str:
    if not user_id or not supabase:
        return "free"
    try:
        profile_response = supabase.table("profiles").select("subscription_tier").eq("id", user_id).execute()
        if profile_response.data and len(profile_response.data) > 0:
            return profile_response.data[0].get("subscription_tier", "free")
    except Exception as e:
        logger.error(f"Failed to load subscription tier for user {user_id}: {e}")
    return "free"

def _require_tier(user_id: str | None, allowed_tiers: set[str], feature_name: str):
    tier = _get_subscription_tier(user_id)
    if not ENABLE_LEGACY_PLAN_GATES:
        return tier
    if tier not in allowed_tiers:
        raise HTTPException(
            status_code=403,
            detail=f"{feature_name} is available on {', '.join(sorted(allowed_tiers)).upper()} plans. Please upgrade."
        )
    return tier


def _parse_rpc_payload(response) -> dict:
    data = getattr(response, "data", None)
    if isinstance(data, dict):
        return data
    if isinstance(data, list) and data and isinstance(data[0], dict):
        return data[0]
    return {}


def _get_token_summary(user_id: str | None) -> dict:
    if not user_id or not supabase:
        return {
            "token_balance": 0,
            "daily_free_tokens_last_granted_at": None,
            "total_tokens_used": 0,
            "total_tokens_purchased": 0,
        }

    try:
        profile = (
            supabase.table("profiles")
            .select("token_balance, daily_free_tokens_last_granted_at, total_tokens_used, total_tokens_purchased")
            .eq("id", user_id)
            .single()
            .execute()
        )
        if profile.data:
            return {
                "token_balance": int(profile.data.get("token_balance") or 0),
                "daily_free_tokens_last_granted_at": profile.data.get("daily_free_tokens_last_granted_at"),
                "total_tokens_used": int(profile.data.get("total_tokens_used") or 0),
                "total_tokens_purchased": int(profile.data.get("total_tokens_purchased") or 0),
            }
    except Exception as e:
        logger.error(f"Failed to load token summary for user {user_id}: {e}")

    return {
        "token_balance": 0,
        "daily_free_tokens_last_granted_at": None,
        "total_tokens_used": 0,
        "total_tokens_purchased": 0,
    }


def _grant_daily_tokens_if_eligible(user_id: str | None) -> dict:
    if not user_id or not supabase or DAILY_FREE_TOKENS <= 0:
        return {"granted": False}

    try:
        response = supabase.rpc(
            "grant_daily_free_tokens",
            {"p_user_id": user_id, "p_tokens": DAILY_FREE_TOKENS},
        ).execute()
        payload = _parse_rpc_payload(response)
        return payload if payload else {"granted": False}
    except Exception as e:
        logger.error(f"Failed to grant daily tokens for user {user_id}: {e}")

    # Fallback when RPC function is unavailable.
    try:
        summary = _get_token_summary(user_id)
        today_utc = datetime.now(timezone.utc).date().isoformat()
        if summary.get("daily_free_tokens_last_granted_at") == today_utc:
            return {"granted": False, "new_balance": summary.get("token_balance", 0)}

        new_balance = int(summary.get("token_balance", 0)) + DAILY_FREE_TOKENS
        supabase.table("profiles").update({
            "token_balance": new_balance,
            "daily_free_tokens_last_granted_at": today_utc,
        }).eq("id", user_id).execute()

        try:
            supabase.table("token_transactions").insert({
                "user_id": user_id,
                "tokens": DAILY_FREE_TOKENS,
                "transaction_type": "daily_grant",
                "description": "Daily free token grant",
                "metadata": {"date_utc": today_utc},
            }).execute()
        except Exception:
            # Ignore transaction log failure in fallback mode.
            pass

        return {"granted": True, "new_balance": new_balance}
    except Exception as fallback_error:
        logger.error(f"Fallback daily grant failed for user {user_id}: {fallback_error}")
        return {"granted": False}


def _token_usage_total(usage: dict | None) -> int:
    if not isinstance(usage, dict):
        return 0
    value = usage.get("total_tokens", 0)
    try:
        return max(int(value), 0)
    except (TypeError, ValueError):
        return 0


def _estimate_tokens_from_text(text: str | None) -> int:
    if not text:
        return 0
    return max(len(text) // 4, 0)


def _estimate_tokens_from_messages(messages: list[dict] | None) -> int:
    if not messages:
        return 0
    total_chars = 0
    for message in messages:
        if not isinstance(message, dict):
            continue
        content = message.get("content")
        if isinstance(content, str):
            total_chars += len(content)
    return max(total_chars // 4, 0)


def _consume_tokens_for_scan(
    user_id: str | None,
    reason: str = "Token usage for scan",
    prefer_daily_source: bool = False,
    tokens: int | None = None,
) -> dict:
    token_amount = TOKENS_PER_SCAN if tokens is None else max(1, int(tokens))

    if not user_id or not supabase:
        return {"success": True, "balance": 0, "source": "unknown"}
    if token_amount <= 0:
        summary = _get_token_summary(user_id)
        return {"success": True, "balance": summary.get("token_balance", 0), "source": "free"}

    try:
        response = supabase.rpc(
            "consume_tokens",
            {"p_user_id": user_id, "p_tokens": token_amount, "p_reason": reason},
        ).execute()
        payload = _parse_rpc_payload(response)
        if payload:
            payload.setdefault("balance", _get_token_summary(user_id).get("token_balance", 0))
            payload.setdefault("source", "daily" if prefer_daily_source else "paid")
            return payload
    except Exception as e:
        logger.error(f"Failed to consume tokens via RPC for user {user_id}: {e}")

    # Fallback path if RPC is unavailable.
    summary = _get_token_summary(user_id)
    current_balance = summary.get("token_balance", 0)
    if current_balance < token_amount:
        return {"success": False, "balance": current_balance, "source": "paid"}

    try:
        new_balance = current_balance - token_amount
        supabase.table("profiles").update({
            "token_balance": new_balance,
            "total_tokens_used": summary.get("total_tokens_used", 0) + token_amount,
        }).eq("id", user_id).execute()
        supabase.table("token_transactions").insert({
            "user_id": user_id,
            "tokens": -token_amount,
            "transaction_type": "scan_usage",
            "description": reason,
            "metadata": {},
        }).execute()
        return {"success": True, "balance": new_balance, "source": "daily" if prefer_daily_source else "paid"}
    except Exception as e:
        logger.error(f"Fallback token consumption failed for user {user_id}: {e}")
        return {"success": False, "balance": current_balance, "source": "paid"}


def _credit_user_tokens(
    user_id: str | None,
    tokens: int,
    description: str,
    transaction_type: str = "purchase",
    stripe_session_id: str | None = None,
    metadata: dict | None = None,
) -> dict:
    if not user_id or not supabase or tokens == 0:
        return {"success": False}

    metadata = metadata or {}

    try:
        response = supabase.rpc(
            "add_tokens",
            {
                "p_user_id": user_id,
                "p_tokens": tokens,
                "p_transaction_type": transaction_type,
                "p_description": description,
                "p_stripe_session_id": stripe_session_id,
                "p_metadata": metadata,
            },
        ).execute()
        payload = _parse_rpc_payload(response)
        if payload:
            return payload
    except Exception as e:
        logger.error(f"Token credit RPC failed for user {user_id}: {e}")

    # Fallback path if RPC is unavailable.
    summary = _get_token_summary(user_id)
    try:
        new_balance = summary.get("token_balance", 0) + tokens
        purchased_delta = tokens if tokens > 0 else 0
        supabase.table("profiles").update({
            "token_balance": new_balance,
            "total_tokens_purchased": summary.get("total_tokens_purchased", 0) + purchased_delta,
        }).eq("id", user_id).execute()
        supabase.table("token_transactions").insert({
            "user_id": user_id,
            "tokens": tokens,
            "transaction_type": transaction_type,
            "description": description,
            "stripe_session_id": stripe_session_id,
            "metadata": metadata,
        }).execute()
        return {"success": True, "new_balance": new_balance}
    except Exception as e:
        logger.error(f"Fallback token credit failed for user {user_id}: {e}")
        return {"success": False}


def _settle_token_usage(
    user_id: str | None,
    held_tokens: int,
    usage: dict | None,
    reason_prefix: str,
    fallback_total_tokens: int | None = None,
) -> dict:
    hold = max(1, int(held_tokens))
    usage_total = _token_usage_total(usage)
    fallback_total = hold if fallback_total_tokens is None else max(1, int(fallback_total_tokens))
    billed_tokens = max(hold, usage_total if usage_total > 0 else fallback_total)
    additional_tokens = max(0, billed_tokens - hold)

    additional_charge_success = True
    additional_balance = None
    if additional_tokens > 0:
        additional_result = _consume_tokens_for_scan(
            user_id,
            reason=f"{reason_prefix} (additional model tokens)",
            prefer_daily_source=False,
            tokens=additional_tokens,
        )
        additional_charge_success = bool(additional_result.get("success"))
        additional_balance = additional_result.get("balance")
        if not additional_charge_success:
            logger.warning(
                "Failed to settle additional tokens",
                extra={
                    "user_id": user_id,
                    "additional_tokens": additional_tokens,
                    "reason_prefix": reason_prefix,
                },
            )

    return {
        "held_tokens": hold,
        "billed_tokens": billed_tokens,
        "additional_tokens": additional_tokens,
        "usage_total_tokens": usage_total,
        "additional_charge_success": additional_charge_success,
        "balance_after_additional_charge": additional_balance,
    }

# Startup event to ensure functions are defined before scheduler starts
@app.on_event("startup")
async def startup_event():
    # Start scheduler first (in-memory)
    scheduler.start()
    print("🚀 Scheduler started with AsyncIOScheduler (UTC) - in-memory mode.")
    
    # Try to initialize database (non-blocking)
    ensure_tables_exist()
    
    # Verify database connection (non-blocking)
    # This happens after startup so app can start even if DB is temporarily unavailable
    try:
        verify_database_connection()
    except Exception as e:
        print(f"⚠️ Database verification failed (non-critical): {e}")
        print("⚠️ Continuing with in-memory scheduler.")
    
    # Log pending jobs
    try:
        for job in scheduler.get_jobs():
            print(f"📌 PENDING JOB: {job.id} | Name: {job.name} | Next Run: {job.next_run_time}")
    except Exception as e:
        print(f"⚠️ Could not list jobs: {e}")

class AnalyzeRequest(BaseModel):
    url: HttpUrl
    site_id: str | None = None
    sync: bool = False

@app.get("/")
def read_root():
    return {"message": "AEO Readiness Auditor API is running"}

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "aeo-readiness-auditor"}



def get_status(score: int) -> str:
    if score >= 90: return "healthy"
    if score >= 70: return "warning"
    return "critical"

async def get_geoip_data(ip: str):
    if not ip or ip in ("127.0.0.1", "localhost", "::1"):
        return {"city": "Local", "country": "Local", "countryCode": "LCL"}
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"http://ip-api.com/json/{ip}")
            if resp.status_code == 200:
                data = resp.json()
                if data.get("status") == "success":
                    return {
                        "city": data.get("city"),
                        "country": data.get("country"),
                        "countryCode": data.get("countryCode")
                    }
    except Exception as e:
        logger.error(f"GeoIP listup failed: {e}")
    return {"city": "Unknown", "country": "Unknown", "countryCode": ""}

async def log_scan_to_db(url: str, result: dict, site_id: str | None = None, metadata: dict | None = None):
    if not supabase: return
    try:
        # Find site_id if None (Anonymous Scan)
        if not site_id:
            # We specifically look for a site NAMED "Anonymous Scan" to avoid logged-in site overlaps
            existing = supabase.table("sites").select("id").eq("url", url).eq("name", "Anonymous Scan").limit(1).execute()
            if existing.data:
                site_id = existing.data[0]["id"]
            else:
                # Create a master anonymous site entry if this is the first time this URL was scanned anonymously
                first_admin = supabase.table("profiles").select("id").limit(1).execute()
                if first_admin.data:
                    admin_id = first_admin.data[0]["id"]
                    import uuid
                    new_site = supabase.table("sites").insert({
                        "user_id": admin_id,
                        "url": url,
                        "name": "Anonymous Scan",
                        "status": "completed",
                        "verification_token": str(uuid.uuid4())
                    }).execute()
                    if new_site.data:
                        site_id = new_site.data[0]["id"]

        if site_id:
            aeo_score = result.get("total_score", 0)
            breakdown = result.get("breakdown", {})
            status = "completed"
            
            supabase.table("sites").update({
                "aeo_score": aeo_score,
                "status": status,
                "last_scanned_at": datetime.now(timezone.utc).isoformat()
            }).eq("id", site_id).execute()

            supabase.table("site_history").insert({
               "site_id": site_id,
               "aeo_score": aeo_score
            }).execute()

            try:
                db_url = os.getenv("DATABASE_URL")
                engine = create_engine(db_url)
                with engine.connect() as conn:
                    query = text("""
                        INSERT INTO pages (site_id, url, checklist, aeo_score, status, last_scanned_at, ip_address, city, country, user_agent)
                        VALUES (:site_id, :url, :checklist, :aeo_score, :status, :last_scanned_at, :ip, :city, :country, :ua)
                    """)
                    conn.execute(query, {
                        "site_id": site_id,
                        "url": url,
                        "checklist": json.dumps(breakdown),
                        "aeo_score": aeo_score,
                        "status": status,
                        "last_scanned_at": datetime.now(timezone.utc).isoformat(),
                        "ip": metadata.get("ip") if metadata else None,
                        "city": metadata.get("city") if metadata else None,
                        "country": metadata.get("country") if metadata else None,
                        "ua": metadata.get("ua") if metadata else None
                    })
                    conn.commit()
            except Exception as e:
                logger.error(f"SQL direct insert failed in sync log: {e}")
    except Exception as e:
        logger.error(f"Failed to log anonymous scan: {e}")

@app.post("/analyze")
async def analyze_url(
    request: AnalyzeRequest, 
    raw_request: Request,
    background_tasks: BackgroundTasks,
    user: dict | None = Depends(get_optional_current_user)
):
    url = str(request.url)
    site_id = request.site_id
    sync = request.sync
    
    # Metadata Extraction
    ip_addr = raw_request.headers.get("x-forwarded-for", raw_request.client.host).split(",")[0].strip()
    user_agent = raw_request.headers.get("user-agent", "unknown")
    geo = await get_geoip_data(ip_addr)
    metadata = {
        "ip": ip_addr,
        "ua": user_agent,
        "city": geo.get("city"),
        "country": geo.get("country")
    }
    llm_provider = "groq"
    llm_model: str | None = None
    user_id: str | None = None
    scan_token_hold = TOKENS_PER_SCAN

    # OWNER CHECK
    if site_id:
        if not user:
            raise HTTPException(status_code=401, detail="Authentication required to save to a specific site.")

        if not supabase:
            print("ERROR: Supabase client is None")
            raise HTTPException(status_code=500, detail="Database connection failed")

        try:
            # Check if site exists and belongs to user
            site_response = supabase.table("sites").select("user_id, status, last_scanned_at").eq("id", site_id).execute()
            
            if not site_response.data:
                 pass
            elif site_response.data[0]['user_id'] != user.id:
                 raise HTTPException(status_code=403, detail="You do not have permission to scan this site.")
                 
        except HTTPException as he:
            raise he
        except Exception as e:
            logger.error(f"Ownership check failed: {e}")
            raise HTTPException(status_code=500, detail="Ownership verification failed")

    # TOKEN CHECK
    try:
        if user:
            user_id = _get_user_id(user)
            grant_result = _grant_daily_tokens_if_eligible(user_id)
            was_daily_granted_now = bool(grant_result.get("granted"))
            token_consume_result = _consume_tokens_for_scan(
                user_id,
                reason="Token usage hold for on-demand scan",
                prefer_daily_source=was_daily_granted_now,
                tokens=scan_token_hold,
            )
            if not token_consume_result.get("success"):
                remaining_balance = int(token_consume_result.get("balance") or 0)
                raise HTTPException(
                    status_code=402,
                    detail=f"Insufficient tokens. Scans require at least {scan_token_hold} token(s) available, and you currently have {remaining_balance}.",
                )
            llm_provider = "groq" if token_consume_result.get("source") == "daily" else "eden"
            if llm_provider == "eden":
                llm_model = EDEN_DEFAULT_MODEL
        else:
            # Guest Limit?
            # For now, we allow guests to scan freely as it's a landing page hook.
            # Ideally we'd rate limit by IP here.
            pass

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Token check failed: {e}")
        raise HTTPException(status_code=500, detail="Token validation failed")

    # 1. Rate Limiting Check (24h per site)
    ENABLE_RATE_LIMIT = os.getenv("ENABLE_RATE_LIMIT", "true").lower() == "true"
    
    if ENABLE_RATE_LIMIT and request.site_id and 'site_response' in locals() and site_response.data:
        site = site_response.data[0]
        last_scanned = site.get("last_scanned_at")
        if last_scanned:
            last_time = datetime.fromisoformat(last_scanned.replace('Z', '+00:00'))
            if (datetime.now(timezone.utc) - last_time < timedelta(hours=24)) and site.get("status") == 'completed':
                 raise HTTPException(status_code=429, detail="Rate limit exceeded: 1 scan per 24 hours.")

    # 2. Update Status Update to Analyzing IMMEDIATE
    if request.site_id:
        try:
            supabase.table("sites").update({"status": "analyzing"}).eq("id", request.site_id).execute()
        except Exception as e:
            print(f"Failed to update status: {e}")

    # 3. Handle Synchronous Request
    if sync:
        try:
            runtime_tokens = set_llm_runtime(llm_provider, llm_model)
            llm_usage: dict = {}
            try:
                # Run analysis immediately and await result
                result = await analyze_readiness(url, scan_mode="full")
                llm_usage = get_llm_usage_snapshot()
            finally:
                reset_llm_runtime(runtime_tokens)

            if user_id:
                usage_settlement = _settle_token_usage(
                    user_id=user_id,
                    held_tokens=scan_token_hold,
                    usage=llm_usage,
                    reason_prefix="Token usage for on-demand scan",
                )
                result["token_usage"] = usage_settlement
            
            # Alias total_score to score for API consistency
            result['score'] = result.get('total_score', 0)
            
            background_tasks.add_task(log_scan_to_db, url, result, site_id, metadata)
            
            return result
        except Exception as e:
            logger.error(f"Sync analysis failed: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    # 4. Schedule Background Task (Default Async behavior)
    background_tasks.add_task(
        run_analysis_background,
        url,
        site_id,
        metadata,
        llm_provider,
        llm_model,
        user_id,
        scan_token_hold,
    )

    return {"status": "processing", "message": "Analysis started in background"}

async def run_analysis_background(
    url: str,
    site_id: str | None,
    metadata: dict | None = None,
    llm_provider: str = "groq",
    llm_model: str | None = None,
    user_id: str | None = None,
    scan_token_hold: int = TOKENS_PER_SCAN,
):
    print(f"🚀 [Background] Starting analysis for {url}")
    try:
        # Perform Analysis with Timeout (120s safety limit)
        # analyze_readiness handles its own internal concurrency, but this is a global safety net.
        print(f"⏳ [Background] Calling analyze_readiness for {url}...")
        runtime_tokens = set_llm_runtime(llm_provider, llm_model)
        llm_usage: dict = {}
        try:
            result = await asyncio.wait_for(analyze_readiness(url, scan_mode="full"), timeout=120.0)
            llm_usage = get_llm_usage_snapshot()
        finally:
            reset_llm_runtime(runtime_tokens)

        if user_id:
            usage_settlement = _settle_token_usage(
                user_id=user_id,
                held_tokens=scan_token_hold,
                usage=llm_usage,
                reason_prefix=f"Token usage for async scan ({site_id or url})",
            )
            logger.info(f"Async scan token settlement: {usage_settlement}")

        print(f"✅ [Background] Analysis finished for {url}")
        print(f"🔍 [Background] Result keys: {result.keys() if result else 'None'}")
        
        # Prepare Data
        # Calculate health status
        print("🔍 [Background] processing breakdown...")
        breakdown = result.get("breakdown", {})
        
        robots_score = breakdown.get("technical", {}).get("robots", {}).get("score", 0)
        schema_score = breakdown.get("technical", {}).get("schema", {}).get("score", 0)
        
        # Content score avg
        content_scores = [v.get("score", 0) for v in breakdown.get("content", {}).values() if isinstance(v, dict)]
        content_avg = sum(content_scores) / len(content_scores) if content_scores else 0
        
        print(f"🔍 [Background] Scores - Robots: {robots_score}, Schema: {schema_score}, Content Avg: {content_avg}")

        health_status = {
            "robots": get_status(robots_score),
            "schema": get_status(schema_score),
            "content": get_status(int(content_avg))
        }
        
        aeo_score = result.get("total_score", 0)
        competitors = result.get("competitors", {})

        # INJECT SCORES INTO BREAKDOWN FOR FRONTEND
        breakdown['technical_score'] = result.get('technical_score', 0)
        breakdown['content_score'] = result.get('content_score', 0)
        breakdown['aeo_score'] = aeo_score 


        print(f"🔍 [Background] Site ID: {site_id}, Supabase Client: {bool(supabase)}")

        if site_id and supabase:
            print(f"💾 [Background] Saving results to DB for site {site_id}...")
            loop = asyncio.get_running_loop()
            
            # Update sites table
            def update_sites():
                print("   > Updating sites table...")
                supabase.table("sites").update({
                    "aeo_score": aeo_score,
                    "health_status": health_status,
                    "competitors": competitors,
                    "status": "completed",
                    "last_scanned_at": datetime.now(timezone.utc).isoformat()
                }).eq("id", site_id).execute()
                print("   > Sites table updated.")

            await loop.run_in_executor(None, update_sites)
            
            # Insert history
            def update_history():
                print("   > Updating history...")
                supabase.table("site_history").insert({
                    "site_id": site_id,
                    "aeo_score": aeo_score
                }).execute()
                print("   > History updated.")

            await loop.run_in_executor(None, update_history)

            # Insert into pages table (Direct SQL to bypass RLS)
            def update_pages():
                print("   > Updating pages (via Direct SQL)...")
                try:
                    db_url = os.getenv("DATABASE_URL")
                    engine = create_engine(db_url)
                    with engine.connect() as conn:
                        query = text("""
                            INSERT INTO pages (site_id, url, checklist, aeo_score, status, last_scanned_at, ip_address, city, country, user_agent)
                            VALUES (:site_id, :url, :checklist, :aeo_score, :status, :last_scanned_at, :ip, :city, :country, :ua)
                        """)
                        conn.execute(query, {
                            "site_id": site_id,
                            "url": url,
                            "checklist": json.dumps(breakdown),
                            "aeo_score": aeo_score,
                            "status": "completed",
                            "last_scanned_at": datetime.now(timezone.utc).isoformat(),
                            "ip": metadata.get("ip") if metadata else None,
                            "city": metadata.get("city") if metadata else None,
                            "country": metadata.get("country") if metadata else None,
                            "ua": metadata.get("ua") if metadata else None
                        })
                        conn.commit()
                    print("   > Pages updated successfully (Direct SQL).")
                except Exception as e:
                    print(f"   > ❌ Pages update failed: {e}")

            await loop.run_in_executor(None, update_pages)
            
            print(f"🎉 [Background] Analysis completed/saved for {url}")
            
    except asyncio.TimeoutError:
        print(f"⏰ [Background] Analysis TIMED OUT for {url} (exceeded 120s)")
        if site_id and supabase:
             supabase.table("sites").update({"status": "error"}).eq("id", site_id).execute()

    except Exception as e:
        print(f"❌ [Background] Analysis FAILED for {url}: {e}")
        import traceback
        traceback.print_exc()
        if site_id and supabase:
             supabase.table("sites").update({"status": "error"}).eq("id", site_id).execute()

@app.delete("/sites/{site_id}")
def delete_site(site_id: str, user: dict = Depends(get_current_user)):
    if not DATABASE_URL:
        raise HTTPException(status_code=500, detail="Database URL not configured")
    
    try:
        engine = create_engine(
            DATABASE_URL,
            poolclass=NullPool,
            connect_args={"connect_timeout": 5},
            pool_pre_ping=True
        )
        with engine.connect() as conn:
            # 0. Check Ownership
            site_check = conn.execute(text("SELECT user_id FROM sites WHERE id = :site_id"), {"site_id": site_id}).fetchone()
            if not site_check:
                 raise HTTPException(status_code=404, detail="Site not found")
            
            # DEBUG LOGGING
            print(f"DEBUG: DELETE SITE - Site ID: {site_id}")
            print(f"DEBUG: Current User: {user}")
            # Handle user object type (dict or Pydantic model)
            current_user_id = user.get("id") if isinstance(user, dict) else getattr(user, "id", None)
            owner_id = site_check[0]
            print(f"DEBUG: Owner ID from DB: {owner_id}")
            print(f"DEBUG: Current User ID: {current_user_id}")
            
            if str(owner_id) != str(current_user_id):
                 print(f"DEBUG: Permission Denied. '{owner_id}' != '{current_user_id}'")
                 raise HTTPException(status_code=403, detail="You do not have permission to delete this site.")

            # Execute deletions in order (Foreign Key constraints)
            # 1. Site History
            conn.execute(text("DELETE FROM site_history WHERE site_id = :site_id"), {"site_id": site_id})
            # 2. Pages
            conn.execute(text("DELETE FROM pages WHERE site_id = :site_id"), {"site_id": site_id})
            # 3. Scheduled Scans
            conn.execute(text("DELETE FROM scheduled_scans WHERE site_id = :site_id"), {"site_id": site_id})
            # 4. Sites
            result = conn.execute(text("DELETE FROM sites WHERE id = :site_id"), {"site_id": site_id})
            
            conn.commit()
            
            # 5. Remove from Scheduler (Critical for Plus/Pro users)
            try:
                scheduler.remove_job(site_id)
                print(f"🗑️ Removed recurring job for site: {site_id}")
            except Exception:
                # Job might not exist
                pass
                
        return {"message": "Site deleted successfully"}
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Delete failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- Scheduler & Notification Logic ---

# Email & Scheduler Setup
MAILTRAP_HOST = os.getenv("MAILTRAP_HOST", "sandbox.smtp.mailtrap.io")
MAILTRAP_PORT = int(os.getenv("MAILTRAP_PORT", "2525"))
MAILTRAP_USERNAME = os.getenv("MAILTRAP_USERNAME")
MAILTRAP_PASSWORD = os.getenv("MAILTRAP_PASSWORD")
ENABLE_EMAIL_NOTIFICATIONS = os.getenv("ENABLE_EMAIL_NOTIFICATIONS", "true").lower() == "true"

def send_email_notification(email: str, subject: str, headline: str, body: str, cta_text: str = None, cta_link: str = None):
    if not email: return
    
    if not ENABLE_EMAIL_NOTIFICATIONS:
        logger.info(f"EMAIL PAUSED: Would have sent to {email}. Subject: {subject}")
        return

    html_content = get_email_html(headline, body, cta_text, cta_link)

    if MAILTRAP_USERNAME and MAILTRAP_PASSWORD:
        try:
            import smtplib
            from email.mime.text import MIMEText
            from email.mime.multipart import MIMEMultipart
            
            msg = MIMEMultipart('alternative')
            msg['From'] = "CheckSite AEO <noreply@checksiteaeo.com>"
            msg['To'] = email
            msg['Subject'] = subject
            
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            with smtplib.SMTP(MAILTRAP_HOST, MAILTRAP_PORT) as server:
                server.starttls()
                server.login(MAILTRAP_USERNAME, MAILTRAP_PASSWORD)
                server.send_message(msg)
            
            logger.info(f"Email sent to {email} via Mailtrap")
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
    else:
        logger.info(f"MOCK EMAIL to {email}: Subject: {subject} | Body: {body}")

async def perform_scheduled_scan(site_id: str, url: str, user_email: str | None, scan_id: str, scan_type: str = "full"):
    print(f"🔥 JOB TRIGGERED: Starting perform_scheduled_scan for {url} (Type: {scan_type})")
    logger.info(f"Starting scheduled scan for {url} (Scan ID: {scan_id})")
    
    # 1. Update status to processing
    if supabase:
        supabase.table("scheduled_scans").update({"status": "processing"}).eq("id", scan_id).execute()

    try:
        llm_provider = "groq"
        llm_model: str | None = None
        owner_user_id: str | None = None
        if supabase and site_id:
            owner_res = (
                supabase.table("sites")
                .select("user_id")
                .eq("id", site_id)
                .limit(1)
                .execute()
            )
            owner_user_id = owner_res.data[0].get("user_id") if owner_res.data else None
            if owner_user_id:
                grant_result = _grant_daily_tokens_if_eligible(owner_user_id)
                was_daily_granted_now = bool(grant_result.get("granted"))
                token_consume_result = _consume_tokens_for_scan(
                    owner_user_id,
                    reason=f"Token usage hold for scheduled scan ({site_id})",
                    prefer_daily_source=was_daily_granted_now,
                    tokens=TOKENS_PER_SCAN,
                )
                if not token_consume_result.get("success"):
                    balance = int(token_consume_result.get("balance") or 0)
                    raise HTTPException(
                        status_code=402,
                        detail=f"Scheduled scan skipped due to insufficient tokens. Need at least {TOKENS_PER_SCAN}, have {balance}.",
                    )
                llm_provider = "groq" if token_consume_result.get("source") == "daily" else "eden"
                if llm_provider == "eden":
                    llm_model = EDEN_DEFAULT_MODEL

        # 1.1 Fetch previous score for delta calculation
        old_score = 0
        if supabase and site_id:
            try:
                prev_data = supabase.table("sites").select("aeo_score").eq("id", site_id).execute()
                logger.info(f"Previous score fetch: data={prev_data.data}")
                if prev_data.data and len(prev_data.data) > 0:
                    old_score = prev_data.data[0].get("aeo_score", 0)
                    logger.info(f"Extracted old_score: {old_score}")
                else:
                    logger.warning(f"No previous data found for site_id={site_id}")
            except Exception as e:
                logger.warning(f"Could not fetch previous score: {e}")

        # 2. Run Analysis
        runtime_tokens = set_llm_runtime(llm_provider, llm_model)
        llm_usage: dict = {}
        try:
            result = await analyze_readiness(url, scan_mode=scan_type)
            llm_usage = get_llm_usage_snapshot()
        finally:
            reset_llm_runtime(runtime_tokens)

        if owner_user_id:
            usage_settlement = _settle_token_usage(
                user_id=owner_user_id,
                held_tokens=TOKENS_PER_SCAN,
                usage=llm_usage,
                reason_prefix=f"Token usage for scheduled scan ({site_id})",
            )
            logger.info(f"Scheduled scan token settlement: {usage_settlement}")

        new_score = result.get("total_score", 0)
        delta = new_score - old_score
        
        logger.info(f"Score Calculation: old={old_score}, new={new_score}, delta={delta}")
        
        # 3. Update Site Data (Reusing logic from analyze_url, ideally refactor to shared func)
        if site_id and supabase:
             breakdown = result.get("breakdown", {})
             tech_rob = breakdown.get("technical", {}).get("robots", {}).get("score", 0)
             tech_sch = breakdown.get("technical", {}).get("schema", {}).get("score", 0)
             cont_scs = [v.get("score", 0) for v in breakdown.get("content", {}).values() if isinstance(v, dict)]
             cont_avg = sum(cont_scs) / len(cont_scs) if cont_scs else 0
             
             health = {
                 "robots": get_status(tech_rob),
                 "schema": get_status(tech_sch),
                 "content": get_status(int(cont_avg))
             }
             
             supabase.table("sites").update({
                 "aeo_score": new_score,
                 "health_status": health,
                 "competitors": result.get("competitors", {}),
                 "last_scanned_at": datetime.now(timezone.utc).isoformat()
             }).eq("id", site_id).execute()
             
             supabase.table("site_history").insert({
                "site_id": site_id,
                "aeo_score": new_score
             }).execute()
             
             # Insert into pages for Frontend Details
             supabase.table("pages").insert({
                "site_id": site_id,
                "url": url,
                "checklist": breakdown,
                "aeo_score": new_score,
                "last_scanned_at": datetime.now(timezone.utc).isoformat()
             }).execute()

        # 4. Success Status
        if supabase:
            supabase.table("scheduled_scans").update({"status": "completed"}).eq("id", scan_id).execute()
        
        # 5. Notify
        if user_email:
            if delta > 0:
                # Score improved
                headline = "🎉 Your AEO Score Improved!"
                body = f"Great news! Your AEO Score for <strong>{url}</strong> has increased to <strong>{new_score}/100</strong> (up {delta} points!).<br><br>Your optimizations are working. Log in to see what's driving your success."
            elif delta < 0:
                # Score decreased
                headline = "⚠️ Your AEO Score Decreased"
                body = f"Your AEO Score for <strong>{url}</strong> has dropped to <strong>{new_score}/100</strong> (down {abs(delta)} points).<br><br>Don't worry—check your dashboard for specific recommendations to get back on track."
            else:
                # No change
                headline = "✅ Your AEO Score Remains Stable"
                body = f"Your AEO Score for <strong>{url}</strong> is holding steady at <strong>{new_score}/100</strong>.<br><br>Ready to improve? Check your dashboard for actionable suggestions to boost your visibility."
            
            send_email_notification(
                user_email, 
                f"AEO Scan Complete for {url}",
                headline,
                body,
                "View Dashboard",
                f"https://checksiteaeo.com/dashboard/sites/{site_id}"
            )

    except Exception as e:
        logger.error(f"Scheduled scan failed: {e}")
        if supabase:
            supabase.table("scheduled_scans").update({"status": "failed", "error": str(e)}).eq("id", scan_id).execute()
        
        if user_email:
            send_email_notification(
                user_email, 
                f"AEO Scan Failed for {url}", 
                "Scan Unable to Complete",
                f"We encountered an error while scanning {url}. Please try again later.<br>Error details: {str(e)}"
            )


class ScheduleRequest(BaseModel):
    site_id: str
    url: HttpUrl
    email: EmailStr | None = None
    delay_hours: int | None = None
    delay_minutes: int | None = None
    scan_type: str | None = "full" # 'full', 'answers', 'sov'

class CancelScanRequest(BaseModel):
    site_id: str

@app.post("/cancel-scan")
async def cancel_scan(
    request: CancelScanRequest,
    user: dict = Depends(get_current_user)
):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not initialized")
    
    user_id = _get_user_id(user)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    try:
        # Ensure user owns the site
        site_res = supabase.table("sites").select("id").eq("id", request.site_id).eq("user_id", user_id).execute()
        if not site_res.data:
            raise HTTPException(status_code=403, detail="You do not have permission to manage this site.")

        # 1. Look for pending/processing job in DB
        existing = supabase.table("scheduled_scans").select("*") \
            .eq("site_id", request.site_id) \
            .in_("status", ["pending", "processing"]) \
            .execute()
        
        if not existing.data or len(existing.data) == 0:
            return {"message": "No active scan found for this site."}
        
        scan_id = existing.data[0]['id']
        
        # 2. Update Supabase status
        supabase.table("scheduled_scans").update({"status": "cancelled"}).eq("id", scan_id).execute()
        
        # 3. Remove from APScheduler
        try:
            scheduler.remove_job(request.site_id)
        except:
            # Maybe it wasn't there or had a different ID
            pass
            
        return {"message": "Scan cancelled successfully."}
    except Exception as e:
        logger.error(f"Failed to cancel scan: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/schedule-scan")
async def schedule_scan(
    request: ScheduleRequest, 
    user: dict = Depends(get_current_user)
):
    user_id = _get_user_id(user)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    # Plus/Pro feature gate
    _require_tier(user_id, {"plus", "pro"}, "Weekly monitoring")

    # Ensure user owns the site
    if supabase and request.site_id:
        owned_site = supabase.table("sites").select("id").eq("id", request.site_id).eq("user_id", user_id).execute()
        if not owned_site.data:
            raise HTTPException(status_code=403, detail="You do not have permission to schedule scans for this site.")

    # Check for existing pending scan
    if supabase and request.site_id:
        try:
            existing = supabase.table("scheduled_scans").select("*") \
                .eq("site_id", request.site_id) \
                .in_("status", ["pending", "processing"]) \
                .execute()
            if existing.data and len(existing.data) > 0:
                raise HTTPException(status_code=409, detail="A deep scan is already scheduled or in progress for this site.")
        except HTTPException as he:
            raise he
        except Exception as e:
            logger.error(f"Failed to check existing scans: {e}")

    # Determine interval for recurring scans
    if request.delay_minutes is not None:
        interval_minutes = request.delay_minutes
        interval_hours = None
    else:
        interval_minutes = None
        interval_hours = request.delay_hours if request.delay_hours is not None else 24
    
    # Calculate first run time (same as before for initial delay)
    if interval_minutes:
        run_date = datetime.now(timezone.utc) + timedelta(minutes=interval_minutes)
        formatted_date = run_date.strftime("%A, %B %d at %I:%M %p UTC")
    else:
        run_date = datetime.now(timezone.utc) + timedelta(hours=interval_hours)
        formatted_date = run_date.strftime("%A, %B %d at %I:%M %p UTC")

    # Persist schedule
    scan_id = None
    if supabase:
        try:
            payload = {
                "site_id": request.site_id,
                "url": str(request.url),
                "user_email": request.email,
                "scheduled_for": run_date.isoformat(),
                "status": "pending"
            }
            
            data = supabase.table("scheduled_scans").insert(payload).execute()
            
            if data.data:
                scan_id = data.data[0]['id']
        except Exception as e:
            logger.error(f"Failed to insert scheduled scan: {e}")
            pass
    else:
        logger.warning("Supabase client is not initialized. Skipping DB persistence.")

    # Schedule Job
    safe_scan_id = scan_id or "temp_id"
    
    # Send immediate confirmation email
    if request.email:
        send_email_notification(
            request.email,
            f"Deep Scan Scheduled: {request.url}",
            "Deep Scan Scheduled Successfully",
            f"We have scheduled a comprehensive AEO analysis for <strong>{request.url}</strong>.<br><br>The scan will execute automatically on <strong>{formatted_date}</strong>. You don't need to keep your browser open, we'll notify you when it's done.",
            "Go to Dashboard",
            "https://checksiteaeo.com/dashboard"
        )

    print(f"🕐 SCHEDULING RECURRING JOB: interval={interval_minutes}m or {interval_hours}h, site_id={request.site_id}")
    
    # Use interval trigger for recurring scans
    if interval_minutes:
        scheduler.add_job(
            perform_scheduled_scan, 
            'interval', 
            minutes=interval_minutes,
            args=[request.site_id, str(request.url), request.email, safe_scan_id, request.scan_type or "full"],
            id=request.site_id,
            replace_existing=True,
            next_run_time=run_date,  # First run at the calculated time
            misfire_grace_time=3600
        )
    else:
        scheduler.add_job(
            perform_scheduled_scan, 
            'interval', 
            hours=interval_hours,
            args=[request.site_id, str(request.url), request.email, safe_scan_id, request.scan_type or "full"],
            id=request.site_id,
            replace_existing=True,
            next_run_time=run_date,
            misfire_grace_time=3600
        )
    
    # Debug: List all jobs
    print("📋 ALL SCHEDULED JOBS:")
    for job in scheduler.get_jobs():
        print(f"  → {job.id} | {job.name} | Next Run: {job.next_run_time}")
    
    return {
        "message": f"Recurring scan enabled. First scan: {formatted_date}, then every {interval_minutes or (interval_hours * 60)} minutes", 
        "scan_id": scan_id,
        "next_run_time": run_date.isoformat()
    }

class PlanRequest(BaseModel):
    user_domain: str
    competitor_domain: str

@app.post("/generate-plan")
async def generate_plan(request: PlanRequest, user: dict = Depends(get_current_user)):
    user_id = _get_user_id(user)
    _require_tier(user_id, {"pro"}, "Competitor analysis")
    plan = await generate_content_strategy(request.user_domain, request.competitor_domain)
    return plan

class AnswerPlanRequest(BaseModel):
    user_domain: str

@app.post("/generate-answer-plan")
async def generate_answer_plan(request: AnswerPlanRequest, user: dict = Depends(get_current_user)):
    user_id = _get_user_id(user)
    _require_tier(user_id, {"plus", "pro"}, "Content optimization tools")
    plan = await generate_answer_strategy(request.user_domain)
    return plan
@app.post("/analyze-ambiguity")
async def analyze_ambiguity(request: AnswerPlanRequest, user: dict = Depends(get_current_user)): # Reusing AnswerPlanRequest which has user_domain
    user_id = _get_user_id(user)
    _require_tier(user_id, {"plus", "pro"}, "Ambiguity Inspector")
    # Fetch content
    url = request.user_domain
    if not url.startswith("http"): url = "https://" + url
    
    try:
        import httpx
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            page = await client.get(url)
            if page.status_code == 200:
                from bs4 import BeautifulSoup
                soup = BeautifulSoup(page.text, "html.parser")
                text = soup.get_text(separator=' ', strip=True)
                return await analyze_ambiguity_issues(text)
    except Exception as e:
        print(f"Ambiguity analysis failed: {e}")
        pass
        
    return {"improvements": []}

class ContactRequest(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    message: str = Field(..., min_length=1, max_length=1000)

@app.post("/contact")
async def contact_form(request: ContactRequest):
    if not RESEND_API_KEY:
        # Fallback if no API key
        print(f"MOCK CONTACT FORM: {request}")
        return {"message": "Message received (Mock)"}

    try:
        subject = f"New Contact: {request.first_name} {request.last_name}"
        html_content = f"""
        <h1>New Contact Form Submission</h1>
        <p><strong>Name:</strong> {request.first_name} {request.last_name}</p>
        <p><strong>Email:</strong> {request.email}</p>
        <p><strong>Message:</strong></p>
        <div style="background:#f4f4f4; padding:15px; border-radius:10px;">
            {request.message}
        </div>
        """
        
        # Using the verified sender or default
        sender_email = "CheckSite AEO <noreply@checksiteaeo.com>"
        # Note: If domain isn't verified in Resend, this might fail unless using 'onboarding@resend.dev'
        # I'll default to a safe value or the user's config if evident, but 'noreply' is standard.
        # Ideally, we check if the user has a specific sender. I'll use a generic one.
        
        r = resend.Emails.send({
            "from": sender_email,
            "to": "mathewsteven1996@gmail.com",
            "subject": subject,
            "html": html_content
        })
        return {"message": "Message sent successfully", "id": r.get("id")}
    except Exception as e:
        logger.error(f"Failed to send contact email: {e}")
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import UploadFile, File, Form

@app.post("/careers/apply")
async def apply_career(
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    job_title: str = Form(...),
    cover_letter: str | None = Form(None),
    resume: UploadFile = File(...)
):
    print(f"Received application for {job_title} from {first_name} {last_name}")
    
    if not RESEND_API_KEY:
        print("MOCK APPLICATION: Email not sent (No API Key)")
        return {"message": "Application received (Mock)"}

    try:
        subject = f"New Job Application: {job_title} - {first_name} {last_name}"
        html_content = f"""
        <h1>New Job Application</h1>
        <p><strong>Position:</strong> {job_title}</p>
        <p><strong>Applicant:</strong> {first_name} {last_name}</p>
        <p><strong>Email:</strong> {email}</p>
        
        <h3>Cover Letter</h3>
        <div style="background:#f4f4f4; padding:15px; border-radius:10px; white-space: pre-wrap;">
            {cover_letter or "No cover letter provided."}
        </div>
        """
        
        # Read file content for attachment
        file_content = await resume.read()
        attachment = {
            "filename": resume.filename,
            "content": list(file_content) # Resend python sdk expects list of integers for bytes? OR raw bytes. 
            # documentation says: content: list[int] | str. 
            # Let's try passing list(file_content) to be safe for binary.
        }

        # Actually Resend Python SDK (v0.x) usually takes 'content' as a list of integers if it's binary data
        # Wait, let's double check Resend python docs or standard usage.
        # Usually for simple integration we can try list(file_content).
        
        r = resend.Emails.send({
            "from": "CheckSite Careers <onboarding@resend.dev>",
            "to": "mathewsteven1996@gmail.com",
            "subject": subject,
            "html": html_content,
            "attachments": [attachment]
        })
        
        return {"message": "Application sent successfully", "id": r.get("id")}
    except Exception as e:
        logger.error(f"Failed to send application email: {e}")
        # In case of list(bytes) error, fallback or specific error handling might be needed.
        # But for now assuming Resend SDK handles it.
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/token-usage")
async def token_usage(user: dict = Depends(get_current_user)):
    user_id = _get_user_id(user)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    summary = _get_token_summary(user_id)
    today_utc = datetime.now(timezone.utc).date().isoformat()
    last_grant = summary.get("daily_free_tokens_last_granted_at")
    can_claim_daily_free = last_grant != today_utc

    return {
        "token_balance": summary.get("token_balance", 0),
        "daily_free_tokens": DAILY_FREE_TOKENS,
        "tokens_per_scan": TOKENS_PER_SCAN,
        "tokens_per_chat": TOKENS_PER_CHAT,
        "total_tokens_used": summary.get("total_tokens_used", 0),
        "total_tokens_purchased": summary.get("total_tokens_purchased", 0),
        "daily_free_tokens_last_granted_at": last_grant,
        "can_claim_daily_free": can_claim_daily_free,
    }

def _eden_headers() -> dict:
    return {
        "Authorization": f"Bearer {EDEN_API_KEY}",
        "Content-Type": "application/json",
    }


def _extract_content_from_eden_response(payload: dict) -> str:
    choices = payload.get("choices", [])
    if not choices:
        return ""
    choice = choices[0]
    message = choice.get("message", {})
    if message.get("content"):
        return message["content"]
    delta = choice.get("delta", {})
    if delta.get("content"):
        return delta["content"]
    return ""


def _extract_usage_from_eden_response(payload: dict | None) -> dict:
    if not isinstance(payload, dict):
        return {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}

    usage = payload.get("usage")
    if not isinstance(usage, dict):
        usage = {}

    prompt_tokens = usage.get("prompt_tokens", usage.get("input_tokens", 0))
    completion_tokens = usage.get("completion_tokens", usage.get("output_tokens", 0))
    total_tokens = usage.get("total_tokens", 0)

    try:
        prompt_tokens = max(int(prompt_tokens or 0), 0)
    except (TypeError, ValueError):
        prompt_tokens = 0
    try:
        completion_tokens = max(int(completion_tokens or 0), 0)
    except (TypeError, ValueError):
        completion_tokens = 0
    try:
        total_tokens = max(int(total_tokens or 0), 0)
    except (TypeError, ValueError):
        total_tokens = 0

    if total_tokens <= 0:
        total_tokens = prompt_tokens + completion_tokens

    return {
        "prompt_tokens": prompt_tokens,
        "completion_tokens": completion_tokens,
        "total_tokens": total_tokens,
    }


def _extract_content_from_eden_sse(raw_text: str) -> str:
    parts: list[str] = []
    for raw_line in raw_text.splitlines():
        line = raw_line.strip()
        if not line.startswith("data:"):
            continue
        data_part = line[len("data:"):].strip()
        if data_part == "[DONE]":
            break
        try:
            event = json.loads(data_part)
        except json.JSONDecodeError:
            continue
        content = _extract_content_from_eden_response(event)
        if content:
            parts.append(content)
    return "".join(parts).strip()


async def _eden_chat_completion(messages: list[dict], model: str, temperature: float = 0.2) -> dict:
    if not EDEN_API_KEY:
        raise HTTPException(status_code=500, detail="Eden API is not configured")

    endpoint = f"{EDEN_API_BASE_URL.rstrip('/')}/v3/llm/chat/completions"
    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "stream": False,
    }

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(endpoint, headers=_eden_headers(), json=payload)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPStatusError as e:
        detail = e.response.text[:400] if e.response is not None else str(e)
        raise HTTPException(status_code=502, detail=f"Eden API error: {detail}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Eden request failed: {e}")

    content = _extract_content_from_eden_response(data)
    usage = _extract_usage_from_eden_response(data)

    if not content:
        raise HTTPException(status_code=502, detail="Eden returned an empty response")

    return {"content": content, "usage": usage}


EDEN_MODEL_OPTIONS = [
    {"id": "openai/gpt-4o-mini", "label": "ChatGPT"},
    {"id": "anthropic/claude-3-5-sonnet", "label": "Claude"},
    {"id": "google/gemini-2.0-flash", "label": "Gemini"},
    {"id": "meta/llama-3.3-70b", "label": "Llama"},
    {"id": "xai/grok-2-latest", "label": "Grok"},
    {"id": "mistral/mistral-large-latest", "label": "Mistral"},
    {"id": "deepseek/deepseek-chat", "label": "DeepSeek"},
    {"id": "cohere/command-r-plus", "label": "Command"},
    {"id": "amazon/ai21.jamba-1-5-large-v1:0", "label": "Jamba"},
]
EDEN_ALLOWED_MODEL_IDS = {entry["id"] for entry in EDEN_MODEL_OPTIONS}


async def _fetch_eden_models() -> list[dict]:
    return EDEN_MODEL_OPTIONS


@app.get("/eden-models")
async def eden_models(user: dict = Depends(get_current_user)):
    _ = _get_user_id(user)
    models = await _fetch_eden_models()
    return {"models": models}


class SiteChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1, max_length=4000)


class SiteModelChatRequest(BaseModel):
    site_id: str
    model: str = Field(..., min_length=3, max_length=120)
    messages: list[SiteChatMessage] = Field(..., min_length=1, max_length=30)
    temperature: float = Field(default=0.2, ge=0.0, le=1.0)


@app.post("/site-model-chat")
async def site_model_chat(
    payload: SiteModelChatRequest,
    user: dict = Depends(get_current_user),
):
    user_id = _get_user_id(user)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    if payload.model not in EDEN_ALLOWED_MODEL_IDS:
        raise HTTPException(status_code=400, detail="Unsupported model selection")

    grant_result = _grant_daily_tokens_if_eligible(user_id)
    was_daily_granted_now = bool(grant_result.get("granted"))
    chat_hold_result = _consume_tokens_for_scan(
        user_id=user_id,
        reason="Token usage hold for site chat",
        prefer_daily_source=was_daily_granted_now,
        tokens=TOKENS_PER_CHAT,
    )
    if not chat_hold_result.get("success"):
        remaining_balance = int(chat_hold_result.get("balance") or 0)
        raise HTTPException(
            status_code=402,
            detail=f"Insufficient tokens. Chat requires at least {TOKENS_PER_CHAT} token(s), and you currently have {remaining_balance}.",
        )

    site_response = (
        supabase.table("sites")
        .select("id, user_id, url, name, aeo_score, last_scanned_at")
        .eq("id", payload.site_id)
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    if not site_response.data:
        raise HTTPException(status_code=404, detail="Site not found")

    site = site_response.data[0]
    page_response = (
        supabase.table("pages")
        .select("checklist, aeo_score, last_scanned_at")
        .eq("site_id", payload.site_id)
        .order("last_scanned_at", desc=True)
        .limit(1)
        .execute()
    )
    latest_page = page_response.data[0] if page_response.data else {}
    checklist = latest_page.get("checklist") or {}

    site_context = {
        "site_name": site.get("name") or site.get("url"),
        "site_url": site.get("url"),
        "aeo_score": latest_page.get("aeo_score") or site.get("aeo_score"),
        "technical_score": checklist.get("technical_score"),
        "content_score": checklist.get("content_score"),
        "authority_score": checklist.get("authority_score"),
        "last_scanned_at": latest_page.get("last_scanned_at") or site.get("last_scanned_at"),
        "top_competitors": (checklist.get("competitors") or {}).get("top_competitors", []),
    }

    system_prompt = f"""
You are an AI assistant for CheckSiteAEO.
You must ONLY answer questions related to this specific site's AEO, SEO, and GEO strategy/performance.
If the user asks about anything unrelated to AEO/SEO/GEO for this site, politely refuse and redirect to those topics.
Be practical, concise, and actionable.
Do not invent facts. If data is missing, say so clearly.

SITE CONTEXT (trusted):
{json.dumps(site_context, ensure_ascii=True)}
""".strip()

    safe_messages = [{"role": m.role, "content": m.content.strip()} for m in payload.messages if m.content.strip()]
    if not safe_messages:
        raise HTTPException(status_code=400, detail="No valid chat messages provided")
    safe_messages = safe_messages[-20:]

    eden_messages = [{"role": "system", "content": system_prompt}] + safe_messages
    completion = await _eden_chat_completion(
        messages=eden_messages,
        model=payload.model,
        temperature=payload.temperature,
    )
    eden_usage = completion.get("usage", {})
    usage_fallback = max(
        TOKENS_PER_CHAT,
        _estimate_tokens_from_messages(eden_messages) + _estimate_tokens_from_text(completion.get("content")),
    )
    chat_usage_settlement = _settle_token_usage(
        user_id=user_id,
        held_tokens=TOKENS_PER_CHAT,
        usage=eden_usage,
        reason_prefix=f"Token usage for site chat ({payload.site_id})",
        fallback_total_tokens=usage_fallback,
    )

    return {
        "reply": completion["content"],
        "model": payload.model,
        "site_context": site_context,
        "token_usage": chat_usage_settlement,
    }

# --- Stripe Integration ---

class CheckoutRequest(BaseModel):
    pack_id: str  # 'starter' | 'growth' | 'scale'
    email: str | None = None
    user_id: str | None = None

def _normalize_origin(url: str | None) -> str | None:
    if not url:
        return None
    parsed = urlparse(url.strip())
    if parsed.scheme in {"http", "https"} and parsed.netloc:
        return f"{parsed.scheme}://{parsed.netloc}"
    return None

def _resolve_frontend_base_url(http_request: Request) -> str:
    configured_app_url = _normalize_origin(os.getenv("NEXT_PUBLIC_APP_URL")) or _normalize_origin(os.getenv("APP_URL"))
    allowed_origins = {
        origin
        for origin in (_normalize_origin(value) for value in ALLOWED_ORIGINS)
        if origin
    }

    request_origin = _normalize_origin(http_request.headers.get("origin"))
    referer_origin = _normalize_origin(http_request.headers.get("referer"))
    header_origin = request_origin or referer_origin

    if header_origin and header_origin in allowed_origins:
        return header_origin
    if configured_app_url:
        return configured_app_url
    return "http://localhost:3000"

@app.post("/create-checkout-session")
async def create_checkout_session(payload: CheckoutRequest, http_request: Request):
    if not STRIPE_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Stripe is not configured")

    selected_pack = TOKEN_PACKS.get(payload.pack_id)
    if not selected_pack:
        raise HTTPException(status_code=400, detail="Invalid token pack selected")

    price_id = selected_pack.get("price_id")
    token_amount = int(selected_pack.get("tokens", 0))
    if not price_id:
        raise HTTPException(status_code=500, detail=f"Stripe price is not configured for pack '{payload.pack_id}'")

    try:
        frontend_base_url = _resolve_frontend_base_url(http_request)
        
        # Check for existing customer ID
        customer_kwargs = {}
        if payload.user_id:
             try:
                profile = supabase.table("profiles").select("stripe_customer_id").eq("id", payload.user_id).single().execute()
                if profile.data and profile.data.get("stripe_customer_id"):
                    customer_kwargs["customer"] = profile.data.get("stripe_customer_id")
                    # When providing customer, we cannot provide customer_email
                    # But we can update the email if needed? Stripe handles this.
             except Exception:
                 pass # User might not exist or no customer ID yet
        
        if "customer" not in customer_kwargs and payload.email:
            customer_kwargs["customer_email"] = payload.email

        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price': price_id,
                    'quantity': 1,
                },
            ],
            mode='payment',
            invoice_creation={"enabled": True},
            success_url=frontend_base_url + "/dashboard/billing?payment=success",
            cancel_url=frontend_base_url + "/dashboard/billing?payment=cancelled",
            metadata={
                "pack_id": payload.pack_id,
                "token_amount": str(token_amount),
                "user_id": payload.user_id or "",
            },
            allow_promotion_codes=True,
            **customer_kwargs
        )
        return {"url": checkout_session.url}
    except Exception as e:
        logger.error(f"Stripe checkout creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/create-portal-session")
async def create_portal_session(http_request: Request, user: dict = Depends(get_current_user)):
    if not STRIPE_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Stripe is not configured")

    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        # Get user's stripe_customer_id
        # Expecting user to be an object (Supabase User), not a dict
        user_id = user.id if hasattr(user, "id") else user.get("id")
        
        profile_response = supabase.table("profiles").select("stripe_customer_id").eq("id", user_id).single().execute()
        
        stripe_customer_id = None
        if profile_response.data:
            stripe_customer_id = profile_response.data.get("stripe_customer_id")
        
        if not stripe_customer_id:
             raise HTTPException(status_code=400, detail="No billing account found for this user.")

        frontend_base_url = _resolve_frontend_base_url(http_request)
        return_url = f"{frontend_base_url}/dashboard/billing"

        portal_session = stripe.billing_portal.Session.create(
            customer=stripe_customer_id,
            return_url=return_url,
        )
        return {"url": portal_session.url}
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Stripe portal session creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        # Invalid payload
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        await handle_checkout_completed(session)
    
    return {"status": "success"}

async def handle_checkout_completed(session):
    customer_email = session.get('customer_details', {}).get('email')
    metadata = session.get('metadata', {}) or {}
    pack_id = metadata.get('pack_id')
    token_amount_raw = metadata.get('token_amount')
    stripe_customer_id = session.get('customer')
    stripe_session_id = session.get('id')
    user_id = metadata.get('user_id') or None

    token_amount = 0
    try:
        token_amount = int(token_amount_raw) if token_amount_raw else 0
    except (TypeError, ValueError):
        token_amount = 0

    if token_amount <= 0 and pack_id in TOKEN_PACKS:
        token_amount = int(TOKEN_PACKS[pack_id].get("tokens", 0))

    print(
        f"💰 Payment received for {customer_email} - Pack: {pack_id} "
        f"- Tokens: {token_amount} - User ID: {user_id}"
    )

    if supabase:
        try:
            if stripe_session_id:
                existing_tx = (
                    supabase.table("token_transactions")
                    .select("id")
                    .eq("stripe_session_id", stripe_session_id)
                    .limit(1)
                    .execute()
                )
                if existing_tx.data:
                    print(f"   > Stripe session {stripe_session_id} already processed. Skipping.")
                    return

            if not user_id and customer_email:
                profile_by_email = (
                    supabase.table("profiles")
                    .select("id")
                    .eq("email", customer_email)
                    .limit(1)
                    .execute()
                )
                if profile_by_email.data:
                    user_id = profile_by_email.data[0].get("id")

            if not user_id:
                logger.error("Unable to resolve user for token credit (missing user_id and email lookup failed).")
                return

            if stripe_customer_id:
                supabase.table("profiles").update({
                    "stripe_customer_id": stripe_customer_id
                }).eq("id", user_id).execute()

            if token_amount <= 0:
                logger.error(f"Invalid token amount in checkout session {stripe_session_id}: {token_amount}")
                return

            credit_result = _credit_user_tokens(
                user_id=user_id,
                tokens=token_amount,
                description=f"Stripe token purchase ({pack_id or 'custom'})",
                transaction_type="purchase",
                stripe_session_id=stripe_session_id,
                metadata={
                    "pack_id": pack_id,
                    "customer_email": customer_email,
                },
            )

            if credit_result.get("success"):
                print(f"   > ✅ Credited {token_amount} tokens to user {user_id}.")
            else:
                logger.error(f"Token credit failed for user {user_id}. Result: {credit_result}")
        except Exception as e:
            logger.error(f"Failed to process token checkout in DB: {e}")

# --- Site Verification Endpoints ---

class InitiateVerificationRequest(BaseModel):
    url: str
    name: str = ""

@app.post("/initiate-verification")
async def initiate_verification(
    request: InitiateVerificationRequest,
    user: dict = Depends(get_current_user)
):
    """
    Creates a site entry with status='unverified' and returns a unique token.
    If site exists, returns existing token.
    """
    import uuid
    from urllib.parse import urlparse

    # Normalize URL
    parsed = urlparse(request.url)
    if not parsed.scheme:
        request.url = f"https://{request.url}"
    
    domain = urlparse(request.url).netloc
    
    # --- ENFORCE SITE LIMITS ---
    # Get current site count for the account.
    # count='exact' is efficient
    sites_res = supabase.table("sites").select("*", count="exact").eq("user_id", user.id).execute()
    current_count = sites_res.count if sites_res.count is not None else len(sites_res.data)
    
    # Token model uses a single site limit for all users.
    MAX_SITES = MAX_SITES_PER_USER
    
    # --- END LIMIT CHECK ---
    
    # Check if site ALREADY exists (Global Check)
    # We first check if ANYONE owns this site
    existing_global = supabase.table("sites").select("*").eq("url", request.url).execute()

    if existing_global.data:
        site = existing_global.data[0]
        
        # If site exists and is owned by SOMEONE ELSE
        if site["user_id"] != user.id:
            raise HTTPException(status_code=400, detail="This site has already been added by another account.")
            
        # If matches current user, return existing token (allow re-verification)
        if site.get("verified_at"):
             return {"message": "Site already verified", "site_id": site["id"], "verified": True}
        
        token = site.get("verification_token")
        if not token:
             token = str(uuid.uuid4())
             supabase.table("sites").update({"verification_token": token}).eq("id", site["id"]).execute()
             
        return {
            "site_id": site["id"],
            "token": token,
            "filename": "checksite-verification.txt",
            "verified": False
        }

    # Site does not exist globally. This is a NEW site.
    # Enforce Limit Check here
    if current_count >= MAX_SITES:
        raise HTTPException(
            status_code=403, 
            detail=f"Site limit reached. You can only add {MAX_SITES} sites on your account."
        )

    # Create new
    token = str(uuid.uuid4())
    new_site = {
        "user_id": user.id,
        "url": request.url,
        "name": request.name or domain,
        "status": "unverified",
        "verification_token": token
    }
    
    res = supabase.table("sites").insert(new_site).execute()
    if res.data:
         return {
            "site_id": res.data[0]["id"],
            "token": token,
            "filename": "checksite-verification.txt",
            "verified": False
        }
    
    raise HTTPException(status_code=500, detail="Failed to create site")

class VerifyOwnershipRequest(BaseModel):
    site_id: str

@app.post("/verify-ownership")
async def verify_ownership(
    request: VerifyOwnershipRequest,
    user: dict = Depends(get_current_user)
):
    """
    Checks for the presence of checksite-verification.txt containing the token.
    """
    import httpx
    from urllib.parse import urljoin
    
    # Get Site
    site_res = supabase.table("sites").select("*").eq("id", request.site_id).eq("user_id", user.id).execute()
    if not site_res.data:
        raise HTTPException(status_code=404, detail="Site not found")
        
    site = site_res.data[0]
    if site.get("verified_at"):
        return {"success": True, "message": "Already verified"}
        
    token = site.get("verification_token")
    if not token:
        raise HTTPException(status_code=400, detail="No verification token found for this site.")
        
    # Check File
    file_url = urljoin(site["url"], "/checksite-verification.txt")
    print(f"Verifying ownership: Checking {file_url} for token {token}...")
    
    # DEV BYPASS
    if os.getenv("DEV_MODE_BYPASS_VERIFICATION") == "true":
        print(f"⚠️ [DEV] Bypassing verification check for {file_url}")
        now = datetime.now(timezone.utc).isoformat()
        supabase.table("sites").update({
            "verified_at": now,
            "status": "pending"
        }).eq("id", request.site_id).execute()
        return {"success": True, "message": "Verification bypassed (DEV MODE)."}

    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            resp = await client.get(file_url)
            
        if resp.status_code == 200:
            content = resp.text.strip()
            if token in content:
                # Success!
                now = datetime.now(timezone.utc).isoformat()
                supabase.table("sites").update({
                    "verified_at": now,
                    "status": "pending" # Ready for scan
                }).eq("id", request.site_id).execute()
                
                return {"success": True, "message": "Verification successful!"}
            else:
                raise HTTPException(status_code=400, detail="File found, but the token inside did not match.")
        
        elif resp.status_code == 404:
             raise HTTPException(status_code=400, detail="Verification file not found. Please ensure it is uploaded to the root directory.")
             
        else:
             raise HTTPException(status_code=400, detail=f"Could not verify. Server returned HTTP {resp.status_code}")
             
    except httpx.RequestError as e:
        raise HTTPException(status_code=400, detail=f"Network error verification: {str(e)}")
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Verification failed: {e}")
        raise HTTPException(status_code=500, detail="Verification process failed.")

# --- Admin Stats Endpoint ---
ADMIN_SECRET_KEY = os.getenv("ADMIN_SECRET_KEY", "checksite-admin-123")
from fastapi import Header

@app.get("/admin/stats")
async def get_admin_stats(x_admin_secret: str = Header(None, alias="x-admin-secret")):
    if x_admin_secret != ADMIN_SECRET_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    try:
        # Total Users
        users_count_res = supabase.table("profiles").select("id", count="exact").limit(1).execute()
        total_users = getattr(users_count_res, 'count', len(users_count_res.data))

        # Total Sites (Projects)
        sites_res = supabase.table("sites").select("id", count="exact").limit(1).execute()
        total_sites = getattr(sites_res, 'count', len(sites_res.data))
        
        # Total Pages/Scans run
        scans_res = supabase.table("pages").select("id", count="exact").limit(1).execute()
        total_scans = getattr(scans_res, 'count', len(scans_res.data))

        # Total Landing Page Scans (sites named "Anonymous Scan")
        anon_sites_res = supabase.table("sites").select("id", count="exact").eq("name", "Anonymous Scan").execute()
        landing_page_scans = getattr(anon_sites_res, 'count', len(anon_sites_res.data))

        # Recent Users (with email from profiles)
        recent_users_res = supabase.table("profiles").select("id, email, created_at, subscription_tier").order("created_at", desc=True).limit(5).execute()
        recent_users = recent_users_res.data
        
        # Identify All Anonymous Site IDs
        anon_sites_query = supabase.table("sites").select("id").eq("name", "Anonymous Scan").execute()
        anon_site_ids = [s["id"] for s in anon_sites_query.data]
        
        # Recent Scans (Logged-In Users) - Pull from pages table and join with sites/profiles
        # Since Supabase join syntax for 3 levels is complex, we fetch pages and map
        recent_pages_res = supabase.table("pages").select("id, url, status, last_scanned_at, aeo_score, site_id, ip_address, city, country, user_agent").order("last_scanned_at", desc=True).limit(50).execute()
        
        recent_sites = []
        landing_page_scans_data = []
        
        for p in recent_pages_res.data:
            sid = p["site_id"]
            is_anon = sid in anon_site_ids
            
            item = {
                "id": p["id"],
                "url": p["url"],
                "status": p.get("status", "completed"),
                "created_at": p["last_scanned_at"],
                "aeo_score": p["aeo_score"],
                "ip": p.get("ip_address"),
                "city": p.get("city"),
                "country": p.get("country"),
                "ua": p.get("user_agent")
            }
            
            if is_anon:
                if len(landing_page_scans_data) < 20:
                    landing_page_scans_data.append(item)
            else:
                if len(recent_sites) < 20:
                    # Enrich with User Email
                    site_data = supabase.table("sites").select("user_id").eq("id", sid).single().execute()
                    if site_data.data:
                        user_id = site_data.data["user_id"]
                        profile_data = supabase.table("profiles").select("email").eq("id", user_id).single().execute()
                        if profile_data.data:
                            item["user_email"] = profile_data.data["email"]
                    recent_sites.append(item)

        return {
            "total_users": total_users,
            "total_sites": total_sites,
            "total_scans": total_scans,
            "landing_page_urls_scanned": landing_page_scans,
            "recent_users": recent_users,
            "recent_sites": recent_sites,
            "recent_landing_page_scans": landing_page_scans_data
        }
    except Exception as e:
        logger.error(f"Failed to fetch admin stats: {e}")
        raise HTTPException(status_code=500, detail="Database Error")
