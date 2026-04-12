// ============================================
// UNCUT GEMS - Backend Server (HOÀN CHỈNH 100%)
// File: backend/server.js — GHI ĐÈ
// ============================================

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ===== TẤT CẢ ROUTES =====
app.use('/api/auth', require('./routes/auth'));              // Đăng ký, Đăng nhập
app.use('/api/products', require('./routes/products'));      // Sản phẩm (public)
app.use('/api/categories', require('./routes/categories'));  // Danh mục (public)
app.use('/api/cart', require('./routes/cart'));              // Giỏ hàng
app.use('/api/orders', require('./routes/orders'));          // Đơn hàng
app.use('/api/users', require('./routes/users'));            // Thông tin user
app.use('/api/admin', require('./routes/admin'));            // Admin: SP, Đơn, KH
app.use('/api/admin-extra', require('./routes/admin-extra'));// Admin: Thống kê, Banner, Blog, Contact
app.use('/api/contacts', require('./routes/contacts'));      // Liên hệ (public)
app.use('/api/blogs', require('./routes/blogs'));            // Blog (public)
app.use('/api/catalog', require('./routes/catalog'));        // CRUD: Danh mục, Chất liệu, Loại đá
app.use('/api/extras', require('./routes/extras'));          // CRUD: Coupon, Wishlist, Review, Kho, Settings

app.get('/', (req, res) => {
  res.json({ message: 'UNCUT GEMS API is running!', version: '2.0.0' });
});

app.listen(PORT, () => {
  console.log(`====================================`);
  console.log(`  UNCUT GEMS Server v2.0`);
  console.log(`  Running on: http://localhost:${PORT}`);
  console.log(`====================================`);
});
