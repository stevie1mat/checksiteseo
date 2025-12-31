import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from analyzer import analyze_readiness, generate_content_strategy, generate_answer_strategy, analyze_ambiguity_issues
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime, timedelta, timezone
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
import resend
from email_templates import get_email_html

load_dotenv()

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
    result = await analyze_readiness(request.url, scan_mode="full") # Regular analysis is always full

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
                "status": "completed",
                "last_scanned_at": datetime.now(timezone.utc).isoformat()
            }).eq("id", request.site_id).execute()

            # Insert history
            supabase.table("site_history").insert({
                "site_id": request.site_id,
                "aeo_score": aeo_score
            }).execute()

            # Insert into pages (Critical for Frontend Details)
            supabase.table("pages").insert({
                "site_id": request.site_id,
                "url": request.url,
                "checklist": result.get("breakdown", {}),
                "aeo_score": aeo_score,
                "last_scanned_at": datetime.now(timezone.utc).isoformat()
            }).execute()
            
        except Exception as e:
            print(f"DB Update failed: {e}")
            # Don't fail the request if DB fails? Or should we?
            # Ideally return result but log error.
            pass

    return result

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
