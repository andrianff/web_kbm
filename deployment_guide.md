# 🚀 Panduan Deployment Gratis KBM (Kos Bu Mary)

Ikuti langkah-langkah ini untuk memindahkan project Anda dari komputer lokal ke internet sehingga bisa diakses oleh siapa saja.

---

## 🏗️ Tahap 1: Setup Database (TiDB Cloud)
TiDB Cloud menyediakan MySQL-compatible serverless database secara gratis.

1.  Daftar di [TiDB Cloud](https://pingcap.com/products/tidb-cloud/).
2.  Buat cluster baru (pilih **Serverless Tier** - Free).
3.  Pilih **Connect** -> **Standard Connection**.
4.  Catat detail koneksi (Host, User, Password, Port).
5.  Database Anda kemungkinan besar bernama `test` secara default.
6.  **DSN Anda nanti akan berbentuk seperti ini:**
    `user:password@tcp(host:4000)/test?charset=utf8mb4&parseTime=True&loc=Local&tls=true`
    *(Ingat: TiDB menggunakan port **4000**, bukan 3306)*.

---

## ⚙️ Tahap 2: Setup Backend (Render)
Render akan menghosting kode Go Anda.

1.  Push kode Anda ke GitHub (Anda sudah melakukan ini, pastikan branch `main` terbaru).
2.  Daftar di [Render.com](https://render.com/).
3.  Klik **New** -> **Web Service**.
4.  Hubungkan akun GitHub Anda dan pilih repository `web_kbm`.
5.  **Konfigurasi Service:**
    - **Name:** `kbm-backend`
    - **Root Directory:** `backend` (PENTING)
    - **Environment:** `Go`
    - **Build Command:** `go build -o app main.go`
    - **Start Command:** `./app`
6.  Klik **Advanced** -> **Add Environment Variable**:
    - `DB_DSN`: (Masukkan DSN dari TiDB Cloud tadi)
    - `ALLOWED_ORIGINS`: (Biarkan kosong dulu, nanti diisi URL Vercel)
7.  Deploy! Setelah sukses, Anda akan mendapatkan URL seperti `https://kbm-backend.onrender.com`.

---

## 🎨 Tahap 3: Setup Frontend (Vercel)
Vercel akan menghosting tampilan React Anda.

1.  Daftar di [Vercel](https://vercel.com/).
2.  Klik **Add New** -> **Project**.
3.  Pilih repository `web_kbm`.
4.  **Konfigurasi Project:**
    - **Root Directory:** `frontend` (PENTING)
    - **Build Command:** `npm run build`
    - **Output Directory:** `dist`
5.  Buka bagian **Environment Variables** dan tambahkan:
    - `VITE_API_URL`: `https://kbm-backend.onrender.com/api` (URL Render Anda + /api)
6.  Klik **Deploy**.
7.  Anda akan mendapatkan URL seperti `https://web-kbm.vercel.app`.

---

## 🔗 Tahap Akhir: Hubungkan Keduanya
Agar Backend mau menerima data dari Frontend:

1.  Kembali ke Dashboard **Render (Backend)**.
2.  Masuk ke **Environment Variables**.
3.  Update variable `ALLOWED_ORIGINS` dengan URL Vercel Anda tadi.
    - Contoh: `https://web-kbm.vercel.app`
4.  Save dan Render akan melakukan redeploy otomatis.

---

### 🎉 Selesai!
Sekarang Portal Kos KBM Anda sudah online sepenuhnya secara gratis!

> [!TIP]
> **Penting untuk Lokal:** Sekarang di laptop Anda, jangan lupa buat file `.env` di dalam folder `backend/` dan `frontend/` (copy dari `.env.example`) agar project tetap bisa jalan di Laragon seperti biasa.
