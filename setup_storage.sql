-- ═══════════════════════════════════════════════════════════════════════════
-- setup_storage.sql
-- CARA PAKAI:
--   Buka Supabase Dashboard → Project → SQL Editor
--   Copy-paste file ini → Klik "Run"
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Buat bucket "product-images" sebagai PUBLIC ──────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,               -- ← WAJIB: public = URL bisa diakses tanpa auth
    5242880,            -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public             = true,
    file_size_limit    = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- ── 2. RLS: Izinkan semua orang melihat file (public read) ─────────────────
DROP POLICY IF EXISTS "Public read product-images" ON storage.objects;
CREATE POLICY "Public read product-images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'product-images');

-- ── 3. RLS: Izinkan upload (INSERT) ────────────────────────────────────────
DROP POLICY IF EXISTS "Service role upload product-images" ON storage.objects;
CREATE POLICY "Service role upload product-images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'product-images');

-- ── 4. RLS: Izinkan update/overwrite (UPDATE) ──────────────────────────────
DROP POLICY IF EXISTS "Service role update product-images" ON storage.objects;
CREATE POLICY "Service role update product-images"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'product-images');

-- ── 5. RLS: Izinkan hapus file (DELETE) ────────────────────────────────────
DROP POLICY IF EXISTS "Service role delete product-images" ON storage.objects;
CREATE POLICY "Service role delete product-images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'product-images');

-- ── Verifikasi: cek bucket sudah PUBLIC ────────────────────────────────────
SELECT id, name, public, file_size_limit
FROM storage.buckets
WHERE id = 'product-images';
-- Kolom "public" HARUS = true
