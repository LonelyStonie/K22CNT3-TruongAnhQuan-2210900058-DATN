// ============================================
// Middleware xác thực JWT Token
// File: backend/middleware/auth.js
// ============================================

const jwt = require('jsonwebtoken');

// Middleware: Kiểm tra người dùng đã đăng nhập chưa
function verifyToken(req, res, next) {
  // Lấy token từ header: "Bearer xxx..."
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Bạn chưa đăng nhập' });
  }

  try {
    // Giải mã token → lấy thông tin user
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}

// Middleware: Kiểm tra quyền Admin
function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này' });
  }
  next();
}

module.exports = { verifyToken, isAdmin };
