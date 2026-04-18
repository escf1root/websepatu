-- ═══════════════════════════════════════════════════════════════════════════
-- SoleMate — Supabase Database Schema
-- ═══════════════════════════════════════════════════════════════════════════
-- CARA PAKAI:
--   1. Buka Supabase Dashboard → Project → SQL Editor
--   2. Copy-paste seluruh file ini
--   3. Klik "Run" (atau Ctrl+Enter)
--   4. Semua tabel + data awal akan otomatis terbuat
-- ═══════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. CREATE TABLES
-- ─────────────────────────────────────────────────────────────────────────────

-- Tabel produk sepatu
CREATE TABLE IF NOT EXISTS products (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(200)  NOT NULL,
    brand       VARCHAR(100)  NOT NULL,
    price       FLOAT         NOT NULL,
    description TEXT          NOT NULL,
    image_filename VARCHAR(500) NOT NULL DEFAULT '',
    created_at  TIMESTAMP     DEFAULT NOW()
);

-- Tabel stok per ukuran
CREATE TABLE IF NOT EXISTS stock (
    id          SERIAL PRIMARY KEY,
    product_id  INTEGER       NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size        VARCHAR(10)   NOT NULL,
    quantity    INTEGER       NOT NULL DEFAULT 0,
    UNIQUE (product_id, size)
);

-- Tabel order / pesanan
CREATE TABLE IF NOT EXISTS orders (
    id                SERIAL PRIMARY KEY,
    order_number      VARCHAR(50)   UNIQUE NOT NULL,
    items_json        TEXT          NOT NULL,
    subtotal          FLOAT         NOT NULL,
    tax               FLOAT         NOT NULL,
    shipping          FLOAT         NOT NULL,
    discount          FLOAT         NOT NULL,
    total_price       FLOAT         NOT NULL,
    shipping_address  TEXT          NOT NULL,
    status            VARCHAR(50)   DEFAULT 'pending',
    created_at        TIMESTAMP     DEFAULT NOW()
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. INDEXES (optional — speeds up queries)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_stock_product_id ON stock(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────────────────────
-- Enable RLS agar data aman secara default

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock     ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders    ENABLE ROW LEVEL SECURITY;

-- Policy: siapa saja bisa READ produk & stok (tampilkan di toko)
CREATE POLICY "Public read products"
    ON products FOR SELECT USING (true);

CREATE POLICY "Public read stock"
    ON stock FOR SELECT USING (true);

-- Policy: hanya service_role yang bisa INSERT / UPDATE / DELETE
-- (Next.js admin upload route pakai service_role_key, jadi ini aman)
CREATE POLICY "Service role full access products"
    ON products FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access stock"
    ON stock FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access orders"
    ON orders FOR ALL USING (auth.role() = 'service_role');

-- Policy: orders bisa di-INSERT oleh siapa saja (checkout publik),
-- tapi hanya bisa di-READ & di-UPDATE oleh service_role
CREATE POLICY "Public insert orders"
    ON orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role read orders"
    ON orders FOR SELECT USING (auth.role() = 'service_role');


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. SEED DATA — Produk Default
-- ─────────────────────────────────────────────────────────────────────────────
-- Hanya insert jika tabel masih kosong

DO $$
DECLARE
    v_id INTEGER;
BEGIN
    -- Lewati jika sudah ada data
    IF (SELECT COUNT(*) FROM products) > 0 THEN
        RAISE NOTICE 'Produk sudah ada, skip seeding.';
        RETURN;
    END IF;

    -- Nike Air Max 270
    INSERT INTO products (name, brand, price, description, image_filename)
    VALUES (
        'Nike Air Max 270', 'Nike', 2100000,
        'Sepatu lifestyle ikonik dengan bantalan Air Max terbesar di tumit. Desain futuristik dengan warna yang berani, nyaman untuk dipakai seharian.',
        'nike-airmax-270.jpg'
    ) RETURNING id INTO v_id;
    INSERT INTO stock (product_id, size, quantity) VALUES
        (v_id,'39',10),(v_id,'40',12),(v_id,'41',8),(v_id,'42',15),(v_id,'43',7),(v_id,'44',5);

    -- Adidas Ultraboost 22
    INSERT INTO products (name, brand, price, description, image_filename)
    VALUES (
        'Adidas Ultraboost 22', 'Adidas', 2400000,
        'Dilengkapi dengan teknologi Boost terbaru untuk pengembalian energi maksimal. Cocok untuk lari jarak jauh maupun aktivitas sehari-hari.',
        'adidas-ultraboost-22.jpg'
    ) RETURNING id INTO v_id;
    INSERT INTO stock (product_id, size, quantity) VALUES
        (v_id,'39',6),(v_id,'40',9),(v_id,'41',11),(v_id,'42',14),(v_id,'43',8),(v_id,'44',3);

    -- New Balance 574
    INSERT INTO products (name, brand, price, description, image_filename)
    VALUES (
        'New Balance 574', 'New Balance', 1350000,
        'Sneaker klasik yang telah menjadi ikon streetwear selama puluhan tahun. Sol ENCAP memberikan dukungan dan bantalan yang superior.',
        'newbalance-574.jpg'
    ) RETURNING id INTO v_id;
    INSERT INTO stock (product_id, size, quantity) VALUES
        (v_id,'39',13),(v_id,'40',10),(v_id,'41',7),(v_id,'42',9),(v_id,'43',11),(v_id,'44',6);

    -- Vans Old Skool
    INSERT INTO products (name, brand, price, description, image_filename)
    VALUES (
        'Vans Old Skool', 'Vans', 950000,
        'Skateboard shoe legendaris dengan desain timeless. Bagian atas kanvas dan suede dengan garis tanda tangan Vans yang ikonik.',
        'vans-oldskool.jpg'
    ) RETURNING id INTO v_id;
    INSERT INTO stock (product_id, size, quantity) VALUES
        (v_id,'39',15),(v_id,'40',12),(v_id,'41',10),(v_id,'42',8),(v_id,'43',5),(v_id,'44',4);

    -- Converse Chuck 70
    INSERT INTO products (name, brand, price, description, image_filename)
    VALUES (
        'Converse Chuck 70', 'Converse', 850000,
        'Versi premium dari Chuck Taylor All Star original. Konstruksi premium dengan lapisan tumit yang lebih tebal dan ortholite insole.',
        'converse-chuck70.jpg'
    ) RETURNING id INTO v_id;
    INSERT INTO stock (product_id, size, quantity) VALUES
        (v_id,'39',8),(v_id,'40',11),(v_id,'41',9),(v_id,'42',13),(v_id,'43',7),(v_id,'44',5);

    -- Puma RS-X
    INSERT INTO products (name, brand, price, description, image_filename)
    VALUES (
        'Puma RS-X', 'Puma', 1150000,
        'Terinspirasi dari teknologi RS lari era 80-an. Desain chunky yang bold dengan upper multi-material dan sol tebal yang statement.',
        'puma-rsx.jpg'
    ) RETURNING id INTO v_id;
    INSERT INTO stock (product_id, size, quantity) VALUES
        (v_id,'39',9),(v_id,'40',7),(v_id,'41',12),(v_id,'42',10),(v_id,'43',8),(v_id,'44',6);

    RAISE NOTICE 'Seeding selesai — 6 produk default berhasil ditambahkan.';
END $$;
