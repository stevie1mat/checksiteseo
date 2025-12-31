import os
import asyncio
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY")

async def check_status():
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Missing Supabase credentials")
        return

    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    url = "https://ritasavoia.com/"
    
    try:
        response = supabase.table("sites").select("*").eq("url", url).execute()
        if response.data:
            site = response.data[0]
            print(f"Site Status: {site.get('status')}")
            print(f"Last Scanned: {site.get('last_scanned_at')}")
        else:
            print("Site not found")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_status())
