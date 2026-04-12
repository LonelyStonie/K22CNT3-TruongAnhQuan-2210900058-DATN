// ============================================
// UNCUT GEMS - Backend Server (HOÀN CHỈNH)
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

// ===== ROUTES =====
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin-extra', require('./routes/admin-extra'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/blogs', require('./routes/blogs'));

app.get('/', (req, res) => {
  res.json({ message: 'UNCUT GEMS API is running!', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`====================================`);
  console.log(`  UNCUT GEMS Server`);
  console.log(`  Running on: http://localhost:${PORT}`);
  console.log(`====================================`);
});
