# HOW TO RUN:
# Terminal 1 (backend):
#   cd backend
#   pip install fastapi uvicorn sqlalchemy
#   python seed.py
#   python main.py
#
# Terminal 2 (frontend):
#   npm install zustand framer-motion
#   npm run dev
#
# Open http://localhost:3000

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import json
import uuid
from datetime import datetime

from models import init_db, SessionLocal, Product, Stock, Order
from services import PriceCalculatorService, StockService
from pydantic import BaseModel

app = FastAPI(title="SoleMate API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.on_event("startup")
def on_startup():
    init_db()


# ------------------------------------------------------------------
# Schemas
# ------------------------------------------------------------------
class OrderItem(BaseModel):
    productId: int
    productName: str
    brand: str
    size: str
    price: float
    quantity: int
    imageFilename: str


class CalculatePriceRequest(BaseModel):
    items: List[OrderItem]
    shipping_zone: str  # jakarta | java | outside_java


class ShippingAddress(BaseModel):
    nama: str
    telepon: str
    alamat: str
    kota: str
    zone: str


class OrderRequest(BaseModel):
    items: List[OrderItem]
    shipping_address: ShippingAddress
    shipping_zone: str


# Schema for creating/updating a product (admin only)
class ProductUpsert(BaseModel):
    name: str
    brand: str
    price: float
    description: str
    image_filename: str


# Schema for updating stock per size (admin only)
class StockUpdateRequest(BaseModel):
    stock_by_size: dict  # e.g. {"39": 5, "40": 10, ...}


# ------------------------------------------------------------------
# Endpoints
# ------------------------------------------------------------------
@app.get("/api/products")
def get_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    result = []
    for p in products:
        stocks = db.query(Stock).filter(Stock.product_id == p.id).all()
        total_stock = sum(s.quantity for s in stocks)
        stock_by_size = {s.size: s.quantity for s in stocks}
        result.append({
            "id": p.id,
            "name": p.name,
            "brand": p.brand,
            "price": float(p.price),
            "description": p.description,
            "imageFilename": p.image_filename,
            "totalStock": total_stock,
            "stockBySize": stock_by_size,
            "createdAt": p.created_at.isoformat() if p.created_at else None,
        })
    return result


@app.get("/api/products/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    stocks = db.query(Stock).filter(Stock.product_id == p.id).all()
    total_stock = sum(s.quantity for s in stocks)
    stock_by_size = {s.size: s.quantity for s in stocks}
    return {
        "id": p.id,
        "name": p.name,
        "brand": p.brand,
        "price": float(p.price),
        "description": p.description,
        "imageFilename": p.image_filename,
        "totalStock": total_stock,
        "stockBySize": stock_by_size,
        "createdAt": p.created_at.isoformat() if p.created_at else None,
    }


# ------------------------------------------------------------------
# Admin Endpoints (NEW — does NOT modify existing endpoints above)
# ------------------------------------------------------------------

@app.post("/api/products")
def create_product(data: ProductUpsert, db: Session = Depends(get_db)):
    """
    Create a new product.
    Also initialises stock for sizes 39-44 with quantity 0.
    Called by the admin panel "Tambah Produk" form.
    """
    if not data.name.strip():
        raise HTTPException(status_code=400, detail="Nama produk tidak boleh kosong.")
    if data.price <= 0:
        raise HTTPException(status_code=400, detail="Harga harus lebih dari 0.")

    new_product = Product(
        name=data.name.strip(),
        brand=data.brand.strip(),
        price=data.price,
        description=data.description.strip(),
        image_filename=data.image_filename.strip(),
        created_at=datetime.utcnow(),
    )
    db.add(new_product)
    db.flush()  # get the new id before commit

    # Add zero stock for each standard size so the product shows up
    for size in ["39", "40", "41", "42", "43", "44"]:
        db.add(Stock(product_id=new_product.id, size=size, quantity=0))

    db.commit()
    db.refresh(new_product)

    return {
        "success": True,
        "id": new_product.id,
        "message": f"Produk '{new_product.name}' berhasil ditambahkan.",
    }


@app.put("/api/products/{product_id}")
def update_product(product_id: int, data: ProductUpsert, db: Session = Depends(get_db)):
    """
    Update an existing product's name, brand, price, description, or image.
    Does NOT touch stock or orders.
    Called by the admin panel "Edit Produk" form.
    """
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan.")

    if not data.name.strip():
        raise HTTPException(status_code=400, detail="Nama produk tidak boleh kosong.")
    if data.price <= 0:
        raise HTTPException(status_code=400, detail="Harga harus lebih dari 0.")

    # Only update the product columns — do NOT touch Stock or Order tables
    p.name = data.name.strip()
    p.brand = data.brand.strip()
    p.price = data.price
    p.description = data.description.strip()
    p.image_filename = data.image_filename.strip()

    db.commit()
    db.refresh(p)

    return {
        "success": True,
        "id": p.id,
        "message": f"Produk '{p.name}' berhasil diperbarui.",
    }


@app.delete("/api/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """
    Delete a product and its associated stock records.
    Does NOT affect past orders (they store a JSON snapshot).
    Called by the admin panel "Hapus" button after confirmation.
    """
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan.")

    # Remove associated stock first (foreign key constraint)
    db.query(Stock).filter(Stock.product_id == product_id).delete()

    db.delete(p)
    db.commit()

    return {
        "success": True,
        "message": f"Produk ID {product_id} berhasil dihapus.",
    }


@app.put("/api/products/{product_id}/stock")
def update_stock(product_id: int, data: StockUpdateRequest, db: Session = Depends(get_db)):
    """
    Update per-size stock quantities for a product.
    Upserts the Stock table rows (39–44) without touching Product or Order records.
    Called by the admin panel "📦 Stok" modal.
    """
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan.")

    for size, qty in data.stock_by_size.items():
        qty = int(qty)
        if qty < 0:
            raise HTTPException(
                status_code=400,
                detail=f"Stok untuk ukuran {size} tidak boleh negatif."
            )
        existing = db.query(Stock).filter(
            Stock.product_id == product_id,
            Stock.size == size
        ).first()
        if existing:
            existing.quantity = qty
        else:
            db.add(Stock(product_id=product_id, size=size, quantity=qty))

    db.commit()

    # Return updated stock summary
    stocks = db.query(Stock).filter(Stock.product_id == product_id).all()
    return {
        "success": True,
        "product_id": product_id,
        "total_stock": sum(s.quantity for s in stocks),
        "stock_by_size": {s.size: s.quantity for s in stocks},
        "message": f"Stok produk ID {product_id} berhasil diperbarui.",
    }


@app.post("/api/calculate-price")
def calculate_price(req: CalculatePriceRequest):
    items_for_calc = [
        {"price": item.price, "quantity": item.quantity}
        for item in req.items
    ]
    result = PriceCalculatorService.calculate(items_for_calc, req.shipping_zone)
    return result


@app.post("/api/order")
def create_order(req: OrderRequest, db: Session = Depends(get_db)):
    # Reduce stock atomically
    stock_items = [
        {"product_id": item.productId, "size": item.size, "quantity": item.quantity}
        for item in req.items
    ]
    StockService.reduce_stock_atomic(db, stock_items)

    # Calculate final price
    items_for_calc = [
        {"price": item.price, "quantity": item.quantity}
        for item in req.items
    ]
    price_result = PriceCalculatorService.calculate(items_for_calc, req.shipping_zone)

    order_number = f"SM-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

    order = Order(
        order_number=order_number,
        items_json=json.dumps([item.dict() for item in req.items]),
        subtotal=float(price_result["subtotal"]),
        tax=float(price_result["tax"]),
        shipping=float(price_result["shipping"]),
        discount=float(price_result["discount"]),
        total_price=float(price_result["total"]),
        shipping_address=json.dumps(req.shipping_address.dict()),
        status="pending",
        created_at=datetime.utcnow(),
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    return {
        "success": True,
        "orderNumber": order_number,
        "orderId": order.id,
        "priceBreakdown": price_result,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
