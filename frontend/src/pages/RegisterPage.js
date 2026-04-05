// ============================================
// Trang Đăng ký - CẬP NHẬT: Toast thay alert
// File: frontend/src/pages/RegisterPage.js — GHI ĐÈ
// ============================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { authAPI } from '../services/api';

function RegisterPage() {
  const [form, setForm] = useState({ fullname: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.fullname || !form.email || !form.password) {
      setError('Vui lòng điền đầy đủ họ tên, email và mật khẩu');
      return;
    }
    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      await authAPI.register({
        fullname: form.fullname,
        email: form.email,
        password: form.password,
        phone: form.phone,
      });
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-banner">
          <div className="auth-banner-content">
            <div className="auth-banner-logo">UNCUT GEMS</div>
            <h2>Tạo tài khoản mới</h2>
            <p>Đăng ký để trải nghiệm mua sắm trang sức cao cấp và nhận ưu đãi độc quyền dành cho thành viên</p>
          </div>
        </div>

        <div className="auth-form-wrapper">
          <div className="auth-form-inner">
            <h1 className="auth-title">Đăng ký</h1>
            <p className="auth-subtitle">Tạo tài khoản mới để bắt đầu mua sắm</p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Họ và tên *</label>
                <input type="text" name="fullname" placeholder="Nhập họ và tên" value={form.fullname} onChange={handleChange} className="form-input" />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" name="email" placeholder="Nhập email" value={form.email} onChange={handleChange} className="form-input" />
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <input type="tel" name="phone" placeholder="Nhập số điện thoại" value={form.phone} onChange={handleChange} className="form-input" />
              </div>
              <div className="form-group">
                <label>Mật khẩu *</label>
                <div className="password-wrapper">
                  <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Tối thiểu 6 ký tự" value={form.password} onChange={handleChange} className="form-input" />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Xác nhận mật khẩu *</label>
                <input type="password" name="confirmPassword" placeholder="Nhập lại mật khẩu" value={form.confirmPassword} onChange={handleChange} className="form-input" />
              </div>
              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Đăng ký'}
              </button>
            </form>

            <div className="auth-footer">
              Đã có tài khoản? <Link to="/login" className="auth-link">Đăng nhập</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
