// ============================================
// API Quản trị viên (Admin)
// File: backend/routes/admin.js
// ============================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/database');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Tất cả route admin cần đăng nhập + quyền admin
router.use(verifyToken);
router.use(isAdmin);

// ===== CẤU HÌNH UPLOAD ẢNH =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // Max 5MB

// ===== DASHBOARD THỐNG KÊ =====
// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const [[{ totalRevenue }]] = await db.query("SELECT COALESCE(SUM(total_amount),0) as totalRevenue FROM orders WHERE status = 'delivered'");
    const [[{ totalOrders }]] = await db.query("SELECT COUNT(*) as totalOrders FROM orders");
    const [[{ pendingOrders }]] = await db.query("SELECT COUNT(*) as pendingOrders FROM orders WHERE status = 'pending'");
    const [[{ totalCustomers }]] = await db.query("SELECT COUNT(*) as totalCustomers FROM users WHERE role = 'customer'");
    const [[{ totalProducts }]] = await db.query("SELECT COUNT(*) as totalProducts FROM products");

    const [recentOrders] = await db.query(
      "SELECT o.*, u.fullname FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 10"
    );

    const [topProducts] = await db.query(
      "SELECT * FROM products ORDER BY sold_count DESC LIMIT 10"
    );

    res.json({ totalRevenue, totalOrders, pendingOrders, totalCustomers, totalProducts, recentOrders, topProducts });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
});

// ===== QUẢN LÝ SẢN PHẨM (ADMIN) =====

// Thêm sản phẩm mới
// POST /api/admin/products
router.post('/products', upload.single('image'), async (req, res) => {
  try {
    const { name, sku, description, shortDescription, price, originalPrice, categoryId, materialId, stoneTypeId, size, weight, stockQuantity, isFeatured, isNew, certification } = req.body;
    const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await db.query(
      `INSERT INTO products (name, slug, sku, description, short_description, price, original_price, category_id, material_id, stone_type_id, size, weight, stock_quantity, image_url, is_featured, is_new, certification)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [name, slug, sku, description, shortDescription, price, originalPrice || null, categoryId || null, materialId || null, stoneTypeId || null, size, weight, stockQuantity || 0, imageUrl, isFeatured ? 1 : 0, isNew ? 1 : 0, certification]
    );

    res.status(201).json({ message: 'Thêm sản phẩm thành công!', productId: result.insertId });
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
});

// Sửa sản phẩm
// PUT /api/admin/products/:id
router.put('/products/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, sku, description, shortDescription, price, originalPrice, categoryId, materialId, stoneTypeId, size, weight, stockQuantity, isFeatured, isNew, isActive, certification } = req.body;
    let imageUrl = req.body.currentImage;
    if (req.file) imageUrl = `/uploads/${req.file.filename}`;

    await db.query(
      `UPDATE products SET name=?, sku=?, description=?, short_description=?, price=?, original_price=?, category_id=?, material_id=?, stone_type_id=?, size=?, weight=?, stock_quantity=?, image_url=?, is_featured=?, is_new=?, is_active=?, certification=? WHERE id=?`,
      [name, sku, description, shortDescription, price, originalPrice, categoryId, materialId, stoneTypeId, size, weight, stockQuantity, imageUrl, isFeatured ? 1 : 0, isNew ? 1 : 0, isActive !== undefined ? isActive : 1, certification, req.params.id]
    );

    res.json({ message: 'Cập nhật sản phẩm thành công!' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
});

// Xóa sản phẩm
// DELETE /api/admin/products/:id
router.delete('/products/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Đã xóa sản phẩm' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
});

// ===== QUẢN LÝ ĐƠN HÀNG (ADMIN) =====

// Lấy tất cả đơn hàng
// GET /api/admin/orders?status=
router.get('/orders', async (req, res) => {
  try {
    const { status } = req.query;
    let sql = "SELECT o.*, u.fullname, u.email FROM orders o JOIN users u ON o.user_id = u.id";
    let params = [];
    if (status) { sql += " WHERE o.status = ?"; params.push(status); }
    sql += " ORDER BY o.created_at DESC";
    const [orders] = await db.query(sql, params);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
});

// Xác nhận đơn hàng
// PUT /api/admin/orders/:id/confirm
router.put('/orders/:id/confirm', async (req, res) => {
  try {
    const orderId = req.params.id;
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (orders.length === 0) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    if (orders[0].status !== 'pending') return res.status(400).json({ message: 'Đơn hàng không ở trạng thái chờ xác nhận' });

    // Trừ tồn kho
    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
    for (const item of items) {
      const [products] = await db.query('SELECT stock_quantity FROM products WHERE id = ?', [item.product_id]);
      const stockBefore = products[0].stock_quantity;
      const stockAfter = stockBefore - item.quantity;

      await db.query('UPDATE products SET stock_quantity = ?, sold_count = sold_count + ? WHERE id = ?', [stockAfter, item.quantity, item.product_id]);
      await db.query(
        "INSERT INTO inventory_logs (product_id, type, quantity, stock_before, stock_after, reference_id, note, created_by) VALUES (?, 'export', ?, ?, ?, ?, ?, ?)",
        [item.product_id, item.quantity, stockBefore, stockAfter, orderId, `Xuất kho theo đơn #${orders[0].order_code}`, req.user.id]
      );
    }

    await db.query("UPDATE orders SET status = 'confirmed' WHERE id = ?", [orderId]);
    res.json({ message: 'Đã xác nhận đơn hàng' });
  } catch (error) {
    console.error('Confirm order error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
});

// Cập nhật trạng thái đơn hàng
// PUT /api/admin/orders/:id/status
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: `Đã cập nhật trạng thái: ${status}` });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
});

// ===== QUẢN LÝ KHÁCH HÀNG =====
// GET /api/admin/customers
router.get('/customers', async (req, res) => {
  try {
    const [customers] = await db.query(
      "SELECT id, fullname, email, phone, is_active, created_at FROM users WHERE role = 'customer' ORDER BY created_at DESC"
    );
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
});

// Khóa / Mở khóa tài khoản
// PUT /api/admin/customers/:id/toggle
router.put('/customers/:id/toggle', async (req, res) => {
  try {
    const [users] = await db.query('SELECT is_active FROM users WHERE id = ?', [req.params.id]);
    const newStatus = users[0].is_active ? 0 : 1;
    await db.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, req.params.id]);
    res.json({ message: newStatus ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
});

module.exports = router;
