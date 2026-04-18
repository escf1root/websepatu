from decimal import Decimal, ROUND_HALF_UP
from fastapi import HTTPException
from models import Stock


SHIPPING_COSTS = {
    "jakarta": Decimal("15000"),
    "java": Decimal("25000"),
    "outside_java": Decimal("45000"),
}

TAX_RATE = Decimal("0.11")
DISCOUNT_THRESHOLD = Decimal("500000")
DISCOUNT_RATE = Decimal("0.10")


class PriceCalculatorService:
    @staticmethod
    def calculate(items: list, shipping_zone: str) -> dict:
        subtotal = Decimal("0")
        for item in items:
            price = Decimal(str(item["price"]))
            qty = Decimal(str(item["quantity"]))
            subtotal += price * qty

        tax = (subtotal * TAX_RATE).quantize(Decimal("1"), rounding=ROUND_HALF_UP)

        shipping = SHIPPING_COSTS.get(shipping_zone, Decimal("25000"))

        discount = Decimal("0")
        if subtotal >= DISCOUNT_THRESHOLD:
            discount = (subtotal * DISCOUNT_RATE).quantize(Decimal("1"), rounding=ROUND_HALF_UP)

        total = subtotal + tax + shipping - discount

        return {
            "subtotal": int(subtotal),
            "tax": int(tax),
            "shipping": int(shipping),
            "discount": int(discount),
            "total": int(total),
            "tax_rate": "11%",
            "discount_applied": subtotal >= DISCOUNT_THRESHOLD,
            "shipping_zone": shipping_zone,
        }


class StockService:
    @staticmethod
    def check_availability(db, product_id: int, size: str, qty: int) -> bool:
        stock = db.query(Stock).filter(
            Stock.product_id == product_id,
            Stock.size == size,
        ).first()
        if not stock:
            return False
        return stock.quantity >= qty

    @staticmethod
    def reduce_stock_atomic(db, items: list):
        """
        Reduces stock for all items in a single transaction.
        Raises HTTPException 409 if any item is out of stock.
        """
        try:
            for item in items:
                stock = db.query(Stock).filter(
                    Stock.product_id == item["product_id"],
                    Stock.size == item["size"],
                ).with_for_update().first()

                if not stock or stock.quantity < item["quantity"]:
                    db.rollback()
                    raise HTTPException(
                        status_code=409,
                        detail=f"Stok tidak cukup untuk produk ID {item['product_id']} ukuran {item['size']}",
                    )
                stock.quantity -= item["quantity"]

            db.commit()
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    def get_stock_by_product(db, product_id: int) -> dict:
        stocks = db.query(Stock).filter(Stock.product_id == product_id).all()
        return {s.size: s.quantity for s in stocks}
