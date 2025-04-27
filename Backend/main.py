import os
from fastapi import FastAPI, Depends
from supabase import create_client, Client
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

print(f"SUPABASE_URL from environment: {SUPABASE_URL}")
print(f"SUPABASE_KEY from environment: {SUPABASE_KEY}")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY environment variables must be set.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
app = FastAPI()

origins = [
    "http://localhost:8080",  # Your React development server
    # Add other origins if needed, e.g., your production frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def get_supabase_client():
    return supabase


@app.get("/items/")
async def get_all_items(supabase_client: Client = Depends(get_supabase_client)):
    try:
        response = supabase_client.table("items").select("*").execute()
        return {"data": response.data}
    except Exception as e:
        return {"error": str(e)}


@app.get("/items/{item_id}")
async def get_item_by_id(
    item_id: int, supabase_client: Client = Depends(get_supabase_client)
):
    try:
        response = (
            supabase_client.table("items")
            .select("id, name")
            .eq("id", item_id)
            .single()
            .execute()
        )
        return {"data": response.data}
    except Exception as e:
        return {"error": str(e)}
