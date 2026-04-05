// ============================================
// API Giỏ hàng
// File: backend/routes/cart.js
// ============================================

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// Tất cả route giỏ hàng đều cần đăng nhập
router.use(verifyToken);

// ===== XEM GIỎ HÀNG =====
// GET /api/cart
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    const [items] = await db.query(
      `SELECT ci.*, p.name, p.price, p.image_url, p.stock_quantity,
              (ci.quantity * p.price) as subtotal
       FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       JOIN products p ON ci.product_id = p.id
       WHERE c.user_id = ?
       ORDER BY ci.created_at DESC`, [userId]
    );

    const total = items.reduce((sum, item) => sum + Number(item.subtotal), 0);

    res.json({ items, total, itemCount: items.length });

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
});

// ===== THÊM SẢN PHẨM VÀO GIỎ =====
// POST /api/cart/add
router.post('/add', async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1, size } = req.body;

    // Kiểm tra sản phẩm tồn tại và còn hàng
    const [products] = await db.query('SELECT * FROM products WHERE id = ? AND is_active = 1', [productId]);
    if (products.length === 0) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });

    if (products[0].stock_quantity < quantity) {
      return res.status(400).json({ message: `Chỉ còn ${products[0].stock_quantity} sản phẩm trong kho` });
    }

    // Tìm giỏ hàng của user
    let [carts] = await db.query('SELECT id FROM carts WHERE user_id = ?', [userId]);
    if (carts.length === 0) {
      const [newCart] = await db.query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
      carts = [{ id: newCart.insertId }];
    }
    const cartId = carts[0].id;

    // Kiểm tra SP đã có trong giỏ chưa
    const [existing] = await db.query(
      'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ? AND (size = ? OR (size IS NULL AND ? IS NULL))',
      [cartId, productId, size, size]
    );

    if (existing.length > 0) {
      // Đã có → cộng thêm số lượng
      await db.query('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?', [quantity, existing[0].id]);
    } else {
      // Chưa có → thêm mới
      await db.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity, size) VALUES (?, ?, ?, ?)',
        [cartId, productId, quantity, size || null]
      );
    }

    res.json({ message: 'Đã thêm vào giỏ hàng!' });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
});

// ===== CẬP NHẬT SỐ LƯỢNG =====
// PUT /api/cart/:itemId
router.put('/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: 'Số lượng phải lớn hơn 0' });
    }

    await db.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, itemId]);
    res.json({ message: 'Đã cập nhật số lượng' });

  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
});

// ===== XÓA SẢN PHẨM KHỎI GIỎ =====
// DELETE /api/cart/:itemId
router.delete('/:itemId', async (req, res) => {
  try {
    await db.query('DELETE FROM cart_items WHERE id = ?', [req.params.itemId]);
    res.json({ message: 'Đã xóa khỏi giỏ hàng' });
  } catch (error) {
    console.error('Delete cart item error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
});

module.exports = router;
