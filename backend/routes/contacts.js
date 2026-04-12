// ============================================
// API Liên hệ (Public)
// File: backend/routes/contacts.js
// THÊM MỚI
// ============================================

const express = require('express');
const router = express.Router();
const db = require('../config/database');

// POST /api/contacts - Gửi liên hệ
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }
    await db.query(
      'INSERT INTO contacts (name, email, phone, subject, message) VALUES (?,?,?,?,?)',
      [name, email, phone, subject, message]
    );
    res.status(201).json({ message: 'Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
});

module.exports = router;
