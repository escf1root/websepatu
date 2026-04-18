"use client";

/**
 * src/app/admin/page.tsx
 * ─────────────────────────────────────────────────────────────────────
 * Admin Dashboard — Product Management
 *
 * HOW TO ACCESS: Go to http://localhost:3000/admin
 *
 * FEATURES:
 * - See all products in a table
 * - Edit product name, brand, price, description, image
 * - Add new products
 * - Delete products (with confirmation)
 * - Upload images via drag & drop
 *
 * SAFE: This page will NEVER break your cart or checkout.
 *       It only calls /api/products endpoints on the backend.
 * ─────────────────────────────────────────────────────────────────────
 */

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import AdminProductTable, {
  AdminProduct,
} from "@/components/AdminProductTable";

export default function AdminPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Fetch all products from backend ────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Gagal memuat produk dari backend.");
      const data: AdminProduct[] = await res.json();
      setProducts(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── Quick stats ─────────────────────────────────────────────────────
  const totalStock = products.reduce((s, p) => s + p.totalStock, 0);
  const outOfStock = products.filter((p) => p.totalStock === 0).length;
  const brands = new Set(products.map((p) => p.brand)).size;

  return (
    <div className="admin-page">
      {/* ── Top Navigation Bar ────────────────────────────────────────── */}
      <header className="admin-navbar">
        <div className="admin-navbar__inner">
          <div className="admin-navbar__left">
            {/* Logo/Title */}
            <div className="admin-navbar__logo">
              <span className="admin-navbar__logo-icon">🛠️</span>
              <div>
                <p className="admin-navbar__title">Admin Panel</p>
                <p className="admin-navbar__sub">SoleMate Management</p>
              </div>
            </div>
          </div>

          <div className="admin-navbar__right">
            {/* Refresh button */}
            <button
              onClick={fetchProducts}
              className="admin-btn admin-btn--ghost admin-btn--sm"
              aria-label="Refresh daftar produk"
              title="Refresh"
            >
              🔄 Refresh
            </button>

            {/* Back to shop */}
            <Link
              href="/products"
              className="admin-btn admin-btn--outline admin-btn--sm"
            >
              ← Kembali ke Toko
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main className="admin-main">
        {/* ── Page Title ─────────────────────────────────────────────── */}
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Manajemen Produk</h1>
            <p className="admin-page-subtitle">
              Tambah, edit, atau hapus produk sepatu. Perubahan langsung tampil
              di toko.
            </p>
          </div>
        </div>

        {/* ── Stats Cards ──────────────────────────────────────────────── */}
        {!loading && !error && (
          <div className="admin-stats">
            <div className="admin-stat-card">
              <span className="admin-stat-card__icon">📦</span>
              <div>
                <p className="admin-stat-card__value">{products.length}</p>
                <p className="admin-stat-card__label">Total Produk</p>
              </div>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-card__icon">🏷️</span>
              <div>
                <p className="admin-stat-card__value">{brands}</p>
                <p className="admin-stat-card__label">Brand</p>
              </div>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-card__icon">📊</span>
              <div>
                <p className="admin-stat-card__value">{totalStock}</p>
                <p className="admin-stat-card__label">Total Stok</p>
              </div>
            </div>
            <div
              className={`admin-stat-card ${outOfStock > 0 ? "admin-stat-card--warning" : ""}`}
            >
              <span className="admin-stat-card__icon">⚠️</span>
              <div>
                <p className="admin-stat-card__value">{outOfStock}</p>
                <p className="admin-stat-card__label">Habis</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Error State ───────────────────────────────────────────────── */}
        {error && (
          <div className="admin-alert admin-alert--error admin-alert--full">
            <strong>❌ Tidak bisa terhubung ke backend.</strong>
            <p>{error}</p>
            <p className="admin-alert__hint">
              Pastikan backend berjalan:{" "}
              <code>cd backend &amp;&amp; python main.py</code>
            </p>
            <button
              onClick={fetchProducts}
              className="admin-btn admin-btn--primary admin-btn--sm"
            >
              🔄 Coba Lagi
            </button>
          </div>
        )}

        {/* ── Loading State ─────────────────────────────────────────────── */}
        {loading && (
          <div className="admin-loading">
            <div className="admin-loading__spinner" />
            <p>Memuat produk...</p>
          </div>
        )}

        {/* ── Product Table ─────────────────────────────────────────────── */}
        {!loading && !error && (
          <AdminProductTable products={products} onRefresh={fetchProducts} />
        )}
      </main>
    </div>
  );
}
