require('dotenv').config();
const pool = require('./src/config/db');

async function checkUsers() {
  try {
    const [users] = await pool.query("SELECT id, username, email, role, isVerified, googleId, authProvider FROM users");
    console.log("All Users:", JSON.stringify(users, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("DB Error:", err);
    process.exit(1);
  }
}

checkUsers();
