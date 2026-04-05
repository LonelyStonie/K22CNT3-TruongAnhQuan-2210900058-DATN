// ============================================
// API Đơn hàng
// File: backend/routes/orders.js
// ============================================

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// ===== TẠO ĐƠN HÀNG =====
// POST /api/orders
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { receiverName, receiverPhone, shippingAddress, paymentMethod, couponCode, note } = req.body;

    // 1. Lấy giỏ hàng
    const [cartItems] = await db.query(
      `SELECT ci.*, p.name, p.price, p.image_url, p.stock_quantity
       FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       JOIN products p ON ci.product_id = p.id
       WHERE c.user_id = ?`, [userId]
    );

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống' });
    }

    // 2. Kiểm tra tồn kho
    for (const item of cartItems) {
      if (item.stock_quantity < item.quantity) {
        return res.status(400).json({ message: `Sản phẩm "${item.name}" chỉ còn ${item.stock_quantity} trong kho` });
      }
    }

    // 3. Tính tổng tiền
    let subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discountAmount = 0;
    let couponId = null;

    // 4. Kiểm tra mã giảm giá
    if (couponCode) {
      const [coupons] = await db.query(
        'SELECT * FROM coupons WHERE code = ? AND is_active = 1 AND start_date <= NOW() AND end_date >= NOW()',
        [couponCode]
      );
      if (coupons.length > 0) {
        const coupon = coupons[0];
        if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
          return res.status(400).json({ message: 'Mã giảm giá đã hết lượt sử dụng' });
        }
        if (subtotal < coupon.min_order_amount) {
          return res.status(400).json({ message: `Đơn hàng tối thiểu ${coupon.min_order_amount.toLocaleString()}₫` });
        }

        if (coupon.discount_type === 'percentage') {
          discountAmount = Math.floor(subtotal * coupon.discount_value / 100);
          if (coupon.max_discount && discountAmount > coupon.max_discount) {
            discountAmount = coupon.max_discount;
          }
        } else {
          discountAmount = coupon.discount_value;
        }
        couponId = coupon.id;
      }
    }

    // 5. Tính phí vận chuyển
    const [settings] = await db.query("SELECT * FROM system_settings WHERE setting_key IN ('shipping_fee_default', 'free_shipping_threshold')");
    let shippingFee = 30000;
    let freeThreshold = 5000000;
    settings.forEach(s => {
      if (s.setting_key === 'shipping_fee_default') shippingFee = Number(s.setting_value);
      if (s.setting_key === 'free_shipping_threshold') freeThreshold = Number(s.setting_value);
    });
    if (subtotal >= freeThreshold) shippingFee = 0;

    const totalAmount = subtotal - discountAmount + shippingFee;

    // 6. Tạo mã đơn hàng
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const [countToday] = await db.query("SELECT COUNT(*) as cnt FROM orders WHERE DATE(created_at) = CURDATE()");
    const orderCode = `UG-${dateStr}-${String(countToday[0].cnt + 1).padStart(3, '0')}`;

    // 7. Lưu đơn hàng
    const [orderResult] = await db.query(
      `INSERT INTO orders (order_code, user_id, receiver_name, receiver_phone, shipping_address,
        subtotal, discount_amount, shipping_fee, total_amount, coupon_id, payment_method, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderCode, userId, receiverName, receiverPhone, shippingAddress,
        subtotal, discountAmount, shippingFee, totalAmount, couponId, paymentMethod || 'cod', note || null]
    );
    const orderId = orderResult.insertId;

    // 8. Lưu chi tiết đơn hàng
    for (const item of cartItems) {
      await db.query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, size, total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.name, item.image_url, item.price, item.quantity, item.size, item.price * item.quantity]
      );
    }

    // 9. Tạo bản ghi thanh toán
    await db.query(
      'INSERT INTO payments (order_id, amount, method) VALUES (?, ?, ?)',
      [orderId, totalAmount, paymentMethod || 'cod']
    );

    // 10. Cập nhật lượt dùng mã giảm giá
    if (couponId) {
      await db.query('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?', [couponId]);
    }

    // 11. Xóa giỏ hàng
    const [carts] = await db.query('SELECT id FROM carts WHERE user_id = ?', [userId]);
    if (carts.length > 0) {
      await db.query('DELETE FROM cart_items WHERE cart_id = ?', [carts[0].id]);
    }

    res.status(201).json({
      message: 'Đặt hàng thành công!',
      orderId,
      orderCode,
      totalAmount
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
});

// ===== XEM DANH SÁCH ĐƠN HÀNG CỦA TÔI =====
// GET /api/orders
router.get('/', async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]
    );
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
});

// ===== XEM CHI TIẾT 1 ĐƠN HÀNG =====
// GET /api/orders/:id
router.get('/:id', async (req, res) => {
  try {
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (orders.length === 0) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
    const [payments] = await db.query('SELECT * FROM payments WHERE order_id = ?', [req.params.id]);

    res.json({ order: orders[0], items, payment: payments[0] || null });
  } catch (error) {
    console.error('Get order detail error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
});

// ===== HỦY ĐƠN HÀNG =====
// PUT /api/orders/:id/cancel
router.put('/:id/cancel', async (req, res) => {
  try {
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (orders.length === 0) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    if (orders[0].status !== 'pending') {
      return res.status(400).json({ message: 'Chỉ có thể hủy đơn hàng đang chờ xác nhận' });
    }

    await db.query("UPDATE orders SET status = 'cancelled' WHERE id = ?", [req.params.id]);
    res.json({ message: 'Đã hủy đơn hàng' });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
});

module.exports = router;
