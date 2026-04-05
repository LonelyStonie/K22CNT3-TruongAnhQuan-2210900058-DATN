// ============================================
// API Thông tin người dùng
// File: backend/routes/users.js
// ============================================

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// ===== XEM THÔNG TIN CÁ NHÂN =====
// GET /api/users/profile
router.get('/profile', async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, fullname, email, phone, avatar, gender, date_of_birth, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (users.length === 0) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
});

// ===== CẬP NHẬT THÔNG TIN =====
// PUT /api/users/profile
router.put('/profile', async (req, res) => {
  try {
    const { fullname, phone, gender, date_of_birth } = req.body;
    await db.query(
      'UPDATE users SET fullname = ?, phone = ?, gender = ?, date_of_birth = ? WHERE id = ?',
      [fullname, phone, gender, date_of_birth, req.user.id]
    );
    res.json({ message: 'Cập nhật thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
});

// ===== ĐỔI MẬT KHẨU =====
// PUT /api/users/change-password
router.put('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ mật khẩu cũ và mới' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    const [users] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
    res.json({ message: 'Đổi mật khẩu thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
});

// ===== QUẢN LÝ ĐỊA CHỈ =====
// GET /api/users/addresses
router.get('/addresses', async (req, res) => {
  try {
    const [addresses] = await db.query(
      'SELECT * FROM shipping_addresses WHERE user_id = ? ORDER BY is_default DESC', [req.user.id]
    );
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
});

// POST /api/users/addresses
router.post('/addresses', async (req, res) => {
  try {
    const { receiverName, phone, province, district, ward, addressDetail, isDefault } = req.body;

    if (isDefault) {
      await db.query('UPDATE shipping_addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
    }

    await db.query(
      'INSERT INTO shipping_addresses (user_id, receiver_name, phone, province, district, ward, address_detail, is_default) VALUES (?,?,?,?,?,?,?,?)',
      [req.user.id, receiverName, phone, province, district, ward, addressDetail, isDefault ? 1 : 0]
    );
    res.status(201).json({ message: 'Thêm địa chỉ thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
});

// DELETE /api/users/addresses/:id
router.delete('/addresses/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM shipping_addresses WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Đã xóa địa chỉ' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
});

module.exports = router;
