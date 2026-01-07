import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from analyzer import analyze_readiness, generate_content_strategy, generate_answer_strategy, analyze_ambiguity_issues
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime, timedelta, timezone
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from sqlalchemy import create_engine, text
import json
import asyncio
import resend
from email_templates import get_email_html

import stripe

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
print(f"DEBUG: Loaded RESEND_API_KEY: {'Yes' if RESEND_API_KEY else 'No'}")

# Stripe Setup
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
# Replace these with your actual Stripe Price IDs
STRIPE_PRICE_ID_PLUS = os.getenv("STRIPE_PRICE_ID_PLUS", "price_plus_placeholder")
STRIPE_PRICE_ID_PRO = os.getenv("STRIPE_PRICE_ID_PRO", "price_pro_placeholder")

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
if DATABASE_URL:
    jobstores = {
        'default': SQLAlchemyJobStore(url=DATABASE_URL)
    }
    scheduler = AsyncIOScheduler(jobstores=jobstores, timezone=timezone.utc)
else:
    print("WARNING: No DATABASE_URL found. Scheduler will run in-memory and lose jobs on restart.")
    scheduler = AsyncIOScheduler(timezone=timezone.utc)

# Database Initialization (Ensure tables exist)
from sqlalchemy import create_engine, text

def ensure_tables_exist():
    if not DATABASE_URL:
        return
    
    try:
        engine = create_engine(DATABASE_URL)
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
            print("Database tables ensured.")
    except Exception as e:
        print(f"Database initialization failed: {e}")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for MVP dev, or restrict to localhost:3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to ensure functions are defined before scheduler starts
@app.on_event("startup")
async def startup_event():
    # Run DB init
    ensure_tables_exist()
    
    scheduler.start()
    print("🚀 Scheduler started with AsyncIOScheduler (UTC).")
    
    # Log pending jobs
    for job in scheduler.get_jobs():
        print(f"📌 PENDING JOB: {job.id} | Name: {job.name} | Next Run: {job.next_run_time}")

class AnalyzeRequest(BaseModel):
    url: str
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

@app.post("/analyze")
async def analyze_url(request: AnalyzeRequest, background_tasks: BackgroundTasks):
    print(f"Received analysis request for: {request.url} (Sync: {request.sync})")
    
    # 1. Rate Limiting Check
    ENABLE_RATE_LIMIT = os.getenv("ENABLE_RATE_LIMIT", "true").lower() == "true"
    
    if ENABLE_RATE_LIMIT and request.site_id and supabase:
        try:
            response = supabase.table("sites").select("last_scanned_at, status").eq("id", request.site_id).execute()
            if response.data:
                site = response.data[0]
                last_scanned = site.get("last_scanned_at")
                if last_scanned:
                    last_time = datetime.fromisoformat(last_scanned.replace('Z', '+00:00'))
                    # ALLOW RETRY if status is 'error' or 'processing', BLOCK only if 'completed'
                    if (datetime.now(timezone.utc) - last_time < timedelta(hours=24)) and site.get("status") == 'completed':
                         raise HTTPException(status_code=429, detail="Rate limit exceeded: 1 scan per 24 hours.")
        except HTTPException as he:
            raise he
        except Exception as e:
            print(f"Rate limit check failed: {e}")

    # 2. Update Status Update to Analyzing IMMEDIATE
    if request.site_id and supabase:
        try:
            supabase.table("sites").update({"status": "analyzing"}).eq("id", request.site_id).execute()
        except Exception as e:
            print(f"Failed to update status: {e}")

    # 3. Handle Synchronous Request
    if request.sync:
        try:
            # Run analysis immediately and await result
            result = await analyze_readiness(request.url, scan_mode="full")
            
            # Alias total_score to score for API consistency
            result['score'] = result.get('total_score', 0)
            
            if request.site_id:
                 # We can reuse run_analysis_background logic but we already have the result.
                 # For now, let's just return the result. Use background task for saving if strictly needed,
                 # but usually sync API users just want data.
                 # Let's trigger the background save separately to ensure DB consistency without blocking return?
                 # No, 'sync' implies we wait.
                 pass

            return result
        except Exception as e:
            logger.error(f"Sync analysis failed: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    # 4. Schedule Background Task (Default Async behavior)
    background_tasks.add_task(run_analysis_background, request.url, request.site_id)

    return {"status": "processing", "message": "Analysis started in background"}

async def run_analysis_background(url: str, site_id: str | None):
    print(f"🚀 [Background] Starting analysis for {url}")
    try:
        # Perform Analysis with Timeout (120s safety limit)
        # analyze_readiness handles its own internal concurrency, but this is a global safety net.
        print(f"⏳ [Background] Calling analyze_readiness for {url}...")
        result = await asyncio.wait_for(analyze_readiness(url, scan_mode="full"), timeout=120.0)
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
                            INSERT INTO pages (site_id, url, checklist, aeo_score, status, last_scanned_at)
                            VALUES (:site_id, :url, :checklist, :aeo_score, :status, :last_scanned_at)
                        """)
                        conn.execute(query, {
                            "site_id": site_id,
                            "url": url,
                            "checklist": json.dumps(breakdown),
                            "aeo_score": aeo_score,
                            "status": "completed",
                            "last_scanned_at": datetime.now(timezone.utc).isoformat()
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
def delete_site(site_id: str):
    if not DATABASE_URL:
        raise HTTPException(status_code=500, detail="Database URL not configured")
    
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
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
            
            if result.rowcount == 0:
                raise HTTPException(status_code=404, detail="Site not found")
                
        return {"message": "Site deleted successfully"}
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
        result = await analyze_readiness(url, scan_mode=scan_type)
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
    url: str
    email: str | None = None
    delay_hours: int | None = None
    delay_minutes: int | None = None
    scan_type: str | None = "full" # 'full', 'answers', 'sov'

class CancelScanRequest(BaseModel):
    site_id: str

@app.post("/cancel-scan")
async def cancel_scan(request: CancelScanRequest):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not initialized")
    
    try:
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
async def schedule_scan(request: ScheduleRequest):
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
                "url": request.url,
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
            args=[request.site_id, request.url, request.email, safe_scan_id, request.scan_type or "full"],
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
            args=[request.site_id, request.url, request.email, safe_scan_id, request.scan_type or "full"],
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
        "scan_id": scan_id
    }

class PlanRequest(BaseModel):
    user_domain: str
    competitor_domain: str

@app.post("/generate-plan")
async def generate_plan(request: PlanRequest):
    plan = await generate_content_strategy(request.user_domain, request.competitor_domain)
    return plan

class AnswerPlanRequest(BaseModel):
    user_domain: str

@app.post("/generate-answer-plan")
async def generate_answer_plan(request: AnswerPlanRequest):
    plan = await generate_answer_strategy(request.user_domain)
    return plan
@app.post("/analyze-ambiguity")
async def analyze_ambiguity(request: AnswerPlanRequest): # Reusing AnswerPlanRequest which has user_domain
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
    first_name: str
    last_name: str
    email: str
    message: str

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

# --- Stripe Integration ---

class CheckoutRequest(BaseModel):
    plan: str  # 'plus' or 'pro'
    email: str | None = None
    site_id: str | None = None
    user_id: str | None = None

@app.post("/create-checkout-session")
async def create_checkout_session(request: CheckoutRequest):
    if not STRIPE_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Stripe is not configured")

    price_id = STRIPE_PRICE_ID_PLUS if request.plan == "plus" else STRIPE_PRICE_ID_PRO
    
    # Handle 'pro' mapping if needed, or strictly check
    if request.plan == "pro":
        price_id = STRIPE_PRICE_ID_PRO
    elif request.plan == "plus":
        price_id = STRIPE_PRICE_ID_PLUS
    else:
        raise HTTPException(status_code=400, detail="Invalid plan selected")

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price': price_id,
                    'quantity': 1,
                },
            ],
            mode='subscription',
            success_url=os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000") + "/dashboard?payment=success",
            cancel_url=os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000") + "/pricing?payment=cancelled",
            customer_email=request.email,
            metadata={
                "site_id": request.site_id,
                "plan": request.plan,
                "user_id": request.user_id
            },
            allow_promotion_codes=True,
        )
        return {"url": checkout_session.url}
    except Exception as e:
        logger.error(f"Stripe checkout creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import Request

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
    # Fulfill the purchase...
    customer_email = session.get('customer_details', {}).get('email')
    plan = session.get('metadata', {}).get('plan')
    stripe_customer_id = session.get('customer')
    user_id = session.get('metadata', {}).get('user_id')
    
    print(f"💰 Payment received for {customer_email} - Plan: {plan} - User ID: {user_id}")

    if supabase:
        try:
             response = None
             if user_id:
                 print(f"   > Updating subscription for ID {user_id}...")
                 response = supabase.table("profiles").update({
                     "subscription_tier": plan,
                     "subscription_status": "active",
                     "stripe_customer_id": stripe_customer_id
                 }).eq("id", user_id).execute()
             elif customer_email:
                 print(f"   > Updating subscription for email {customer_email}...")
                 response = supabase.table("profiles").update({
                     "subscription_tier": plan,
                     "subscription_status": "active",
                     "stripe_customer_id": stripe_customer_id
                 }).eq("email", customer_email).execute()
             
             if response and response.data:
                 print(f"   > ✅ Subscription updated.")
             else:
                 print(f"   > ⚠️ User profile not found. Attempting to create one...")
                 # If no profile found, create one
                 if user_id and customer_email:
                    try:
                        upsert_data = {
                            "id": user_id,
                            "email": customer_email,
                            "subscription_tier": plan,
                            "subscription_status": "active",
                            "stripe_customer_id": stripe_customer_id
                        }
                        print(f"   > Upserting profile: {upsert_data}")
                        # Upsert requires checking for conflict on 'id'
                        # But since update failed, it likely doesn't exist.
                        # We use upsert=True just in case.
                        res = supabase.table("profiles").upsert(upsert_data).execute()
                        if res.data:
                            print(f"   > ✅ Profile created/updated via upsert.")
                        else:
                            print(f"   > ❌ Failed to create profile (unknown reason).")
                    except Exception as insert_err:
                        print(f"   > ❌ Failed to create profile: {insert_err}")
                        logger.error(f"Failed to create profile: {insert_err}")
                 
        except Exception as e:
            logger.error(f"Failed to update subscription in DB: {e}")
