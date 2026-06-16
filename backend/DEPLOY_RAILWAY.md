# Panduan Deployment Backend ke Railway 🚀

Dokumen ini berisi panduan deployment backend **Hyphen** ke [Railway](https://railway.app/) menggunakan Railway MySQL sebagai database.

---

## Arsitektur di Railway

Project Railway terdiri dari **2 service**:
1. **hyphen-apps** — Node.js backend (Express)
2. **MySQL** — Database Railway (auto-inject variables)

Railway MySQL secara otomatis meng-inject variabel berikut ke service backend:
- `MYSQLHOST` — host database
- `MYSQLPORT` — port database
- `MYSQLUSER` — username database
- `MYSQLPASSWORD` — password database
- `MYSQLDATABASE` — nama database

> ✅ **Tidak perlu set DB variables secara manual** — Railway yang handle otomatis.

---

## Langkah 1: Persiapan Repository (Monorepo Setup)

Karena project ini monorepo (ada folder `backend` dan `frontend`):
- Set **Root Directory** ke `backend` saat membuat service di Railway.

---

## Langkah 2: Deploy di Railway via GitHub

1. Buka [Railway Dashboard](https://railway.app/) dan login.
2. Klik **"New Project"** → **"Deploy from GitHub repo"**.
3. Pilih repository, lalu atur **Root Directory** ke:
   ```
   backend
   ```
4. Railway akan otomatis deteksi Node.js dan jalankan `npm start`.

---

## Langkah 3: Tambah MySQL Service

1. Di dalam project yang sama, klik **"+ New"** → **"Database"** → **"Add MySQL"**.
2. Railway otomatis buat MySQL service dan inject variabel `MYSQL*` ke semua service di project.
3. **Tidak perlu konfigurasi tambahan** — `db.js` sudah membaca `MYSQLHOST`, `MYSQLUSER`, dll.

---

## Langkah 4: Set Environment Variables di Railway

Di tab **"Variables"** service backend, tambahkan variabel berikut (klik **Raw Editor**):

```env
NODE_ENV=production
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
SMTP_USER=your-smtp-email@gmail.com
SMTP_PASS=your-smtp-app-password
SMTP_FROM_NAME=Hypen
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=*
```

> ⚠️ **Jangan tambahkan** `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT` secara manual — sudah di-inject otomatis oleh Railway MySQL sebagai `MYSQL*`.

---

## Langkah 5: Migrasi / Seeding Database

Untuk jalankan migration atau seeding ke Railway MySQL dari lokal:

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```
2. Login & link project:
   ```bash
   railway login
   railway link
   ```
3. Jalankan migration/seeding:
   ```bash
   railway run node migrate.js
   railway run node seed_users.js
   railway run node seed.js
   ```

---

## Langkah 6: Generate Domain Publik

1. Tab **"Settings"** → bagian **"Networking"** → **"Public Networking"**.
2. Klik **"Generate Domain"**.
3. URL yang dihasilkan: `https://hyphen-apps-production.up.railway.app`

---

## Integrasi ke Mobile App

URL API Flutter sudah dikonfigurasi di:
```
frontend/lib/services/api_client.dart
```
```dart
return 'https://hyphen-apps-production.up.railway.app/api/v1';
```
