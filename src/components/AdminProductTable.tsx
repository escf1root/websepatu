'use client';

/**
 * AdminProductTable.tsx
 * ─────────────────────────────────────────────────────────────────────
 * Displays all products in a table with Edit and Delete buttons.
 * Edit opens a modal form that lets you change name, brand, price,
 * description, and image — then saves via PUT /api/products/:id.
 * Delete shows a confirmation dialog before calling DELETE /api/products/:id.
 * ─────────────────────────────────────────────────────────────────────
 */

import { useState } from 'react';
import { normalizeBrandName, formatPrice } from '@/lib/utils';
import ImageUploader from './ImageUploader';

// ── Types ───────────────────────────────────────────────────────────────
export interface AdminProduct {
  id: number;
  name: string;
  brand: string;
  price: number;
  description: string;
  imageFilename: string;
  totalStock: number;
  stockBySize?: Record<string, number>;
}

const SIZES = ['39', '40', '41', '42', '43', '44'];

interface AdminProductTableProps {
  products: AdminProduct[];
  onRefresh: () => void; // called after edit/delete so the list updates
}

// ── Default form state ─────────────────────────────────────────────────
const emptyForm = {
  name: '',
  brand: '',
  price: '',
  description: '',
  imageFilename: '',
};

// ── Component ───────────────────────────────────────────────────────────
export default function AdminProductTable({ products, onRefresh }: AdminProductTableProps) {
  // Modal: 'none' | 'edit' | 'add'
  const [modalMode, setModalMode] = useState<'none' | 'edit' | 'add'>('none');
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Stock modal state ────────────────────────────────────────────────
  const [stockProduct, setStockProduct] = useState<AdminProduct | null>(null);
  const [stockForm, setStockForm] = useState<Record<string, string>>({});
  const [stockSaving, setStockSaving] = useState(false);
  const [stockError, setStockError] = useState('');

  // ── Open Edit modal ──────────────────────────────────────────────────
  const openEdit = (product: AdminProduct) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      brand: product.brand,
      price: String(product.price),
      description: product.description,
      imageFilename: product.imageFilename,
    });
    setFormError('');
    setModalMode('edit');
  };

  // ── Open Add modal ───────────────────────────────────────────────────
  const openAdd = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setFormError('');
    setModalMode('add');
  };

  const closeModal = () => {
    setModalMode('none');
    setEditingProduct(null);
    setFormError('');
  };

  // ── Handle form field changes ────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ── Called by ImageUploader when upload succeeds ─────────────────────
  const handleImageUploaded = (filename: string) => {
    setForm((prev) => ({ ...prev, imageFilename: filename }));
  };

  // ── Validate the form before save ────────────────────────────────────
  const validateForm = (): string | null => {
    if (!form.name.trim()) return 'Nama produk wajib diisi.';
    if (!form.brand.trim()) return 'Brand wajib diisi.';
    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) return 'Harga harus angka positif.';
    if (!form.description.trim()) return 'Deskripsi wajib diisi.';
    if (!form.imageFilename.trim()) return 'Gambar produk wajib diupload.';
    return null;
  };

  // ── Save (create or update) ──────────────────────────────────────────
  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSaving(true);
    setFormError('');

    const payload = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      price: parseFloat(form.price),
      description: form.description.trim(),
      image_filename: form.imageFilename.trim(),
    };

    try {
      let res: Response;

      if (modalMode === 'edit' && editingProduct) {
        // UPDATE existing product
        res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // CREATE new product
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail ?? 'Gagal menyimpan produk.');
      }

      closeModal();
      onRefresh(); // Re-fetch the full product list
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan server.';
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete product ────────────────────────────────────────────────────
  const handleDelete = async (productId: number) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail ?? 'Gagal menghapus produk.');
      }
      setDeleteConfirmId(null);
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan.';
      alert(`❌ ${msg}`);
    } finally {
      setDeleting(false);
    }
  };

  // ── Open / Close Stock modal ─────────────────────────────────────────
  const openStock = (product: AdminProduct) => {
    setStockProduct(product);
    const initial: Record<string, string> = {};
    SIZES.forEach((size) => {
      initial[size] = String(product.stockBySize?.[size] ?? 0);
    });
    setStockForm(initial);
    setStockError('');
  };

  const closeStock = () => {
    setStockProduct(null);
    setStockError('');
  };

  // ── Save stock per-size to backend ───────────────────────────────────
  const handleSaveStock = async () => {
    if (!stockProduct) return;
    setStockSaving(true);
    setStockError('');

    const payload: Record<string, number> = {};
    for (const size of SIZES) {
      const val = parseInt(stockForm[size] ?? '0', 10);
      if (isNaN(val) || val < 0) {
        setStockError(`Stok ukuran ${size} harus angka ≥ 0.`);
        setStockSaving(false);
        return;
      }
      payload[size] = val;
    }

    try {
      const res = await fetch(
        `/api/products/${stockProduct.id}/stock`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stock_by_size: payload }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail ?? 'Gagal menyimpan stok.');
      }
      closeStock();
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan server.';
      setStockError(msg);
    } finally {
      setStockSaving(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Add Product Button ──────────────────────────────────────── */}
      <div className="admin-table-header">
        <p className="admin-table-count">{products.length} produk terdaftar</p>
        <button
          onClick={openAdd}
          className="admin-btn admin-btn--primary"
          id="btn-add-product"
        >
          + Tambah Produk
        </button>
      </div>

      {/* ── Product Table ───────────────────────────────────────────── */}
      <div className="admin-table-wrapper">
        <table className="admin-table" aria-label="Daftar produk">
          <thead>
            <tr>
              <th>Gambar</th>
              <th>Nama</th>
              <th>Brand</th>
              <th>Harga</th>
              <th>Stok</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                {/* Image */}
                <td>
                  <img
                    src={`/images/shoes/${p.imageFilename}`}
                    alt={p.name}
                    className="admin-table__thumb"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://placehold.co/60x60/f4f4f5/71717a?text=?';
                    }}
                  />
                </td>

                {/* Name */}
                <td>
                  <span className="admin-table__product-name">{p.name}</span>
                  <span className="admin-table__product-id">ID #{p.id}</span>
                </td>

                {/* Brand — normalized to fix typos */}
                <td>
                  <span className="admin-table__brand">
                    {normalizeBrandName(p.brand)}
                  </span>
                </td>

                {/* Price */}
                <td>
                  <span className="admin-table__price">{formatPrice(p.price)}</span>
                </td>

                {/* Stock */}
                <td>
                  <span
                    className={`admin-table__stock ${
                      p.totalStock === 0
                        ? 'admin-table__stock--empty'
                        : p.totalStock < 10
                        ? 'admin-table__stock--low'
                        : 'admin-table__stock--ok'
                    }`}
                  >
                    {p.totalStock}
                  </span>
                </td>

                {/* Actions */}
                <td>
                  <div className="admin-table__actions">
                    <button
                      onClick={() => openEdit(p)}
                      className="admin-btn admin-btn--sm admin-btn--outline"
                      aria-label={`Edit ${p.name}`}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => openStock(p)}
                      className="admin-btn admin-btn--sm admin-btn--stock"
                      aria-label={`Kelola stok ${p.name}`}
                    >
                      📦 Stok
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(p.id)}
                      className="admin-btn admin-btn--sm admin-btn--danger"
                      aria-label={`Hapus ${p.name}`}
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Edit / Add Modal ─────────────────────────────────────────── */}
      {modalMode !== 'none' && (
        <div
          className="admin-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
          role="dialog"
          aria-modal="true"
          aria-label={modalMode === 'edit' ? 'Edit produk' : 'Tambah produk baru'}
        >
          <div className="admin-modal">
            <div className="admin-modal__header">
              <h2 className="admin-modal__title">
                {modalMode === 'edit' ? '✏️ Edit Produk' : '➕ Tambah Produk Baru'}
              </h2>
              <button
                onClick={closeModal}
                className="admin-modal__close"
                aria-label="Tutup modal"
              >
                ✕
              </button>
            </div>

            <div className="admin-modal__body">
              {/* Image Upload */}
              <div className="admin-form-group">
                <label className="admin-label">Gambar Produk</label>
                <ImageUploader
                  currentImageFilename={
                    modalMode === 'edit' ? editingProduct?.imageFilename : undefined
                  }
                  onUploadComplete={handleImageUploaded}
                />
                {form.imageFilename && (
                  <p className="admin-form-hint">
                    File: <code>{form.imageFilename}</code>
                  </p>
                )}
              </div>

              {/* Name */}
              <div className="admin-form-group">
                <label htmlFor="form-name" className="admin-label">
                  Nama Produk <span className="admin-required">*</span>
                </label>
                <input
                  id="form-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  className="admin-input"
                  placeholder="Contoh: Nike Air Max 270"
                  maxLength={200}
                />
              </div>

              {/* Brand */}
              <div className="admin-form-group">
                <label htmlFor="form-brand" className="admin-label">
                  Brand <span className="admin-required">*</span>
                </label>
                <input
                  id="form-brand"
                  name="brand"
                  type="text"
                  value={form.brand}
                  onChange={handleChange}
                  className="admin-input"
                  placeholder="Contoh: Nike"
                  maxLength={100}
                />
              </div>

              {/* Price */}
              <div className="admin-form-group">
                <label htmlFor="form-price" className="admin-label">
                  Harga (IDR) <span className="admin-required">*</span>
                </label>
                <input
                  id="form-price"
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  className="admin-input"
                  placeholder="Contoh: 2100000"
                  min={1}
                  step={1000}
                />
              </div>

              {/* Description */}
              <div className="admin-form-group">
                <label htmlFor="form-description" className="admin-label">
                  Deskripsi <span className="admin-required">*</span>
                </label>
                <textarea
                  id="form-description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="admin-input admin-textarea"
                  placeholder="Deskripsi lengkap produk..."
                  rows={4}
                />
              </div>

              {/* Validation Error */}
              {formError && (
                <div className="admin-alert admin-alert--error" role="alert">
                  ⚠️ {formError}
                </div>
              )}
            </div>

            <div className="admin-modal__footer">
              <button
                onClick={closeModal}
                className="admin-btn admin-btn--ghost"
                disabled={saving}
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="admin-btn admin-btn--primary"
                disabled={saving}
                id="btn-save-product"
              >
                {saving ? '⏳ Menyimpan...' : modalMode === 'edit' ? '💾 Simpan Perubahan' : '✅ Tambah Produk'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Dialog ───────────────────────────────── */}
      {deleteConfirmId !== null && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Konfirmasi hapus produk"
        >
          <div className="admin-modal admin-modal--sm">
            <div className="admin-modal__header">
              <h2 className="admin-modal__title">🗑️ Hapus Produk?</h2>
            </div>
            <div className="admin-modal__body">
              <p className="admin-confirm-text">
                Produk{' '}
                <strong>
                  {products.find((p) => p.id === deleteConfirmId)?.name ?? `#${deleteConfirmId}`}
                </strong>{' '}
                akan dihapus permanen dari database.
              </p>
              <div className="admin-alert admin-alert--warning">
                ⚠️ Aksi ini tidak bisa dibatalkan. Pastikan produk ini tidak ada di keranjang
                pelanggan.
              </div>
            </div>
            <div className="admin-modal__footer">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="admin-btn admin-btn--ghost"
                disabled={deleting}
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="admin-btn admin-btn--danger"
                disabled={deleting}
                id="btn-confirm-delete"
              >
                {deleting ? '⏳ Menghapus...' : '🗑️ Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Stock Management Modal ──────────────────────────────────────── */}
      {stockProduct !== null && (
        <div
          className="admin-modal-backdrop"
          onClick={(e) => { if (e.target === e.currentTarget) closeStock(); }}
          role="dialog"
          aria-modal="true"
          aria-label="Kelola stok produk"
        >
          <div className="admin-modal">
            <div className="admin-modal__header">
              <h2 className="admin-modal__title">📦 Stok — {stockProduct.name}</h2>
              <button onClick={closeStock} className="admin-modal__close" aria-label="Tutup modal">✕</button>
            </div>

            <div className="admin-modal__body">
              <p className="admin-form-hint" style={{ marginBottom: '4px' }}>
                Atur jumlah stok untuk masing-masing ukuran. Perubahan langsung tampil di toko.
              </p>
              <div className="admin-stock-grid">
                {SIZES.map((size) => (
                  <div key={size} className="admin-stock-item">
                    <label htmlFor={`stock-size-${size}`} className="admin-stock-label">
                      Ukuran {size}
                    </label>
                    <input
                      id={`stock-size-${size}`}
                      type="number"
                      min={0}
                      step={1}
                      value={stockForm[size] ?? '0'}
                      onChange={(e) =>
                        setStockForm((prev) => ({ ...prev, [size]: e.target.value }))
                      }
                      className="admin-input admin-stock-input"
                    />
                  </div>
                ))}
              </div>

              {stockError && (
                <div className="admin-alert admin-alert--error" role="alert">
                  ⚠️ {stockError}
                </div>
              )}
            </div>

            <div className="admin-modal__footer">
              <button onClick={closeStock} className="admin-btn admin-btn--ghost" disabled={stockSaving}>
                Batal
              </button>
              <button
                onClick={handleSaveStock}
                className="admin-btn admin-btn--primary"
                disabled={stockSaving}
                id="btn-save-stock"
              >
                {stockSaving ? '⏳ Menyimpan...' : '💾 Simpan Stok'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
