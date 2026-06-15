# Panduan Deployment Backend ke Railway 🚀

Dokumen ini berisi panduan langkah demi langkah untuk men-deploy backend **Hyphen** ke [Railway](https://railway.app/).

---

## Prasyarat
1. Akun [Railway](https://railway.app/).
2. Repository GitHub yang berisi backend ini sudah di-push ke GitHub.
3. Database MySQL (saat ini menggunakan **Aiven Cloud MySQL** yang sudah dikonfigurasi).

---

## Langkah 1: Persiapan Repository (Monorepo Setup)
Jika project ini adalah monorepo (terdapat folder `backend` dan mobile app dalam satu repo):
- Railway mendukung penuh monorepo. Anda hanya perlu menentukan **Root Directory** sebagai `/backend` atau `backend` saat membuat service di Railway.

---

## Langkah 2: Deploy di Railway via GitHub
1. Buka [Railway Dashboard](https://railway.app/) dan login.
2. Klik tombol **"New Project"** (atau **"+ New"**).
3. Pilih **"Deploy from GitHub repo"**.
4. Pilih repository Anda (jika pertama kali, Anda perlu memberi izin akses Railway ke repo GitHub Anda).
5. Sebelum men-deploy, klik **"Configure"** (atau klik project-nya setelah dibuat) lalu atur **Root Directory** ke:
   ```text
   backend
   ```
6. Railway akan mendeteksi Node.js secara otomatis menggunakan Nixpacks, menginstal dependencies, dan menjalankan:
   ```bash
   npm start
   ```

---

## Langkah 3: Konfigurasi Environment Variables (Variabel Lingkungan)
Untuk menghubungkan database Aiven dan layanan lainnya, Anda perlu menyalin environment variables.

Di dashboard Railway untuk service backend Anda:
1. Buka tab **"Variables"**.
2. Klik tombol **"Raw Editor"** di pojok kanan atas area Variables.
3. Copy-paste teks di bawah ini (sesuaikan jika ada perubahan):

```env
NODE_ENV=production
DB_HOST=your-aiven-db-host
DB_USER=your-aiven-db-user
DB_PASSWORD=your-aiven-db-password
DB_NAME=your-aiven-db-name
DB_PORT=your-aiven-db-port
DB_SSL=true
SECRET_KEY=your-jwt-secret-key
REFRESH_SECRET_KEY=your-jwt-refresh-secret-key
ADMIN_PASSWORD=your-admin-password
RAJAONGKIR_BASE_URL=https://rajaongkir.komerce.id/api/v1
RAJAONGKIR_API_KEY=your-rajaongkir-api-key
MIDTRANS_SERVER_KEY=your-midtrans-server-key
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_CLIENT_KEY=your-midtrans-client-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM_NAME=Hypen
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=*
```

4. Klik **"Save"**. Railway akan otomatis melakukan re-deploy dengan variables baru tersebut.

---

## Langkah 4: Generate Domain Publik
Secara default, Railway tidak langsung membuat domain publik. Untuk membuat domain:
1. Buka tab **"Settings"** di service backend Anda.
2. Di bagian **"Networking"**, cari bagian **"Public Networking"**.
3. Klik tombol **"Generate Domain"** (atau masukkan domain kustom Anda).
4. Railway akan menghasilkan URL seperti: `https://backend-production-xxxx.up.railway.app`.

---

## Langkah 5: Pengujian & Migrasi Database (Opsional)
Jika Anda perlu menjalankan migrasi database baru ke Aiven Cloud dari Railway, Anda bisa melakukannya dari komputer lokal dengan mengubah `.env` lokal Anda ke database target, lalu jalankan:
```bash
npm run seed:all
```
Atau jika Anda ingin menjalankan migrasi langsung dari Railway CLI:
1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Hubungkan ke project: `railway link`
4. Jalankan script migrasi/seeding:
   ```bash
   railway run node migrate.js
   railway run node seed_users.js
   railway run node seed.js
   ```

---

## Integrasi ke Mobile App / Frontend
Setelah backend aktif di Railway, ganti semua URL API di aplikasi mobile/frontend Anda yang sebelumnya mengarah ke `http://localhost:3000` menjadi URL Railway baru Anda, contoh:
`https://backend-production-xxxx.up.railway.app/api/v1`
