import os
import json
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load env from parent as well just in case
load_dotenv(".env")

db_url = os.getenv("DATABASE_URL")
if not db_url:
    print("DATABASE_URL not found in .env")
    exit(1)

print(f"Connecting to database...")
engine = create_engine(db_url)

with engine.connect() as conn:
    print("Adding columns to pages table...")
    conn.execute(text("ALTER TABLE pages ADD COLUMN IF NOT EXISTS ip_address TEXT;"))
    conn.execute(text("ALTER TABLE pages ADD COLUMN IF NOT EXISTS city TEXT;"))
    conn.execute(text("ALTER TABLE pages ADD COLUMN IF NOT EXISTS country TEXT;"))
    conn.execute(text("ALTER TABLE pages ADD COLUMN IF NOT EXISTS user_agent TEXT;"))
    conn.commit()
    print("Migration complete.")
