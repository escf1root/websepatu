"""
Seed script — run with: python seed.py
Inserts 6 shoes with stock for sizes 39-44.
"""
import random
from models import init_db, SessionLocal, Product, Stock
from datetime import datetime

SHOES = [
    {
        "name": "Compasss Up Size",
        "brand": "Nike",
        "price": 2100000,
        "description": "Sepatu lifestyle ikonik dengan bantalan Air Max terbesar di tumit. Desain futuristik dengan warna yang berani, nyaman untuk dipakai seharian.",
        "image_filename": "nike-airmax-270.jpg",
    },
    {
        "name": "Adidas Ultraboost 22",
        "brand": "Adidas",
        "price": 2400000,
        "description": "Dilengkapi dengan teknologi Boost terbaru untuk pengembalian energi maksimal. Cocok untuk lari jarak jauh maupun aktivitas sehari-hari.",
        "image_filename": "adidas-ultraboost-22.jpg",
    },
    {
        "name": "New Balance 574",
        "brand": "New Balance",
        "price": 1350000,
        "description": "Sneaker klasik yang telah menjadi ikon streetwear selama puluhan tahun. Sol ENCAP memberikan dukungan dan bantalan yang superior.",
        "image_filename": "newbalance-574.jpg",
    },
    {
        "name": "Vans Old Skool",
        "brand": "Vans",
        "price": 950000,
        "description": "Skateboard shoe legendaris dengan desain timeless. Bagian atas kanvas dan suede dengan garis tanda tangan Vans yang ikonik.",
        "image_filename": "vans-oldskool.jpg",
    },
    {
        "name": "Converse Chuck 70",
        "brand": "Converse",
        "price": 850000,
        "description": "Versi premium dari Chuck Taylor All Star original. Konstruksi premium dengan lapisan tumit yang lebih tebal dan ortholite insole.",
        "image_filename": "converse-chuck70.jpg",
    },
    {
        "name": "Puma RS-X",
        "brand": "Puma",
        "price": 1150000,
        "description": "Terinspirasi dari teknologi RS lari era 80-an. Desain chunky yang bold dengan upper multi-material dan sol tebal yang statement.",
        "image_filename": "puma-rsx.jpg",
    },
]

SIZES = ["39", "40", "41", "42", "43", "44"]


def seed():
    init_db()
    db = SessionLocal()

    try:
        existing = db.query(Product).first()
        if existing:
            print("✅ Data sudah ada, skip seeding.")
            return

        for shoe in SHOES:
            product = Product(
                name=shoe["name"],
                brand=shoe["brand"],
                price=shoe["price"],
                description=shoe["description"],
                image_filename=shoe["image_filename"],
                created_at=datetime.utcnow(),
            )
            db.add(product)
            db.flush()

            for size in SIZES:
                stock = Stock(
                    product_id=product.id,
                    size=size,
                    quantity=random.randint(5, 15),
                )
                db.add(stock)

            print(f"✅ Inserted: {shoe['name']}")

        db.commit()
        print("\n🎉 Seeding selesai! 6 produk berhasil ditambahkan.")
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
