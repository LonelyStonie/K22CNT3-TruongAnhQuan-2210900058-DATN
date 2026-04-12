// ============================================
// API Quản trị mở rộng: Banner, Blog, Contact, Thống kê
// File: backend/routes/admin-extra.js
// THÊM MỚI - tạo file mới trong backend/routes/
// ============================================

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.use(verifyToken);
router.use(isAdmin);

// ===== THỐNG KÊ NÂNG CAO =====
// GET /api/admin-extra/statistics
router.get('/statistics', async (req, res) => {
  try {
    // Doanh thu 7 ngày gần nhất
    const [revenueByDay] = await db.query(`
      SELECT DATE(created_at) as date, COALESCE(SUM(total_amount),0) as revenue, COUNT(*) as orders
      FROM orders WHERE status = 'delivered' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at) ORDER BY date
    `);

    // Doanh thu theo tháng (6 tháng gần nhất)
    const [revenueByMonth] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COALESCE(SUM(total_amount),0) as revenue, COUNT(*) as orders
      FROM orders WHERE status = 'delivered' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY month
    `);

    // Đơn hàng theo trạng thái
    const [ordersByStatus] = await db.query(`
      SELECT status, COUNT(*) as count FROM orders GROUP BY status
    `);

    // Top 5 sản phẩm bán chạy
    const [topProducts] = await db.query(`
      SELECT p.name, p.price, p.sold_count, p.stock_quantity
      FROM products p ORDER BY p.sold_count DESC LIMIT 5
    `);

    // Top 5 khách hàng mua nhiều nhất
    const [topCustomers] = await db.query(`
      SELECT u.fullname, u.email, COUNT(o.id) as order_count, COALESCE(SUM(o.total_amount),0) as total_spent
      FROM users u JOIN orders o ON u.id = o.user_id
      WHERE o.status = 'delivered'
      GROUP BY u.id ORDER BY total_spent DESC LIMIT 5
    `);

    // Doanh thu theo danh mục
    const [revenueByCategory] = await db.query(`
      SELECT c.name, COALESCE(SUM(oi.total),0) as revenue
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'delivered'
      GROUP BY c.id ORDER BY revenue DESC
    `);

    res.json({ revenueByDay, revenueByMonth, ordersByStatus, topProducts, topCustomers, revenueByCategory });
  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
});

// ===== QUẢN LÝ BANNER =====

// GET /api/admin-extra/banners
router.get('/banners', async (req, res) => {
  try {
    const [banners] = await db.query('SELECT * FROM banners ORDER BY sort_order ASC, created_at DESC');
    res.json(banners);
  } catch (error) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// POST /api/admin-extra/banners
router.post('/banners', async (req, res) => {
  try {
    const { title, subtitle, imageUrl, linkUrl, position, sortOrder, isActive } = req.body;
    if (!title || !imageUrl) return res.status(400).json({ message: 'Vui lòng nhập tiêu đề và hình ảnh' });
    await db.query(
      'INSERT INTO banners (title, subtitle, image_url, link_url, position, sort_order, is_active) VALUES (?,?,?,?,?,?,?)',
      [title, subtitle, imageUrl, linkUrl, position || 'home_slider', sortOrder || 0, isActive !== undefined ? isActive : 1]
    );
    res.status(201).json({ message: 'Thêm banner thành công!' });
  } catch (error) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// PUT /api/admin-extra/banners/:id
router.put('/banners/:id', async (req, res) => {
  try {
    const { title, subtitle, imageUrl, linkUrl, position, sortOrder, isActive } = req.body;
    await db.query(
      'UPDATE banners SET title=?, subtitle=?, image_url=?, link_url=?, position=?, sort_order=?, is_active=? WHERE id=?',
      [title, subtitle, imageUrl, linkUrl, position, sortOrder, isActive, req.params.id]
    );
    res.json({ message: 'Cập nhật banner thành công!' });
  } catch (error) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// DELETE /api/admin-extra/banners/:id
router.delete('/banners/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM banners WHERE id = ?', [req.params.id]);
    res.json({ message: 'Đã xóa banner' });
  } catch (error) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// ===== QUẢN LÝ BLOG =====

// GET /api/admin-extra/blogs
router.get('/blogs', async (req, res) => {
  try {
    const [blogs] = await db.query(
      'SELECT b.*, u.fullname as author_name FROM blogs b LEFT JOIN users u ON b.author_id = u.id ORDER BY b.created_at DESC'
    );
    res.json(blogs);
  } catch (error) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// POST /api/admin-extra/blogs
router.post('/blogs', async (req, res) => {
  try {
    const { title, content, thumbnail, excerpt, tags, isPublished } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Vui lòng nhập tiêu đề và nội dung' });
    const slug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    await db.query(
      'INSERT INTO blogs (title, slug, content, thumbnail, excerpt, author_id, tags, is_published, published_at) VALUES (?,?,?,?,?,?,?,?,?)',
      [title, slug, content, thumbnail, excerpt, req.user.id, tags, isPublished ? 1 : 0, isPublished ? new Date() : null]
    );
    res.status(201).json({ message: 'Thêm bài viết thành công!' });
  } catch (error) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// PUT /api/admin-extra/blogs/:id
router.put('/blogs/:id', async (req, res) => {
  try {
    const { title, content, thumbnail, excerpt, tags, isPublished } = req.body;
    const slug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    await db.query(
      'UPDATE blogs SET title=?, slug=?, content=?, thumbnail=?, excerpt=?, tags=?, is_published=?, published_at=? WHERE id=?',
      [title, slug, content, thumbnail, excerpt, tags, isPublished ? 1 : 0, isPublished ? new Date() : null, req.params.id]
    );
    res.json({ message: 'Cập nhật bài viết thành công!' });
  } catch (error) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// DELETE /api/admin-extra/blogs/:id
router.delete('/blogs/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM blogs WHERE id = ?', [req.params.id]);
    res.json({ message: 'Đã xóa bài viết' });
  } catch (error) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// ===== QUẢN LÝ LIÊN HỆ =====

// GET /api/admin-extra/contacts
router.get('/contacts', async (req, res) => {
  try {
    const [contacts] = await db.query('SELECT * FROM contacts ORDER BY created_at DESC');
    res.json(contacts);
  } catch (error) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// PUT /api/admin-extra/contacts/:id/reply
router.put('/contacts/:id/reply', async (req, res) => {
  try {
    const { adminReply } = req.body;
    await db.query("UPDATE contacts SET admin_reply=?, status='replied', replied_at=NOW() WHERE id=?", [adminReply, req.params.id]);
    res.json({ message: 'Đã phản hồi thành công!' });
  } catch (error) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

module.exports = router;
