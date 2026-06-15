require('dotenv').config();
const pool = require('./src/config/db');

async function checkAdmin() {
  try {
    const [users] = await pool.query("SELECT id, username, email, role FROM users WHERE role = 'admin'");
    console.log("Admin Users:", users);
    process.exit(0);
  } catch (err) {
    console.error("DB Error:", err);
    process.exit(1);
  }
}

checkAdmin();
