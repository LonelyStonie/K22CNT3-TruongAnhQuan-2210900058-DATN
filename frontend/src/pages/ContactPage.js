// ============================================
// Trang Liên hệ
// File: frontend/src/pages/ContactPage.js
// ============================================

import React, { useState } from 'react';
import { useToast } from '../components/Toast';
import '../assets/css/Extra.css';

function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error('Vui lòng điền đầy đủ thông tin'); return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/contacts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="extra-page">
      <div className="extra-header"><h1>Liên hệ với chúng tôi</h1><p>Hãy để lại thông tin, chúng tôi sẽ phản hồi sớm nhất</p></div>
      <div className="contact-layout">
        <div className="contact-info-cards">
          <div className="contact-card"><div className="contact-card-icon">📍</div><h4>Địa chỉ</h4><p>123 Đường ABC, Quận 1, Hà Nội</p></div>
          <div className="contact-card"><div className="contact-card-icon">📞</div><h4>Hotline</h4><p>0123-456-789</p></div>
          <div className="contact-card"><div className="contact-card-icon">✉️</div><h4>Email</h4><p>info@uncutgems.vn</p></div>
          <div className="contact-card"><div className="contact-card-icon">🕐</div><h4>Giờ mở cửa</h4><p>8:00 - 21:00 (T2 - CN)</p></div>
        </div>
        <div className="contact-form-wrap">
          <h3>Gửi tin nhắn</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group"><label>Họ tên *</label><input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="Nhập họ tên" /></div>
              <div className="form-group"><label>Email *</label><input className="form-input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="Nhập email" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Số điện thoại</label><input className="form-input" name="phone" value={form.phone} onChange={handleChange} placeholder="Nhập SĐT" /></div>
              <div className="form-group"><label>Tiêu đề *</label><input className="form-input" name="subject" value={form.subject} onChange={handleChange} placeholder="Tiêu đề" /></div>
            </div>
            <div className="form-group"><label>Nội dung *</label><textarea className="form-input" name="message" value={form.message} onChange={handleChange} rows={5} placeholder="Nội dung tin nhắn..." /></div>
            <button type="submit" className="auth-submit" disabled={loading}>{loading ? 'Đang gửi...' : 'Gửi tin nhắn'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
