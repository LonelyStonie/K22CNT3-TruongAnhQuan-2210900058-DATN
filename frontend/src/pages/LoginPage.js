// ============================================
// Trang Đăng nhập
// File: frontend/src/pages/LoginPage.js
// ============================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate
    if (!email || !password) {
      setError('Vui lòng nhập email và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      const data = await authAPI.login({ email, password });
      // Lưu thông tin đăng nhập
      login(data.user, data.token);
      // Chuyển hướng theo vai trò
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Bên trái - Hình ảnh */}
        <div className="auth-banner">
          <div className="auth-banner-content">
            <div className="auth-banner-logo">UNCUT GEMS</div>
            <h2>Chào mừng trở lại</h2>
            <p>Đăng nhập để khám phá bộ sưu tập trang sức cao cấp và quản lý đơn hàng của bạn</p>
          </div>
        </div>

        {/* Bên phải - Form */}
        <div className="auth-form-wrapper">
          <div className="auth-form-inner">
            <h1 className="auth-title">Đăng nhập</h1>
            <p className="auth-subtitle">Nhập thông tin tài khoản của bạn</p>

            {/* Hiện lỗi */}
            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Mật khẩu</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
              </button>
            </form>

            <div className="auth-footer">
              Chưa có tài khoản? <Link to="/register" className="auth-link">Đăng ký ngay</Link>
            </div>

            {/* Tài khoản test */}
            <div className="auth-test-accounts">
              <p className="auth-test-title">Tài khoản test:</p>
              <div className="auth-test-item" onClick={() => { setEmail('admin@uncutgems.vn'); setPassword('admin123'); }}>
                <span>Admin:</span> admin@uncutgems.vn / admin123
              </div>
              <div className="auth-test-item" onClick={() => { setEmail('customer@gmail.com'); setPassword('123456'); }}>
                <span>Khách:</span> customer@gmail.com / 123456
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
