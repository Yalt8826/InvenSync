import os
from fastapi import FastAPI, Depends, HTTPException
from supabase import create_client, Client
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

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
    "http://localhost:8080",
    # Add other origins if needed
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


class Item(BaseModel):
    name: str
    sku: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    stocklevel: Optional[int] = None  # Explicitly Optional
    supplier: Optional[str] = None


@app.get("/items/")
async def get_all_items(supabase_client: Client = Depends(get_supabase_client)):
    try:
        response = supabase_client.table("items").select("*").execute()
        print("FastAPI Backend - Get All Items Response:", response.data)
        return {"data": response.data}
    except Exception as e:
        print("FastAPI Backend - Get All Items Error:", e)
        return {"error": str(e)}


@app.get("/items/{item_id}")
async def get_item_by_id(
    item_id: int, supabase_client: Client = Depends(get_supabase_client)
):
    try:
        response = (
            supabase_client.table("items")
            .select("id, name, sku, category, price, stocklevel, supplier")
            .eq("id", item_id)
            .single()
            .execute()
        )
        print("FastAPI Backend - Get Item by ID Response:", response.data)
        return {"data": response.data}
    except Exception as e:
        print("FastAPI Backend - Get Item by ID Error:", e)
        return {"error": str(e)}


@app.post("/items/")
async def create_item(
    item: Item, supabase_client: Client = Depends(get_supabase_client)
):
    """
    Endpoint to create a new item in the Supabase database.
    """
    print("FastAPI Backend - Received Item (Pydantic):", item)
    print("FastAPI Backend - Received Item (dict):", item.dict())

    try:
        item_data = item.dict(exclude_none=True)
        print("FastAPI Backend - item_data before adding created_at:", item_data)
        item_data["created_at"] = "now()"
        print("FastAPI Backend - item_data for Supabase insert:", item_data)

        data, error = supabase_client.table("items").insert(item_data).execute()

        print("FastAPI Backend - Supabase Insert Response (data):", data)
        print("FastAPI Backend - Supabase Insert Response (error):", error)

        if error:
            raise HTTPException(
                status_code=500, detail=f"Failed to add item to database: {error}"
            )

        if data and len(data.data) > 0:
            return {"message": "Item added successfully", "data": data.data[0]}
        else:
            raise HTTPException(
                status_code=500, detail="Failed to retrieve inserted data."
            )

    except HTTPException as e:
        print("FastAPI Backend - HTTPException:", e.detail)
        raise e
    except Exception as e:
        print("FastAPI Backend - Internal Server Error:", e)
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")
