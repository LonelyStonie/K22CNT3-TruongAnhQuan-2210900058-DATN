// ============================================
// API CRUD: Danh mục, Chất liệu, Loại đá (Admin)
// File: backend/routes/catalog.js
// THÊM MỚI
// ============================================

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, isAdmin } = require('../middleware/auth');

// ===== DANH MỤC (CATEGORIES) =====

// GET /api/catalog/categories (public)
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY sort_order, id');
    res.json(rows);
  } catch (e) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// POST /api/catalog/categories (admin)
router.post('/categories', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, slug, description, imageUrl, parentId, isActive, sortOrder } = req.body;
    if (!name) return res.status(400).json({ message: 'Vui lòng nhập tên danh mục' });
    const finalSlug = slug || name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const [result] = await db.query(
      'INSERT INTO categories (name, slug, description, image_url, parent_id, is_active, sort_order) VALUES (?,?,?,?,?,?,?)',
      [name, finalSlug, description || null, imageUrl || null, parentId || null, isActive !== undefined ? isActive : 1, sortOrder || 0]
    );
    res.status(201).json({ message: 'Thêm danh mục thành công!', id: result.insertId });
  } catch (e) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// PUT /api/catalog/categories/:id (admin)
router.put('/categories/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, slug, description, imageUrl, parentId, isActive, sortOrder } = req.body;
    await db.query(
      'UPDATE categories SET name=?, slug=?, description=?, image_url=?, parent_id=?, is_active=?, sort_order=? WHERE id=?',
      [name, slug, description, imageUrl, parentId || null, isActive, sortOrder, req.params.id]
    );
    res.json({ message: 'Cập nhật danh mục thành công!' });
  } catch (e) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// DELETE /api/catalog/categories/:id (admin)
router.delete('/categories/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Đã xóa danh mục' });
  } catch (e) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// ===== CHẤT LIỆU (MATERIALS) =====

// GET /api/catalog/materials (public)
router.get('/materials', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM materials ORDER BY id');
    res.json(rows);
  } catch (e) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// POST /api/catalog/materials (admin)
router.post('/materials', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, code, description, purity } = req.body;
    if (!name) return res.status(400).json({ message: 'Vui lòng nhập tên chất liệu' });
    const [result] = await db.query(
      'INSERT INTO materials (name, code, description, purity) VALUES (?,?,?,?)',
      [name, code || null, description || null, purity || null]
    );
    res.status(201).json({ message: 'Thêm chất liệu thành công!', id: result.insertId });
  } catch (e) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// PUT /api/catalog/materials/:id (admin)
router.put('/materials/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, code, description, purity } = req.body;
    await db.query('UPDATE materials SET name=?, code=?, description=?, purity=? WHERE id=?',
      [name, code, description, purity, req.params.id]);
    res.json({ message: 'Cập nhật chất liệu thành công!' });
  } catch (e) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// DELETE /api/catalog/materials/:id (admin)
router.delete('/materials/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM materials WHERE id = ?', [req.params.id]);
    res.json({ message: 'Đã xóa chất liệu' });
  } catch (e) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// ===== LOẠI ĐÁ QUÝ (STONE_TYPES) =====

// GET /api/catalog/stones (public)
router.get('/stones', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM stone_types ORDER BY id');
    res.json(rows);
  } catch (e) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// POST /api/catalog/stones (admin)
router.post('/stones', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, code, description, hardness, origin } = req.body;
    if (!name) return res.status(400).json({ message: 'Vui lòng nhập tên loại đá' });
    const [result] = await db.query(
      'INSERT INTO stone_types (name, code, description, hardness, origin) VALUES (?,?,?,?,?)',
      [name, code || null, description || null, hardness || null, origin || null]
    );
    res.status(201).json({ message: 'Thêm loại đá thành công!', id: result.insertId });
  } catch (e) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// PUT /api/catalog/stones/:id (admin)
router.put('/stones/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, code, description, hardness, origin } = req.body;
    await db.query('UPDATE stone_types SET name=?, code=?, description=?, hardness=?, origin=? WHERE id=?',
      [name, code, description, hardness, origin, req.params.id]);
    res.json({ message: 'Cập nhật loại đá thành công!' });
  } catch (e) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// DELETE /api/catalog/stones/:id (admin)
router.delete('/stones/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM stone_types WHERE id = ?', [req.params.id]);
    res.json({ message: 'Đã xóa loại đá' });
  } catch (e) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

module.exports = router;
