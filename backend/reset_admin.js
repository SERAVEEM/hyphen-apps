require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./src/config/db');

async function resetAdmin() {
  try {
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
