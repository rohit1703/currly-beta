import os
import pandas as pd
from supabase import create_client, Client
import json
import re

# --- CONFIGURATION ---
# Paste your credentials here again just to be safe
SUPABASE_URL = "https://zlqjpyarahzqntjowlcg.supabase.co" 
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpscWpweWFyYWh6cW50am93bGNnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzY3MjM2NiwiZXhwIjoyMDc5MjQ4MzY2fQ.uzUwGW0LimWLqjsWSc3ph0LcvLlRk30BJADrsve6Bfc" 
CSV_FILENAME = "currly_data.csv"

# Initialize Client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def clean_pricing(value):
    """Maps Notion text to Database Enum"""
    v = str(value).lower()
    if 'free' in v and 'paid' not in v: return 'free'
    if 'contact' in v or 'demo' in v: return 'contact_sales'
    if 'paid' in v or '$' in v: return 'paid'
    return 'freemium'

def detect_india(row):
    """Checks Location AND Description for India context"""
    text_blob = f"{str(row.get('Location', ''))} {str(row.get('Summary', ''))} {str(row.get('Description', ''))}".lower()
    keywords = ['india', 'delhi', 'bangalore', 'mumbai', 'hyderabad', 'pune', 'chennai', '₹', 'inr']
    return any(k in text_blob for k in keywords)

def format_slug(name, index):
    """Generates a clean URL slug with index to ensure uniqueness"""
    clean_name = str(name).lower().strip().replace(' ', '-').replace('.', '-').replace('/', '').replace('ai', '-ai')
    # Remove non-alphanumeric chars except hyphens
    clean_name = re.sub(r'[^a-z0-9\-]', '', clean_name)
    # Append index to guarantee uniqueness (e.g., jasper-ai-0, jasper-ai-1)
    return f"{clean_name}-{index}"

def run_migration():
    print(f"🚀 Loading {CSV_FILENAME}...")
    
    try:
        df = pd.read_csv(CSV_FILENAME)
        print(f"📊 Found {len(df)} rows.")
    except FileNotFoundError:
        print(f"❌ Error: Could not find {CSV_FILENAME}. Make sure the file is in this folder.")
        return

    tools_buffer = []
    
    # Loop through CSV
    for index, row in df.iterrows():
        try:
            name = row.get('Name', 'Untitled')
            
            if pd.isna(name) or name == 'Untitled': continue

            tool_payload = {
                "name": name,
                "slug": format_slug(name, index), # Unique slug based on row index
                "website_url": row.get('URL', ''), 
                "description": row.get('Summary', row.get('Description', '')),
                "tagline": row.get('Tagline', '') if not pd.isna(row.get('Tagline')) else None,
                "is_india_based": detect_india(row),
                "pricing_type": clean_pricing(row.get('Pricing', '')),
                "setup_time_minutes": 15,
                "is_verified": True
            }
            
            tools_buffer.append(tool_payload)
            
        except Exception as e:
            print(f"⚠️ Skipped Row {index}: {e}")

    print(f"📦 Ready to upload {len(tools_buffer)} tools to Supabase...")
    
    # BATCH UPLOAD WITH UPSERT
    chunk_size = 50
    for i in range(0, len(tools_buffer), chunk_size):
        batch = tools_buffer[i:i + chunk_size]
        try:
            # THE FIX: Using .upsert() instead of .insert()
            response = supabase.table('tools').upsert(batch, on_conflict='slug').execute()
            print(f"   ✅ Upserted batch {i} - {i+len(batch)}")
        except Exception as e:
            print(f"   ❌ Error on batch {i}: {e}")

    print("\n🎉 Migration Complete! Your Currly Engine is live.")
    print("Check Supabase Dashboard -> Table Editor -> 'tools'")

if __name__ == "__main__":
    run_migration()