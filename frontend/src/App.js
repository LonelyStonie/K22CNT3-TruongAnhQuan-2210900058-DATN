import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import CSS
import './assets/css/App.css';

// Import Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Import Pages
import HomePage from './pages/HomePage';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Thanh điều hướng - hiển thị trên mọi trang */}
        <Navbar />

        {/* Nội dung trang - thay đổi theo URL */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* Các trang khác sẽ thêm sau */}
          {/* <Route path="/products" element={<ProductsPage />} /> */}
          {/* <Route path="/products/:id" element={<ProductDetailPage />} /> */}
          {/* <Route path="/cart" element={<CartPage />} /> */}
          {/* <Route path="/login" element={<LoginPage />} /> */}
          {/* <Route path="/register" element={<RegisterPage />} /> */}
          {/* <Route path="/blog" element={<BlogPage />} /> */}
          {/* <Route path="/contact" element={<ContactPage />} /> */}
          {/* <Route path="/admin" element={<AdminDashboard />} /> */}
        </Routes>

        {/* Footer - hiển thị trên mọi trang */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
