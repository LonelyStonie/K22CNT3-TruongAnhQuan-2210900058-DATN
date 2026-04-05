// ============================================
// API Đăng ký & Đăng nhập
// File: backend/routes/auth.js
// ============================================

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// ===== ĐĂNG KÝ =====
// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { fullname, email, password, phone } = req.body;

    // 1. Validate dữ liệu
    if (!fullname || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    // 2. Kiểm tra email đã tồn tại chưa
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email này đã được đăng ký' });
    }

    // 3. Mã hóa mật khẩu bằng bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Lưu vào database
    const [result] = await db.query(
      'INSERT INTO users (fullname, email, password, phone) VALUES (?, ?, ?, ?)',
      [fullname, email, hashedPassword, phone || null]
    );

    // 5. Tạo giỏ hàng cho user mới
    await db.query('INSERT INTO carts (user_id) VALUES (?)', [result.insertId]);

    res.status(201).json({
      message: 'Đăng ký thành công!',
      userId: result.insertId
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống, vui lòng thử lại sau' });
  }
});

// ===== ĐĂNG NHẬP =====
// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate
    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
    }

    // 2. Tìm user theo email
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }

    const user = users[0];

    // 3. Kiểm tra tài khoản bị khóa
    if (!user.is_active) {
      return res.status(403).json({ message: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên' });
    }

    // 4. So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }

    // 5. Tạo JWT Token (hết hạn sau 24 giờ)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 6. Trả về token + thông tin user (không trả mật khẩu)
    res.json({
      message: 'Đăng nhập thành công!',
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống, vui lòng thử lại sau' });
  }
});

module.exports = router;
