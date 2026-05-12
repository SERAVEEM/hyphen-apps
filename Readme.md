# E-commerce backend HYPEN. 

Struktur folder:
MHSBe2/
├── src/
│   ├── index.js
│   ├── config/
│   ├── controllers/
│   ├── data/
│   ├── helpers/
│   ├── middleware/
│   ├── models/
│   └──routes/
│
├── node_modules/
├── .env
├── .gitignore
├── package.json
└── README.md

Langkah - langkah:

Install :
- npm install 

isi package :
- node.js : runtime env
- express : Framework
- brycpt : Hash pw
- jsonwebtoken : verify JWT Token
- uuid : Generate ID
- dotenv : baca file env
- module-alias : path untuk import (@) contoh : (@/data/product.data)
- nodemailer : 
- swagger-ui-express : Dokumentasi API
# cara run swagger -> http://localhost:3000/api-docs/
# kalau mau refresh/restart wajib save dulu/ ketik rs
- nodemon : Auto restart server saat development

# run:
npm run dev -> mode development (supaya bisa lgsung refresh/restart)
npm run start -> mode production

# putusin run :
CTRL + C


# Akun default admin :
Email : admin123@gmail.com
Pw : admin123

env. 
DB_HOST = localhost
DB_USER = root
DB_PASSWORD = 
DB_NAME = db_be
PORT = 3000
SECRET_KEY = rahasia123
REFRESH_SECRET_KEY = rahasia123_refresh
ADMIN_PASSWORD = admin123


