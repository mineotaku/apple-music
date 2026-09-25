import os
import sys
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv("DATABASE_URL")
print(f"Testing connection to: {db_url.split('@')[1] if '@' in db_url else db_url}")

try:
    from sqlalchemy import create_engine, text
    engine = create_engine(db_url)
    with engine.connect() as conn:
        res = conn.execute(text("SELECT version();")).fetchone()
        print(f"SUCCESS: Connected to PostgreSQL! Version: {res[0][:40]}")
except Exception as e:
    print(f"Database direct connection note: {e}")
    # If direct IPv6/IPv4 port 5432 is blocked by ISP or requires pooler port 6543
    print("Testing with transaction pooler port 6543...")
    pooler_url = "postgresql://postgres.vamhtrrmfvnthdujrgpv:XuroEMEIO8dOiDkZ@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres"
    try:
        from sqlalchemy import create_engine, text
        engine = create_engine(pooler_url)
        with engine.connect() as conn:
            res = conn.execute(text("SELECT version();")).fetchone()
            print(f"SUCCESS: Connected via Pooler! Version: {res[0][:40]}")
    except Exception as e2:
        print(f"Pooler error: {e2}")

# Test Supabase Storage Bucket creation
supa_url = os.getenv("SUPABASE_URL")
supa_key = os.getenv("SUPABASE_KEY")
print(f"Testing Supabase storage with URL: {supa_url}")
try:
    from supabase import create_client
    sb = create_client(supa_url, supa_key)
    try:
        sb.storage.create_bucket("songs", options={"public": True})
        print("SUCCESS: Created public storage bucket 'songs'!")
    except Exception as be:
        print(f"Storage bucket status: {be}")
except Exception as se:
    print(f"Supabase client init error: {se}")
