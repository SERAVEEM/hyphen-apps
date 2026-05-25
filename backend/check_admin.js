require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkAdmin() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hypen_db',
    });

    const [users] = await pool.query("SELECT id, username, email, role FROM users WHERE role = 'admin'");
    console.log("Admin Users:", users);
    process.exit(0);
  } catch (err) {
    console.error("DB Error:", err);
    process.exit(1);
  }
}

checkAdmin();
