// ============================================
// App chính - CẬP NHẬT: Thêm trang Admin
// File: frontend/src/App.js — GHI ĐÈ
// ============================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// CSS
import './assets/css/App.css';
import './assets/css/Auth.css';
import './assets/css/Products.css';
import './assets/css/Toast.css';
import './assets/css/Cart.css';
import './assets/css/Admin.css';

// Context
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages - Khách hàng
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';

// Pages - Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="App">
            <Navbar />

            <Routes>
              {/* Trang công khai */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />

              {/* Trang yêu cầu đăng nhập */}
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrdersPage />} />

              {/* Trang Admin */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/customers" element={<AdminCustomers />} />
            </Routes>

            <Footer />
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
