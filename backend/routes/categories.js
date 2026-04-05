// ============================================
// API Danh mục sản phẩm
// File: backend/routes/categories.js
// ============================================

const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Lấy tất cả danh mục
// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const [categories] = await db.query(
      'SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order'
    );
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
});

module.exports = router;
