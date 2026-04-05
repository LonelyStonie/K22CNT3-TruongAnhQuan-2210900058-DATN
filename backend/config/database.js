// ============================================
// Kết nối MySQL Database
// File: backend/config/database.js
// ============================================

const mysql = require('mysql2/promise');

// Tạo connection pool (tối ưu hiệu suất)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'uncut_gems_db',
  waitForConnections: true,
  connectionLimit: 10,       // Tối đa 10 kết nối đồng thời
  queueLimit: 0
});

// Test kết nối khi khởi động
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL Connected: ' + process.env.DB_NAME);
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL Connection Error:', err.message);
  });

module.exports = pool;
