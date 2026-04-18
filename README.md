# 👟 SoleMate — Toko Sepatu Online Full-Stack

> Website toko sepatu modern yang dibangun dengan **Next.js 14** di sisi frontend dan **Python FastAPI** di sisi backend, tanpa Docker — langsung jalan di laptop kamu!

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?logo=python)](https://python.org/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite)](https://sqlite.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ Fitur Utama

| Fitur | Keterangan |
|---|---|
| 🛍️ **Katalog Produk** | Tampilkan semua produk sepatu dengan filter & sorting |
| 🛒 **Shopping Cart** | Tambah, hapus, dan ubah jumlah item di keranjang |
| 💳 **Checkout** | Proses pemesanan lengkap dengan kalkulasi ongkir otomatis |
| 🔧 **Admin Panel** | Upload produk, kelola stok per ukuran, edit & hapus produk |
| 📦 **Manajemen Stok** | Stok per ukuran (39–44) dengan pengurangan otomatis saat order |
| 🎨 **Design Modern** | UI dark mode dengan animasi Framer Motion |

---

## 🧱 Tech Stack

| Layer | Teknologi |
|---|---|
| **Frontend** | [Next.js 14](https://nextjs.org/) + [React 18](https://react.dev/) + TypeScript |
| **Backend** | [Python FastAPI](https://fastapi.tiangolo.com/) + Uvicorn |
| **Database** | SQLite (file otomatis terbuat, tidak perlu install apapun) |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) |
| **Animasi** | [Framer Motion](https://www.framer.com/motion/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |

---

## ✅ Prasyarat (Wajib Diinstall Dulu!)

Sebelum mulai, pastikan laptop kamu sudah punya semua ini:

### 1. Node.js (versi 18 ke atas)
Untuk menjalankan frontend Next.js.
- 📥 Download: **https://nodejs.org/** → pilih versi **LTS**
- Cara cek apakah sudah terinstall:
  ```bash
  node --version
  # Harus muncul: v18.x.x atau lebih tinggi
  
  npm --version
  # Harus muncul: 9.x.x atau lebih tinggi
  ```

### 2. Python (versi 3.9 ke atas)
Untuk menjalankan backend FastAPI.
- 📥 Download: **https://www.python.org/downloads/** → pilih versi **3.9+**
- ⚠️ **Penting saat install di Windows:** Centang opsi **"Add Python to PATH"**!
- Cara cek apakah sudah terinstall:
  ```bash
  python --version
  # Harus muncul: Python 3.9.x atau lebih tinggi
  
  pip --version
  # Harus muncul: pip 23.x.x atau lebih tinggi
  ```

### 3. Git (opsional, untuk clone repo)
- 📥 Download: **https://git-scm.com/downloads**
- Cara cek: `git --version`

---

## 🚀 Panduan Instalasi (Step-by-Step)

### Langkah 1: Setup Folder Proyek

**Opsi A — Clone dari Git:**
```bash
git clone https://github.com/username/solemate.git
cd solemate
```

**Opsi B — Sudah punya foldernya:**
Buka terminal/PowerShell, lalu masuk ke folder proyek:
```bash
cd C:\Users\NamaKamu\Desktop\websepatu1
```

---

### Langkah 2: Install Backend Dependencies

Masuk ke folder `backend` dan install semua library Python yang dibutuhkan:

```bash
cd backend
pip install fastapi uvicorn sqlalchemy
```

> 💡 **Tips:** Tidak ada file `requirements.txt`? Itu normal! Kamu tinggal install langsung seperti di atas.

Setelah install selesai, isi database dengan data produk awal (seed):

```bash
python seed.py
```

Kamu akan melihat pesan seperti `✅ Seed selesai` — artinya database sudah terisi data contoh.

Setelah itu, kembali ke folder root proyek:
```bash
cd ..
```

---

### Langkah 3: Install Frontend Dependencies

Dari folder root proyek, jalankan:

```bash
npm install
```

Proses ini akan mengunduh semua library JavaScript (bisa makan waktu 1–2 menit tergantung internet). Setelah selesai, akan muncul folder `node_modules/`.

---

### Langkah 4: Konfigurasi Environment Variables

Proyek ini menggunakan file `.env` untuk menyimpan konfigurasi. Ikuti langkah berikut:

**Untuk Frontend (file `.env.local` di root folder):**

Buat file baru bernama `.env.local` di folder root (sejajar dengan `package.json`):

```env
# URL Backend API — jangan diubah kalau backend jalan di port 8000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> ℹ️ Nama file `.env.local` adalah konvensi Next.js. File ini **tidak akan di-commit ke Git** (sudah ada di `.gitignore`).

**Untuk Backend (opsional, jika perlu konfigurasi tambahan):**

Backend SoleMate menggunakan SQLite yang filenya otomatis terbuat (`backend/solemate.db`), jadi tidak memerlukan konfigurasi database khusus.

---

## ▶️ Cara Menjalankan Proyek

> ⚠️ **PENTING: Kamu butuh 2 terminal yang berjalan bersamaan!**
> Backend dan frontend adalah dua aplikasi terpisah yang harus dinyalakan secara bersamaan.

---

### 🖥️ Terminal 1 — Backend (FastAPI)

Buka terminal pertama, masuk ke folder `backend`, lalu jalankan server:

```bash
cd backend
python main.py
```

Kalau berhasil, kamu akan melihat output seperti ini:

```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

✅ **Backend berjalan di:** `http://localhost:8000`
📄 **Dokumentasi API otomatis:** `http://localhost:8000/docs`

---

### 💻 Terminal 2 — Frontend (Next.js)

Buka terminal **kedua** yang baru (jangan tutup terminal pertama!), lalu dari folder root proyek:

```bash
npm run dev
```

Kalau berhasil, kamu akan melihat output seperti ini:

```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2.1s
```

✅ **Frontend berjalan di:** `http://localhost:3000`

---

### 🌐 Akses Website

Setelah kedua terminal berjalan, buka browser dan kunjungi:

| URL | Deskripsi |
|---|---|
| `http://localhost:3000` | Website utama SoleMate |
| `http://localhost:3000/products` | Halaman katalog produk |
| `http://localhost:3000/about` | Halaman tentang kami |
| `http://localhost:3000/checkout` | Halaman checkout |
| `http://localhost:8000/docs` | Dokumentasi API (Swagger UI) |

> 🔐 **Akses Admin Panel:** Tekan `Ctrl + Shift + A` di halaman mana saja untuk membuka panel admin.

---

## 📁 Struktur Folder

```
websepatu1/                    ← Root folder proyek
│
├── backend/                   ← 🧠 Otak dari aplikasi (server Python)
│   ├── main.py                ← File utama backend — semua API endpoint ada di sini
│   ├── models.py              ← Definisi tabel database (Product, Stock, Order)
│   ├── services.py            ← Logika bisnis (hitung harga, kelola stok)
│   ├── seed.py                ← Script untuk mengisi database dengan data awal
│   └── solemate.db            ← File database SQLite (otomatis terbuat)
│
├── src/                       ← 🎨 Tampilan aplikasi (kode Next.js)
│   ├── app/                   ← Halaman-halaman website
│   │   ├── page.tsx           ← Halaman utama (Homepage)
│   │   ├── products/          ← Halaman katalog produk
│   │   ├── about/             ← Halaman tentang kami
│   │   ├── checkout/          ← Halaman checkout & pembayaran
│   │   ├── admin/             ← Panel admin (upload produk, kelola stok)
│   │   ├── layout.tsx         ← Layout utama (Navbar, Footer, Fonts)
│   │   └── globals.css        ← CSS global & design system
│   ├── components/            ← Komponen reusable (Navbar, Card, dll.)
│   ├── hooks/                 ← Custom React hooks
│   ├── lib/                   ← Utility functions & helpers
│   └── store/                 ← State management (Zustand — untuk Cart)
│
├── public/                    ← File statis (gambar produk, favicon, dll.)
├── .env.local                 ← 🔑 Konfigurasi environment frontend (kamu harus buat ini)
├── package.json               ← Daftar dependencies frontend & scripts
├── next.config.mjs            ← Konfigurasi Next.js
└── tailwind.config.ts         ← Konfigurasi Tailwind CSS
```

### Penjelasan File Kunci

| File | Fungsi |
|---|---|
| `backend/main.py` | "Otak" backend — semua endpoint API (`/api/products`, `/api/order`, dll.) |
| `backend/models.py` | "Blueprint" database — mendefinisikan bentuk tabel Product, Stock, dan Order |
| `backend/seed.py` | Script satu kali untuk mengisi database dengan produk contoh |
| `backend/solemate.db` | File database SQLite — ini adalah "laci penyimpanan" semua data |
| `src/app/page.tsx` | Halaman beranda website |
| `src/app/layout.tsx` | Kerangka utama yang membungkus semua halaman (Navbar, dll.) |
| `src/store/` | Tempat menyimpan data cart yang bisa diakses dari mana saja |
| `.env.local` | File rahasia berisi URL backend (wajib kamu buat sendiri) |

---

## 🔐 Variabel Environment

### Frontend — `.env.local` (di root folder)

```env
# URL Backend API
# Ubah ini jika backend kamu berjalan di port atau host yang berbeda
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> ⚠️ **Perhatian:** Variabel yang diawali `NEXT_PUBLIC_` bisa diakses dari browser. **Jangan pernah** menyimpan password atau API secret key di sini!

### Backend — Konfigurasi di `main.py`

Backend SoleMate tidak memerlukan file `.env` terpisah karena menggunakan SQLite lokal. Konfigurasi utama ada langsung di `backend/main.py`:

```python
# Port server backend (default: 8000)
uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
```

Jika ingin mengganti port, ubah angka `8000` dan sesuaikan juga `NEXT_PUBLIC_API_URL` di `.env.local`.

---

## 🐛 Troubleshooting — Masalah Umum & Solusinya

### ❌ Error: `Port 8000 already in use` atau `Port 3000 already in use`

**Penyebab:** Ada proses lain yang sudah memakai port tersebut (mungkin kamu lupa menutup server sebelumnya).

**Solusi:**
```bash
# Windows PowerShell — cari siapa yang pakai port 8000
netstat -ano | findstr :8000

# Matikan proses berdasarkan PID yang muncul (ganti 12345 dengan PID yang kamu temukan)
taskkill /PID 12345 /F
```
Atau, cukup **restart laptop** untuk mengosongkan semua port.

---

### ❌ Error: `ModuleNotFoundError: No module named 'fastapi'`

**Penyebab:** Library Python belum terinstall.

**Solusi:**
```bash
cd backend
pip install fastapi uvicorn sqlalchemy
```

Jika masih error, coba:
```bash
python -m pip install fastapi uvicorn sqlalchemy
```

---

### ❌ Error: `Cannot find module` atau issue di `npm install`

**Penyebab:** Proses install Node.js packages gagal atau belum selesai.

**Solusi:**
```bash
# Hapus folder node_modules dan lock file, lalu install ulang
rmdir /s /q node_modules
del package-lock.json
npm install
```

---

### ❌ Error: `Failed to fetch` atau produk tidak muncul di website

**Penyebab:** Frontend tidak bisa terhubung ke backend. Kemungkinan backend belum jalan atau URL salah.

**Solusi:**
1. Pastikan **Terminal 1 (backend) sudah berjalan** — cek apakah ada tulisan `Uvicorn running on http://...`
2. Pastikan file `.env.local` sudah dibuat dengan isi yang benar:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
3. Coba buka `http://localhost:8000/docs` di browser — kalau muncul halaman Swagger, berarti backend oke.
4. Setelah mengubah `.env.local`, **restart frontend** dengan menekan `Ctrl+C` di Terminal 2 lalu jalankan ulang `npm run dev`.

---

### ❌ Error: `Database is locked` atau data tidak tersimpan

**Penyebab:** File database SQLite (`solemate.db`) terkunci atau corrupt.

**Solusi:**
```bash
# Hapus file database lama
cd backend
del solemate.db

# Buat ulang database dengan data segar
python seed.py
```

> ⚠️ Data yang sudah ada akan hilang. Ini hanya solusi jika database betul-betul bermasalah.

---

### ❌ Error: `python` tidak dikenali di Windows

**Penyebab:** Python belum ditambahkan ke PATH sistem saat instalasi.

**Solusi:**
1. Uninstall Python lalu install ulang dari https://python.org
2. Saat setup, **centang opsi "Add Python to PATH"**
3. Setelah install, tutup semua terminal lalu buka baru

Atau coba gunakan `py` sebagai ganti `python`:
```bash
py --version
py main.py
py seed.py
```

---

### ❌ Error: `'npm' is not recognized`

**Penyebab:** Node.js belum terinstall atau belum di-restart setelah install.

**Solusi:**
1. Download dan install Node.js dari https://nodejs.org/ (pilih versi LTS)
2. Tutup semua terminal yang terbuka
3. Buka terminal baru, lalu cek: `node --version`

---

## 🏃 Quick Start (Rangkuman Cepat)

Sudah pernah setup sebelumnya? Ini cara nyalakannya lagi:

```bash
# Terminal 1 — Backend
cd backend
python main.py

# Terminal 2 — Frontend (buka terminal baru!)
npm run dev
```

Buka browser → `http://localhost:3000` 🎉

---

## 📝 Lisensi

Proyek ini dibuat untuk keperluan belajar. Bebas digunakan dan dimodifikasi.

---

> 💬 **Ada masalah atau pertanyaan?** Cek bagian Troubleshooting di atas dulu ya! Semoga lancar coding-nya! 🚀
