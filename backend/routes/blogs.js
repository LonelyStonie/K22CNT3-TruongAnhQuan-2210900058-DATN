// ============================================
// API Blog (Public - không cần đăng nhập)
// File: backend/routes/blogs.js
// THÊM MỚI
// ============================================

const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/blogs - Lấy bài viết đã xuất bản
router.get('/', async (req, res) => {
  try {
    const [blogs] = await db.query(
      `SELECT b.*, u.fullname as author_name 
       FROM blogs b LEFT JOIN users u ON b.author_id = u.id 
       WHERE b.is_published = 1 
       ORDER BY b.published_at DESC`
    );
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
});

// GET /api/blogs/:slug - Chi tiết bài viết
router.get('/:slug', async (req, res) => {
  try {
    const [blogs] = await db.query(
      `SELECT b.*, u.fullname as author_name 
       FROM blogs b LEFT JOIN users u ON b.author_id = u.id 
       WHERE b.slug = ? AND b.is_published = 1`, [req.params.slug]
    );
    if (blogs.length === 0) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
    await db.query('UPDATE blogs SET view_count = view_count + 1 WHERE id = ?', [blogs[0].id]);
    res.json(blogs[0]);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
});

module.exports = router;
