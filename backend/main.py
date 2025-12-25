from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from analyzer import analyze_readiness, generate_content_strategy
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime, timedelta, timezone

load_dotenv()

app = FastAPI(title="AEO Readiness Auditor")

# Supabase Setup
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY") # Prefer service key, fallback to anon
supabase: Client = None

if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Supabase init failed: {e}")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for MVP dev, or restrict to localhost:3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    url: str
    site_id: str | None = None

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
async def analyze_url(request: AnalyzeRequest):
    # 1. Rate Limiting Check
    ENABLE_RATE_LIMIT = os.getenv("ENABLE_RATE_LIMIT", "true").lower() == "true"
    
    if ENABLE_RATE_LIMIT and request.site_id and supabase:
        try:
            response = supabase.table("sites").select("last_scanned_at").eq("id", request.site_id).execute()
            if response.data:
                last_scanned = response.data[0].get("last_scanned_at")
                if last_scanned:
                    last_time = datetime.fromisoformat(last_scanned.replace('Z', '+00:00'))
                    if datetime.now(timezone.utc) - last_time < timedelta(hours=24):
                        raise HTTPException(status_code=429, detail="Rate limit exceeded: 1 scan per 24 hours.")
        except HTTPException as he:
            raise he
        except Exception as e:
            print(f"Rate limit check failed: {e}")

    # 2. Perform Analysis
    result = await analyze_readiness(request.url)

    # 3. Update Database
    if request.site_id and supabase:
        try:
            # Calculate health status
            breakdown = result.get("breakdown", {})
            tech_score = breakdown.get("technical", {}).get("robots", {}).get("score", 0) # Simplification
            # Better aggregation needed?
            # User req: health_status -> { robots: 'healthy', schema: 'warning', content: 'critical' }
            
            robots_score = breakdown.get("technical", {}).get("robots", {}).get("score", 0)
            schema_score = breakdown.get("technical", {}).get("schema", {}).get("score", 0)
            
            # Content score avg
            content_scores = [v.get("score", 0) for v in breakdown.get("content", {}).values() if isinstance(v, dict)]
            content_avg = sum(content_scores) / len(content_scores) if content_scores else 0
            
            health_status = {
                "robots": get_status(robots_score),
                "schema": get_status(schema_score),
                "content": get_status(int(content_avg))
            }
            
            aeo_score = result.get("total_score", 0)
            competitors = result.get("competitors", {})

            # Update sites table
            supabase.table("sites").update({
                "aeo_score": aeo_score,
                "health_status": health_status,
                "competitors": competitors,
                "last_scanned_at": datetime.now(timezone.utc).isoformat()
            }).eq("id", request.site_id).execute()

            # Insert history
            supabase.table("site_history").insert({
                "site_id": request.site_id,
                "aeo_score": aeo_score
            }).execute()
            
        except Exception as e:
            print(f"DB Update failed: {e}")
            # Don't fail the request if DB fails? Or should we?
            # Ideally return result but log error.
            pass

    return result

class PlanRequest(BaseModel):
    user_domain: str
    competitor_domain: str

@app.post("/generate-plan")
async def generate_plan(request: PlanRequest):
    plan = await generate_content_strategy(request.user_domain, request.competitor_domain)
    return plan
