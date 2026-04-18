from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
import os

# ──────────────────────────────────────────────────────────────────────────────
# Database URL Resolution
# Priority:
#   1. DATABASE_URL env var  → PostgreSQL (Neon / Supabase) — persistent ✅
#   2. VERCEL env var set    → SQLite /tmp (ephemeral, cold-start loses data) ⚠️
#   3. Local dev             → SQLite file solemate.db ✅
# ──────────────────────────────────────────────────────────────────────────────
_db_url = os.environ.get("DATABASE_URL", "")

if _db_url:
    # Neon / Heroku sometimes give postgres:// — SQLAlchemy needs postgresql://
    if _db_url.startswith("postgres://"):
        _db_url = _db_url.replace("postgres://", "postgresql://", 1)
    DATABASE_URL = _db_url
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,          # detect stale connections in serverless
        pool_size=1,                 # keep pool small for serverless
        max_overflow=0,
    )
elif os.environ.get("VERCEL"):
    # Vercel without a DATABASE_URL — still works but data is ephemeral
    DATABASE_URL = "sqlite:////tmp/solemate.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # Local development
    DATABASE_URL = "sqlite:///./solemate.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    brand = Column(String(100), nullable=False)
    price = Column(Float, nullable=False)
    description = Column(Text, nullable=False)
    image_filename = Column(String(300), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Stock(Base):
    __tablename__ = "stock"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    size = Column(String(10), nullable=False)
    quantity = Column(Integer, nullable=False, default=0)


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, nullable=False)
    items_json = Column(Text, nullable=False)
    subtotal = Column(Float, nullable=False)
    tax = Column(Float, nullable=False)
    shipping = Column(Float, nullable=False)
    discount = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    shipping_address = Column(Text, nullable=False)
    status = Column(String(50), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)


def init_db():
    Base.metadata.create_all(bind=engine)
