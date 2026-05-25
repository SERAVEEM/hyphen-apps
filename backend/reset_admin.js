require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function resetAdmin() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hypen_db',
    });

    const newPassword = 'admin123'; // We will set it to exactly "admin123" to satisfy frontend length checks
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await pool.query("UPDATE users SET password = ? WHERE role = 'admin'", [hashedPassword]);
    console.log("Admin password successfully reset to: " + newPassword);
    
    process.exit(0);
  } catch (err) {
    console.error("DB Error:", err);
    process.exit(1);
  }
}

resetAdmin();
