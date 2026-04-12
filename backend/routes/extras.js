// ============================================
// API CRUD: Coupons, Wishlists, Reviews, Images, Inventory, Settings
// File: backend/routes/extras.js
// THÊM MỚI
// ============================================

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, isAdmin } = require('../middleware/auth');

// ===== MÃ GIẢM GIÁ (COUPONS) - Admin =====

// GET /api/extras/coupons
router.get('/coupons', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM coupons ORDER BY created_at DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// GET /api/extras/coupons/:id
router.get('/coupons/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM coupons WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// POST /api/extras/coupons
router.post('/coupons', verifyToken, isAdmin, async (req, res) => {
  try {
    const { code, description, discountType, discountValue, minOrderAmount, maxDiscount, usageLimit, startDate, endDate, isActive } = req.body;
    if (!code || !discountType || !discountValue || !startDate || !endDate) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin mã giảm giá' });
    }
    // Kiểm tra mã trùng
    const [existing] = await db.query('SELECT id FROM coupons WHERE code = ?', [code]);
    if (existing.length > 0) return res.status(400).json({ message: 'Mã giảm giá đã tồn tại' });

    const [result] = await db.query(
      'INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount, usage_limit, start_date, end_date, is_active) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [code.toUpperCase(), description, discountType, discountValue, minOrderAmount || 0, maxDiscount || null, usageLimit || null, startDate, endDate, isActive !== undefined ? isActive : 1]
    );
    res.status(201).json({ message: 'Thêm mã giảm giá thành công!', id: result.insertId });
  } catch (e) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// PUT /api/extras/coupons/:id
router.put('/coupons/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { code, description, discountType, discountValue, minOrderAmount, maxDiscount, usageLimit, startDate, endDate, isActive } = req.body;
    await db.query(
      'UPDATE coupons SET code=?, description=?, discount_type=?, discount_value=?, min_order_amount=?, max_discount=?, usage_limit=?, start_date=?, end_date=?, is_active=? WHERE id=?',
      [code, description, discountType, discountValue, minOrderAmount, maxDiscount, usageLimit, startDate, endDate, isActive, req.params.id]
    );
    res.json({ message: 'Cập nhật mã giảm giá thành công!' });
  } catch (e) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// DELETE /api/extras/coupons/:id
router.delete('/coupons/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM coupons WHERE id = ?', [req.params.id]);
    res.json({ message: 'Đã xóa mã giảm giá' });
  } catch (e) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// ===== DANH SÁCH YÊU THÍCH (WISHLISTS) - Customer =====

// GET /api/extras/wishlists
router.get('/wishlists', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT w.*, p.name, p.price, p.image_url, p.stock_quantity
       FROM wishlists w JOIN products p ON w.product_id = p.id
       WHERE w.user_id = ? ORDER BY w.created_at DESC`, [req.user.id]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// POST /api/extras/wishlists
router.post('/wishlists', verifyToken, async (req, res) => {
  try {
    const { productId } = req.body;
    // Kiểm tra đã yêu thích chưa
    const [existing] = await db.query('SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?', [req.user.id, productId]);
    if (existing.length > 0) return res.status(400).json({ message: 'Sản phẩm đã có trong danh sách yêu thích' });

    await db.query('INSERT INTO wishlists (user_id, product_id) VALUES (?,?)', [req.user.id, productId]);
    res.status(201).json({ message: 'Đã thêm vào yêu thích!' });
  } catch (e) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// DELETE /api/extras/wishlists/:productId
router.delete('/wishlists/:productId', verifyToken, async (req, res) => {
  try {
    await db.query('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?', [req.user.id, req.params.productId]);
    res.json({ message: 'Đã xóa khỏi yêu thích' });
  } catch (e) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// ===== ĐÁNH GIÁ SẢN PHẨM (PRODUCT_REVIEWS) =====

// POST /api/extras/reviews (Customer tạo)
router.post('/reviews', verifyToken, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    if (!productId || !rating) return res.status(400).json({ message: 'Vui lòng chọn số sao đánh giá' });
    if (rating < 1 || rating > 5) return res.status(400).json({ message: 'Đánh giá phải từ 1 đến 5 sao' });

    // Kiểm tra đã đánh giá chưa
    const [existing] = await db.query('SELECT id FROM product_reviews WHERE user_id = ? AND product_id = ?', [req.user.id, productId]);
    if (existing.length > 0) return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này rồi' });

    await db.query(
      'INSERT INTO product_reviews (product_id, user_id, rating, comment) VALUES (?,?,?,?)',
      [productId, req.user.id, rating, comment || null]
    );
    res.status(201).json({ message: 'Gửi đánh giá thành công! Chờ Admin duyệt.' });
  } catch (e) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// GET /api/extras/reviews/pending (Admin xem đánh giá chờ duyệt)
router.get('/reviews/pending', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, u.fullname, p.name as product_name
       FROM product_reviews r JOIN users u ON r.user_id = u.id JOIN products p ON r.product_id = p.id
       WHERE r.is_approved = 0 ORDER BY r.created_at DESC`
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// PUT /api/extras/reviews/:id/approve (Admin duyệt)
router.put('/reviews/:id/approve', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('UPDATE product_reviews SET is_approved = 1 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Đã duyệt đánh giá' });
  } catch (e) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// DELETE /api/extras/reviews/:id (Admin xóa)
router.delete('/reviews/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM product_reviews WHERE id = ?', [req.params.id]);
    res.json({ message: 'Đã xóa đánh giá' });
  } catch (e) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// ===== ẢNH SẢN PHẨM (PRODUCT_IMAGES) - Admin =====

// POST /api/extras/product-images
router.post('/product-images', verifyToken, isAdmin, async (req, res) => {
  try {
    const { productId, imageUrl, altText, isPrimary, sortOrder } = req.body;
    if (!productId || !imageUrl) return res.status(400).json({ message: 'Thiếu thông tin ảnh' });
    // Nếu đặt là ảnh chính, bỏ primary cũ
    if (isPrimary) {
      await db.query('UPDATE product_images SET is_primary = 0 WHERE product_id = ?', [productId]);
    }
    const [result] = await db.query(
      'INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES (?,?,?,?,?)',
      [productId, imageUrl, altText || null, isPrimary ? 1 : 0, sortOrder || 0]
    );
    res.status(201).json({ message: 'Thêm ảnh thành công!', id: result.insertId });
  } catch (e) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// PUT /api/extras/product-images/:id
router.put('/product-images/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { imageUrl, altText, isPrimary, sortOrder } = req.body;
    if (isPrimary) {
      const [img] = await db.query('SELECT product_id FROM product_images WHERE id = ?', [req.params.id]);
      if (img.length > 0) await db.query('UPDATE product_images SET is_primary = 0 WHERE product_id = ?', [img[0].product_id]);
    }
    await db.query('UPDATE product_images SET image_url=?, alt_text=?, is_primary=?, sort_order=? WHERE id=?',
      [imageUrl, altText, isPrimary ? 1 : 0, sortOrder, req.params.id]);
    res.json({ message: 'Cập nhật ảnh thành công!' });
  } catch (e) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// DELETE /api/extras/product-images/:id
router.delete('/product-images/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM product_images WHERE id = ?', [req.params.id]);
    res.json({ message: 'Đã xóa ảnh' });
  } catch (e) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// ===== LỊCH SỬ KHO (INVENTORY_LOGS) - Admin =====

// GET /api/extras/inventory-logs
router.get('/inventory-logs', verifyToken, isAdmin, async (req, res) => {
  try {
    const { productId } = req.query;
    let sql = `SELECT il.*, p.name as product_name, u.fullname as created_by_name
               FROM inventory_logs il
               JOIN products p ON il.product_id = p.id
               LEFT JOIN users u ON il.created_by = u.id`;
    let params = [];
    if (productId) { sql += ' WHERE il.product_id = ?'; params.push(productId); }
    sql += ' ORDER BY il.created_at DESC LIMIT 100';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (e) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// POST /api/extras/inventory-logs (Nhập kho thủ công)
router.post('/inventory-logs', verifyToken, isAdmin, async (req, res) => {
  try {
    const { productId, type, quantity, note } = req.body;
    if (!productId || !type || !quantity) return res.status(400).json({ message: 'Thiếu thông tin' });

    const [products] = await db.query('SELECT stock_quantity FROM products WHERE id = ?', [productId]);
    if (products.length === 0) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });

    const stockBefore = products[0].stock_quantity;
    let stockAfter;
    if (type === 'import') stockAfter = stockBefore + Number(quantity);
    else if (type === 'export') stockAfter = stockBefore - Number(quantity);
    else stockAfter = Number(quantity); // adjustment: set trực tiếp

    if (stockAfter < 0) return res.status(400).json({ message: 'Tồn kho không đủ' });

    await db.query('UPDATE products SET stock_quantity = ? WHERE id = ?', [stockAfter, productId]);
    await db.query(
      'INSERT INTO inventory_logs (product_id, type, quantity, stock_before, stock_after, note, created_by) VALUES (?,?,?,?,?,?,?)',
      [productId, type, quantity, stockBefore, stockAfter, note || null, req.user.id]
    );
    res.status(201).json({ message: `${type === 'import' ? 'Nhập' : 'Xuất'} kho thành công! Tồn kho: ${stockAfter}` });
  } catch (e) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// ===== CÀI ĐẶT HỆ THỐNG (SYSTEM_SETTINGS) - Admin =====

// GET /api/extras/settings
router.get('/settings', verifyToken, isAdmin, async (req, res) => {
  try {
    const { group } = req.query;
    let sql = 'SELECT * FROM system_settings';
    let params = [];
    if (group) { sql += ' WHERE setting_group = ?'; params.push(group); }
    sql += ' ORDER BY setting_group, setting_key';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (e) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// PUT /api/extras/settings/:id
router.put('/settings/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { settingValue } = req.body;
    await db.query('UPDATE system_settings SET setting_value = ? WHERE id = ?', [settingValue, req.params.id]);
    res.json({ message: 'Cập nhật cài đặt thành công!' });
  } catch (e) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// POST /api/extras/settings
router.post('/settings', verifyToken, isAdmin, async (req, res) => {
  try {
    const { settingKey, settingValue, settingGroup, description } = req.body;
    if (!settingKey) return res.status(400).json({ message: 'Thiếu khóa cài đặt' });
    const [existing] = await db.query('SELECT id FROM system_settings WHERE setting_key = ?', [settingKey]);
    if (existing.length > 0) return res.status(400).json({ message: 'Khóa cài đặt đã tồn tại' });
    await db.query(
      'INSERT INTO system_settings (setting_key, setting_value, setting_group, description) VALUES (?,?,?,?)',
      [settingKey, settingValue, settingGroup || 'general', description || null]
    );
    res.status(201).json({ message: 'Thêm cài đặt thành công!' });
  } catch (e) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// DELETE /api/extras/settings/:id
router.delete('/settings/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM system_settings WHERE id = ?', [req.params.id]);
    res.json({ message: 'Đã xóa cài đặt' });
  } catch (e) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

// ===== BỔ SUNG: Sửa địa chỉ giao hàng =====

// PUT /api/extras/addresses/:id
router.put('/addresses/:id', verifyToken, async (req, res) => {
  try {
    const { receiverName, phone, province, district, ward, addressDetail, isDefault } = req.body;
    if (isDefault) {
      await db.query('UPDATE shipping_addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
    }
    await db.query(
      'UPDATE shipping_addresses SET receiver_name=?, phone=?, province=?, district=?, ward=?, address_detail=?, is_default=? WHERE id=? AND user_id=?',
      [receiverName, phone, province, district, ward, addressDetail, isDefault ? 1 : 0, req.params.id, req.user.id]
    );
    res.json({ message: 'Cập nhật địa chỉ thành công!' });
  } catch (e) { res.status(500).json({ message: 'Lỗi hệ thống' }); }
});

module.exports = router;
