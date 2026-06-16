const mysql = require('mysql2/promise');

// Railway MySQL auto-injects MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE, MYSQLPORT
// Fallback to DB_* variables for local development
const dbConfig = {
    host:     process.env.MYSQLHOST     || process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306', 10),
    user:     process.env.MYSQLUSER     || process.env.DB_USER     || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.MYSQLDATABASE || process.env.DB_NAME     || 'hypen_db',
    waitForConnections: true,
    connectionLimit: 10,
};

const pool = mysql.createPool(dbConfig);

pool.getConnection()
    .then((connection) => {
        console.log(`✅ Database Connected [${dbConfig.host}:${dbConfig.port}/${dbConfig.database}]`);
        connection.release();
    })
    .catch((err) => console.log('❌ Database Error:', err.message));

module.exports = pool;