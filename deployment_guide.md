# 🚀 Panduan Deployment Gratis KBM (Kos Bu Mary) - Vercel Edition

Ikuti langkah-langkah ini untuk men-deploy project Anda secara **100% GRATIS dan TANPA KARTU KREDIT**.

---

## 🏗️ Tahap 1: Setup Database (TiDB Cloud)
TiDB Cloud menyediakan MySQL serverless secara gratis tanpa kartu kredit.

1.  Daftar di [TiDB Cloud](https://pingcap.com/products/tidb-cloud/).
2.  Buat cluster baru (pilih **Serverless Tier** - Free).
3.  Pilih **Connect** -> **Standard Connection**.
4.  Dapatkan detailnya (Host, User, Password).
5.  **DSN Anda nanti akan berbentuk seperti ini (WAJIB ADA `tls=skip-verify`):**
    `user:password@tcp(host:4000)/test?charset=utf8mb4&parseTime=True&loc=Local&tls=skip-verify`
    *(Ingat: TiDB menggunakan port **4000**)*.

---

## ⚙️ Tahap 2: Setup Backend (Vercel)
Kita akan menggunakan Vercel untuk menghosting Backend juga agar gratis selamanya tanpa kartu kredit.

1.  Buka Dashboard [Vercel](https://vercel.com).
2.  Klik **Add New** -> **Project**.
3.  Pilih repository **`web_kbm`** Anda.
4.  **Konfigurasi Project Backend:**
    - **Project Name:** `kbm-backend` (atau nama lain)
    - **Root Directory:** Pilih folder **`backend`**.
    - **Framework Preset:** Biarkan `Other`.
5.  Buka bagian **Environment Variables** dan tambahkan:
    - `DB_DSN`: (Isi dengan DSN dari TiDB tadi)
6.  Klik **Deploy**.
7.  Setelah sukses, Anda akan mendapatkan URL seperti `https://kbm-backend.vercel.app`.

---

## 🎨 Tahap 3: Setup Frontend (Vercel)
Sama seperti backend, namun arahkan ke folder frontend.

1.  Klik **Add New** -> **Project** lagi di Vercel.
2.  Pilih repository **`web_kbm`** yang sama.
3.  **Konfigurasi Project Frontend:**
    - **Project Name:** `kbm-kos` (atau nama lain)
    - **Root Directory:** Pilih folder **`frontend`**.
    - **Framework Preset:** `Vite`.
4.  Buka bagian **Environment Variables** dan tambahkan:
    - `VITE_API_URL`: `https://kbm-backend.vercel.app/api` (URL Backend Anda tadi + /api)
5.  Klik **Deploy**.

---

## 🔗 Tahap Akhir: Hubungkan Keduanya
Agar Backend menerima data dari Frontend, tambahkan variabel keamanan ini:

1.  Kembali ke Project **Backend** di Vercel.
2.  Buka **Settings** -> **Environment Variables**.
3.  Tambahkan:
    - `ALLOWED_ORIGINS`: `https://kbm-kos.vercel.app` (Isi dengan URL Frontend Anda)
4.  Redeploy Project Backend agar variabel terbaca.

---

### 🎉 Selesai!
Sekarang Portal Kos KBM Anda sudah online sepenuhnya di Vercel!

> [!TIP]
> **Penting untuk Lokal:** Sekarang di laptop Anda, jangan lupa buat file `.env` di dalam folder `backend/` dan `frontend/` (copy dari `.env.example`) agar project tetap bisa jalan di Laragon seperti biasa.
