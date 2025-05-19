import os
from fastapi import FastAPI, Depends, HTTPException
from supabase import create_client, Client
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY environment variables must be set.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
app = FastAPI()

origins = [
    "http://localhost:8080",  # your frontend
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
    stocklevel: Optional[int] = None
    supplier: Optional[int] = None


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
            .select("id, name, sku, category, price, stocklevel, supplier")
            .eq("id", item_id)
            .single()
            .execute()
        )
        return {"data": response.data}
    except Exception as e:
        return {"error": str(e)}


@app.post("/items/")
async def create_item(
    item: Item, supabase_client: Client = Depends(get_supabase_client)
):
    try:
        item_data = item.dict(exclude_none=True)
        item_data["created_at"] = "now()"
        response = supabase_client.table("items").insert(item_data).execute()

        if response.error:
            raise HTTPException(status_code=500, detail=str(response.error))

        if response.data and len(response.data) > 0:
            return {"data": response.data[0]}
        else:
            raise HTTPException(status_code=500, detail="No data returned from insert.")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


@app.post("/add-item")
async def add_item(item: Item, supabase_client: Client = Depends(get_supabase_client)):
    try:
        item_data = item.dict(exclude_none=True)
        item_data["created_at"] = datetime.now(timezone.utc).isoformat()
        response = supabase_client.table("items").insert(item_data).execute()

        if response.error:
            raise HTTPException(status_code=500, detail=str(response.error))

        if response.data and len(response.data) > 0:
            return {"data": response.data[0]}
        else:
            raise HTTPException(status_code=500, detail="No data returned from insert.")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


class Supplier(BaseModel):
    name: str
    address: Optional[str] = None
    gstno: Optional[str] = None


@app.get("/suppliers/")
async def get_all_suppliers(supabase_client: Client = Depends(get_supabase_client)):
    try:
        response = supabase_client.table("supplier").select("*").execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="No suppliers found")

        return {"data": response.data}
    except Exception as e:
        print("Unexpected Error:", e)
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


@app.post("/add-supplier/")
async def add_supplier(
    supplier: Supplier, supabase_client: Client = Depends(get_supabase_client)
):
    try:
        supplier_data = supplier.dict(exclude_none=True)
        # Do NOT add created_at since the table doesn't have that column
        response = supabase_client.table("supplier").insert(supplier_data).execute()

        if response.error:
            print("Supabase insert error:", response.error)
            raise HTTPException(status_code=500, detail=str(response.error))

        if response.data and len(response.data) > 0:
            return {"data": response.data[0]}
        else:
            raise HTTPException(status_code=500, detail="No data returned from insert.")
    except HTTPException as e:
        raise e
    except Exception as e:
        print("Unexpected server error:", e)
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


class Order(BaseModel):
    item_id: int
    supplier_id: int
    quantity: int
    order_date: datetime
    expected_date: Optional[datetime] = None
    status: str  # e.g., "pending", "shipped", "delivered"
    total_price: float
    notes: Optional[str] = None


@app.post("/add-order")
async def add_order(
    order: Order, supabase_client: Client = Depends(get_supabase_client)
):
    try:
        order_data = order.dict(exclude_none=True)
        order_data["created_at"] = datetime.now(timezone.utc).isoformat()

        response = supabase_client.table("orders").insert(order_data).execute()

        if response.error:
            raise HTTPException(status_code=500, detail=str(response.error))

        if response.data and len(response.data) > 0:
            return {"data": response.data[0]}
        else:
            raise HTTPException(status_code=500, detail="No data returned from insert.")
    except HTTPException as e:
        raise e
    except Exception as e:
        print("Unexpected Error:", e)
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


@app.get("/orders/")
async def get_all_orders(supabase_client: Client = Depends(get_supabase_client)):
    try:
        response = supabase_client.table("orders").select("*").execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="No suppliers found")

        return {"data": response.data}
    except Exception as e:
        print("Unexpected Error:", e)
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")
