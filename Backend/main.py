import os
from fastapi import FastAPI, Depends, HTTPException, status, Request
from supabase import create_client, Client
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ValidationError
from typing import Optional, List
from datetime import datetime, timezone
import logging

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


class ItemName(BaseModel):
    name: Optional[str] = None
    id: int  # Include ID if you need it elsewhere


class SupplierName(BaseModel):
    name: Optional[str] = None
    id: int  # Include ID if you need it elsewhere


class CustomerName(BaseModel):
    name: Optional[str] = None
    id: int  # Include ID if you need it elsewhere


class Item(BaseModel):
    name: str
    sku: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    stocklevel: Optional[int] = None
    supplier_id: Optional[int] = None  # Changed supplier to supplier_id
    id: Optional[int] = None  # Include ID if present in response


@app.get("/items/")
async def get_all_items(supabase_client: Client = Depends(get_supabase_client)):
    try:
        response = supabase_client.table("items").select("*").execute()
        return {"data": response.data}
    except Exception as e:
        logging.exception("Error in get_all_items")  # Log the error
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )  # Use HTTPException


@app.get("/items/{item_id}")
async def get_item_by_id(
    item_id: int, supabase_client: Client = Depends(get_supabase_client)
):
    try:
        response = (
            supabase_client.table("items")
            .select(
                "id, name, sku, category, price, stocklevel, supplier_id"
            )  # changed supplier
            .eq("id", item_id)
            .single()
            .execute()
        )
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Item not found"
            )
        return {"data": response.data}
    except HTTPException as e:
        raise e
    except Exception as e:
        logging.exception("Error in get_item_by_id")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@app.post("/items/")  # Correct route for creating items
async def create_item(
    item: Item, supabase_client: Client = Depends(get_supabase_client)
):
    try:
        item_data = item.dict(exclude_none=True)
        item_data["created_at"] = datetime.now(timezone.utc).isoformat()
        response = supabase_client.table("items").insert(item_data).execute()

        if response.error:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(response.error),
            )

        if response.data and len(response.data) > 0:
            return {"data": response.data[0]}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No data returned from insert.",
            )
    except HTTPException as e:
        raise e
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=e.errors()
        )
    except Exception as e:
        logging.exception("Error in create_item")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {e}",
        )


@app.post("/add-item")
async def add_item(item: Item, supabase_client: Client = Depends(get_supabase_client)):
    try:
        item_data = item.dict(exclude_none=True)
        item_data["created_at"] = datetime.now(timezone.utc).isoformat()
        data, error = supabase_client.table("items").insert(item_data).execute()

        if error:
            raise HTTPException(status_code=500, detail=error.message)

        if data and len(data) > 0:
            return {"data": data[0]}
        else:
            raise HTTPException(status_code=500, detail="No data returned from insert.")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


class SupplierModel(BaseModel):
    name: str
    address: Optional[str] = None
    gstno: Optional[str] = None
    id: Optional[int] = None  # Include ID if present in response


@app.get("/suppliers/")
async def get_all_suppliers(supabase_client: Client = Depends(get_supabase_client)):
    try:
        response = supabase_client.table("supplier").select("*").execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="No suppliers found"
            )

        return {"data": response.data}
    except HTTPException as e:
        raise e
    except Exception as e:
        logging.exception("Error in get_all_suppliers")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {e}",
        )


@app.post("/add-supplier/")
async def add_supplier(
    supplier: SupplierModel, supabase_client: Client = Depends(get_supabase_client)
):
    try:
        supplier_data = supplier.dict(exclude_none=True)
        # Do NOT add created_at since the table doesn't have that column
        response = supabase_client.table("supplier").insert(supplier_data).execute()

        if response.error:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(response.error),
            )

        if response.data and len(response.data) > 0:
            return {"data": response.data[0]}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No data returned from insert.",
            )
    except HTTPException as e:
        raise e
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=e.errors()
        )
    except Exception as e:
        logging.exception("Error in add_supplier")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {e}",
        )


class OrderResponse(BaseModel):
    item_id: int
    supplier_id: int
    quantity: int
    order_date: Optional[datetime] = None
    expected_date: Optional[datetime] = None
    status: Optional[str] = None  # e.g., "pending", "shipped", "delivered"
    total_price: Optional[float] = None
    notes: Optional[str] = None
    items: Optional[ItemName] = None
    supplier: Optional[SupplierName] = None
    customers: Optional[CustomerName] = None
    id: Optional[int] = None


@app.get("/orders/")
async def get_all_orders(supabase_client: Client = Depends(get_supabase_client)):
    try:
        response = (
            supabase_client.table("orders")
            .select(
                """
                *,
                items (name, id),
                supplier (name, id),
                customers (name, id)
                """
            )
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No orders found",
            )

        orders = [OrderResponse(**order) for order in response.data]
        return {"data": orders}
    except HTTPException as e:
        raise e
    except Exception as e:
        logging.exception("Error in get_all_orders")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {e}",
        )


class OrderInput(BaseModel):
    item_id: int
    supplier_id: int
    quantity: int
    customer_id: int


@app.post("/add-order")
async def add_order(
    order_input: OrderInput, supabase_client: Client = Depends(get_supabase_client)
):
    try:
        order_data = order_input.dict(exclude_none=True)
        order_data["created_at"] = datetime.now(timezone.utc).isoformat()

        response = supabase_client.table("orders").insert(order_data).execute()

        if response.error:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(response.error),
            )

        if response.data and len(response.data) > 0:
            return {"data": response.data[0]}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No data returned from insert.",
            )
    except HTTPException as e:
        raise e
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=e.errors()
        )
    except Exception as e:
        logging.exception("Error in add_order")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {e}",
        )


@app.get("/orders/total-revenue/")
async def get_total_revenue(supabase_client: Client = Depends(get_supabase_client)):
    try:
        response = supabase_client.table("orders").select("total_price").execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No orders found",
            )

        total_revenue = sum(order.get("total_price") or 0 for order in response.data)
        return {"total_revenue": total_revenue}
    except Exception as e:
        logging.exception("Error in get_total_revenue")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {e}",
        )


class CustomerModel(BaseModel):
    name: str
    address: Optional[str] = None
    phone_no: Optional[str] = None
    email: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[str] = None  # Expecting format:-MM-DD
    id: Optional[int] = None  # Include ID if present in response


@app.get("/customers/")
async def get_all_customers(supabase_client: Client = Depends(get_supabase_client)):
    try:
        response = supabase_client.table("customers").select("*").execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="No customers found"
            )

        return {"data": response.data}
    except HTTPException as e:
        raise e
    except Exception as e:
        logging.exception("Error in get_all_customers")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {e}",
        )


@app.post("/add-customer/")
async def add_customer(
    customer: CustomerModel, supabase_client: Client = Depends(get_supabase_client)
):
    try:
        customer_data = customer.dict(exclude_none=True)
        response = supabase_client.table("customers").insert(customer_data).execute()

        if response.error:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(response.error),
            )

        if response.data and len(response.data) > 0:
            return {"data": response.data[0]}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No data returned from insert.",
            )
    except HTTPException as e:
        raise e
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=e.errors()
        )
    except Exception as e:
        logging.exception("Error in add_customer")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {e}",
        )


class InventoryItem(BaseModel):
    item_id: int
    quantity: int
    stockstatus: Optional[str] = None
    supplier_id: Optional[int] = None
    item: Optional[ItemName] = None
    supplier: Optional[SupplierName] = None


@app.get("/inventory")
async def get_inventory():
    try:
        response = (
            supabase.table("inventory")
            .select(
                """
                item_id,
                supplier_id,
                quantity,
                stockstatus,
                items (
                    name,
                    sku,
                    category,
                    price
                ),
                supplier (
                    name
                )
                """
            )
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=500, detail="No data found")

        result = []
        for record in response.data:
            item_info = record.get("items", {})
            supplier_info = record.get("supplier", {})
            result.append(
                {
                    "item_id": record["item_id"],
                    "name": item_info.get("name"),
                    "sku": item_info.get("sku"),
                    "category": item_info.get("category"),
                    "price": item_info.get("price"),
                    "stocklevel": record.get("quantity"),
                    "stockstatus": record.get("stockstatus"),
                    "supplier": record.get("supplier_id"),
                    "supplier_name": supplier_info.get("name"),
                    "lastUpdated": None,
                }
            )

        return {"data": result}

    except Exception as e:
        print(f"Error fetching inventory: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
