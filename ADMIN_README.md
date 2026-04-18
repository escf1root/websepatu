# 🛠️ SoleMate Admin Panel — Panduan Lengkap

Dokumen ini menjelaskan cara menggunakan fitur admin yang baru ditambahkan.
**Ditulis untuk pemula — tidak perlu pengalaman coding!**

---

## 🚀 Cara Menjalankan Project

### Terminal 1 — Backend (Python)
```bash
cd backend
python main.py
```
Backend akan berjalan di: **http://localhost:8000**

### Terminal 2 — Frontend (Next.js)
```bash
npm run dev
```
Frontend akan berjalan di: **http://localhost:3000**

---

## 🔗 Halaman-Halaman Penting

| Halaman | URL | Keterangan |
|---|---|---|
| **Beranda** | http://localhost:3000 | Landing page utama |
| **Produk** | http://localhost:3000/products | Daftar semua sepatu |
| **Admin** | http://localhost:3000/admin | Panel manajemen produk ← BARU |
| **Backend API** | http://localhost:8000/docs | Dokumentasi API otomatis |

---

## 📂 File-File Baru yang Dibuat

```
src/
├── app/
│   └── admin/
│       ├── page.tsx          ← Halaman admin utama
│       └── upload/
│           └── route.ts      ← API upload gambar
├── components/
│   ├── AdminProductTable.tsx ← Tabel produk dengan Edit/Delete
│   └── ImageUploader.tsx     ← Komponen drag-and-drop upload
└── lib/
    └── utils.ts              ← Fungsi utilitas (normalizeBrandName, dll.)

backend/
└── main.py                   ← Ditambah 3 endpoint baru (tidak mengubah yang lama)
```

---

## ✨ Fitur Admin Panel

### 1. Melihat Semua Produk
- Buka http://localhost:3000/admin
- Tabel menampilkan: Gambar, Nama, Brand, Harga, Stok

### 2. Edit Produk
1. Klik tombol **✏️ Edit** di baris produk
2. Ubah nama, brand, harga, atau deskripsi
3. (Opsional) Upload gambar baru
4. Klik **💾 Simpan Perubahan**

### 3. Upload Gambar Produk
1. Di dalam form Edit/Tambah, klik area gambar
2. Atau **drag & drop** file langsung ke area tersebut
3. Klik **⬆️ Upload Gambar** untuk mengupload
4. Setelah selesai, klik Simpan Perubahan

**Format yang didukung:** JPG, PNG, WebP  
**Ukuran maksimal:** 5MB  
**Lokasi penyimpanan:** `public/images/shoes/`

### 4. Tambah Produk Baru
1. Klik tombol **+ Tambah Produk** (pojok kanan atas tabel)
2. Isi semua kolom yang ada bintang merah (*)
3. Upload gambar produk
4. Klik **✅ Tambah Produk**

> ⚠️ Produk baru akan punya stok 0 untuk semua ukuran (39-44).
> Untuk menambah stok, hubungi developer atau langsung edit database.

### 5. Hapus Produk
1. Klik tombol **🗑️ Hapus**
2. Baca konfirmasi dengan teliti
3. Klik **Ya, Hapus** untuk konfirmasi

> ⚠️ **PERHATIAN:** Hapus produk tidak bisa dibatalkan!

---

## 🔧 Perbaikan Brand Name

Brand "**Compasss**" (dengan 3 huruf s) akan otomatis ditampilkan sebagai "**Compass**" di:
- Halaman produk (/products)
- Kartu produk (ProductCard)
- Tabel admin

**Database TIDAK diubah.** Ini hanya perbaikan tampilan menggunakan fungsi:
```typescript
// src/lib/utils.ts
normalizeBrandName('Compasss') // → 'Compass'
```

Untuk memperbaiki langsung di database, edit produk via admin panel → ubah field Brand dari "Compasss" menjadi "Compass" → Simpan.

---

## 🛡️ Yang TIDAK Berubah (Aman)

- ✅ Halaman beranda (/) — tidak berubah
- ✅ Halaman produk (/products) — tidak berubah (hanya tambah brand fix)
- ✅ Keranjang belanja — tidak berubah sama sekali
- ✅ Checkout — tidak berubah sama sekali
- ✅ Order flow — tidak berubah sama sekali
- ✅ Database schema (models.py) — tidak disentuh
- ✅ Endpoint API lama — tidak diubah, hanya ditambah yang baru
- ✅ seed.py — tidak diubah (tetap bisa dipakai sebagai backup)

---

## 🆘 Troubleshooting

### ❌ "Admin tidak bisa connect ke backend"
```
Pastikan backend sudah berjalan:
  cd backend
  python main.py

Cek di browser: http://localhost:8000/docs
```

### ❌ "Upload gambar gagal"
- Pastikan format file: JPG, PNG, atau WebP
- Pastikan ukuran file tidak lebih dari 5MB
- Pastikan frontend (`npm run dev`) sudah berjalan

### ❌ "Produk tidak muncul setelah tambah"
- Klik tombol **🔄 Refresh** di navbar admin
- Atau reload halaman

### ❌ "Gambar produk tidak tampil" (kotak putih/placeholder)
- Nama file gambar di database harus cocok dengan file di `public/images/shoes/`
- Contoh: kalau database bilang `nike-airmax-270.jpg`, maka file harus ada di `public/images/shoes/nike-airmax-270.jpg`

### ❌ "Semuanya rusak / data hilang"
Jalankan seed ulang untuk memulihkan 6 produk awal:
```bash
cd backend
# Hapus database dulu (BACKUP dulu jika perlu!)
del solemate.db
# Seed ulang
python seed.py
# Jalankan backend
python main.py
```

---

## 📋 Checklist Test

Setelah menjalankan project, pastikan semua ini berhasil:

- [ ] Buka http://localhost:3000 → halaman beranda tampil normal
- [ ] Buka http://localhost:3000/products → 6 produk tampil
- [ ] "Compasss" tampil sebagai "Compass" di filter brand
- [ ] Klik produk → detail produk tampil
- [ ] Tambah ke keranjang → keranjang bertambah
- [ ] Buka http://localhost:3000/admin → tabel 6 produk tampil
- [ ] Edit produk → ubah nama → Simpan → nama berubah di tabel
- [ ] Upload gambar di Edit → gambar preview tampil → Upload berhasil
- [ ] Tambah produk baru → muncul di tabel dan di /products
- [ ] Hapus produk → hilang dari tabel
- [ ] Checkout masih berhasil (end-to-end test)

---

## 📡 Endpoint API Baru (untuk referensi)

| Method | Endpoint | Fungsi |
|---|---|---|
| `GET` | `/api/products` | Daftar semua produk *(sudah ada)* |
| `GET` | `/api/products/{id}` | Detail 1 produk *(sudah ada)* |
| `POST` | `/api/products` | **Tambah produk baru** ← baru |
| `PUT` | `/api/products/{id}` | **Edit produk** ← baru |
| `DELETE` | `/api/products/{id}` | **Hapus produk** ← baru |
| `POST` | `/admin/upload` | **Upload gambar** ← baru (Next.js) |

Dokumentasi API lengkap: http://localhost:8000/docs

---

*Dibuat dengan ❤️ untuk SoleMate Project*
