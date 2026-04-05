// ============================================
// API Sản phẩm
// File: backend/routes/products.js
// ============================================

const express = require('express');
const router = express.Router();
const db = require('../config/database');

// ===== LẤY DANH SÁCH SẢN PHẨM (có lọc, tìm kiếm, phân trang) =====
// GET /api/products?keyword=&category=&material=&stone=&minPrice=&maxPrice=&sort=&page=&limit=
router.get('/', async (req, res) => {
  try {
    const { keyword, category, material, stone, minPrice, maxPrice, sort, page = 1, limit = 12, featured, isNew } = req.query;

    let sql = `SELECT p.*, c.name as category_name, m.name as material_name, s.name as stone_name
               FROM products p
               LEFT JOIN categories c ON p.category_id = c.id
               LEFT JOIN materials m ON p.material_id = m.id
               LEFT JOIN stone_types s ON p.stone_type_id = s.id
               WHERE p.is_active = 1`;
    let params = [];

    // Tìm kiếm theo tên
    if (keyword) {
      sql += ' AND p.name LIKE ?';
      params.push(`%${keyword}%`);
    }

    // Lọc theo danh mục (slug hoặc id)
    if (category) {
      sql += ' AND (c.slug = ? OR c.id = ?)';
      params.push(category, category);
    }

    // Lọc theo chất liệu
    if (material) {
      sql += ' AND (m.code = ? OR m.id = ?)';
      params.push(material, material);
    }

    // Lọc theo loại đá
    if (stone) {
      sql += ' AND (s.code = ? OR s.id = ?)';
      params.push(stone, stone);
    }

    // Lọc theo khoảng giá
    if (minPrice) {
      sql += ' AND p.price >= ?';
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      sql += ' AND p.price <= ?';
      params.push(Number(maxPrice));
    }

    // Lọc sản phẩm nổi bật
    if (featured === '1') {
      sql += ' AND p.is_featured = 1';
    }

    // Lọc sản phẩm mới
    if (isNew === '1') {
      sql += ' AND p.is_new = 1';
    }

    // Sắp xếp
    switch (sort) {
      case 'price_asc': sql += ' ORDER BY p.price ASC'; break;
      case 'price_desc': sql += ' ORDER BY p.price DESC'; break;
      case 'newest': sql += ' ORDER BY p.created_at DESC'; break;
      case 'bestseller': sql += ' ORDER BY p.sold_count DESC'; break;
      case 'popular': sql += ' ORDER BY p.view_count DESC'; break;
      default: sql += ' ORDER BY p.created_at DESC';
    }

    // Đếm tổng số sản phẩm (cho phân trang)
    const countSql = sql.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await db.query(countSql, params);
    const total = countResult[0].total;

    // Phân trang
    const offset = (page - 1) * limit;
    sql += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);

    const [products] = await db.query(sql, params);

    res.json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
});

// ===== LẤY CHI TIẾT 1 SẢN PHẨM =====
// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Lấy thông tin sản phẩm
    const [products] = await db.query(
      `SELECT p.*, c.name as category_name, m.name as material_name, s.name as stone_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN materials m ON p.material_id = m.id
       LEFT JOIN stone_types s ON p.stone_type_id = s.id
       WHERE p.id = ?`, [id]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    // Lấy danh sách ảnh
    const [images] = await db.query(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order', [id]
    );

    // Lấy đánh giá đã duyệt
    const [reviews] = await db.query(
      `SELECT r.*, u.fullname, u.avatar 
       FROM product_reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.product_id = ? AND r.is_approved = 1
       ORDER BY r.created_at DESC`, [id]
    );

    // Cập nhật lượt xem +1
    await db.query('UPDATE products SET view_count = view_count + 1 WHERE id = ?', [id]);

    res.json({
      product: products[0],
      images,
      reviews,
      averageRating: reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0
    });

  } catch (error) {
    console.error('Get product detail error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
});

module.exports = router;
