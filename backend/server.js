// ============================================
// UNCUT GEMS - Backend Server
// File: backend/server.js
// ============================================

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARE =====
// Cho phép Frontend (React) gọi API
app.use(cors());
// Đọc dữ liệu JSON từ request body
app.use(express.json());
// Phục vụ file ảnh tĩnh (upload sản phẩm)
app.use('/uploads', express.static('uploads'));

// ===== IMPORT ROUTES =====
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

// ===== SỬ DỤNG ROUTES =====
app.use('/api/auth', authRoutes);           // Đăng ký, Đăng nhập
app.use('/api/products', productRoutes);     // Sản phẩm
app.use('/api/categories', categoryRoutes);  // Danh mục
app.use('/api/cart', cartRoutes);            // Giỏ hàng
app.use('/api/orders', orderRoutes);         // Đơn hàng
app.use('/api/users', userRoutes);           // Thông tin user
app.use('/api/admin', adminRoutes);          // Quản trị

// ===== ROUTE TEST =====
app.get('/', (req, res) => {
  res.json({
    message: 'UNCUT GEMS API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      cart: '/api/cart',
      orders: '/api/orders',
    }
  });
});

// ===== KHỞI ĐỘNG SERVER =====
app.listen(PORT, () => {
  console.log(`====================================`);
  console.log(`  UNCUT GEMS Server`);
  console.log(`  Running on: http://localhost:${PORT}`);
  console.log(`====================================`);
});
