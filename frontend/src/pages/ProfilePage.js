// ============================================
// Trang Thông tin cá nhân
// File: frontend/src/pages/ProfilePage.js
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import '../assets/css/Extra.css';

function ProfilePage() {
  const [profile, setProfile] = useState({ fullname: '', email: '', phone: '', gender: '', date_of_birth: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { isLoggedIn, user, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return; }
    fetchProfile();
  }, [isLoggedIn]);

  const fetchProfile = async () => {
    try {
      const data = await userAPI.getProfile();
      setProfile({
        fullname: data.fullname || '', email: data.email || '', phone: data.phone || '',
        gender: data.gender || '', date_of_birth: data.date_of_birth ? data.date_of_birth.split('T')[0] : ''
      });
    } catch (e) { toast.error('Không thể tải thông tin'); }
    finally { setLoading(false); }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userAPI.updateProfile({
        fullname: profile.fullname, phone: profile.phone, gender: profile.gender, date_of_birth: profile.date_of_birth || null
      });
      toast.success('Cập nhật thông tin thành công!');
      // Cập nhật tên trong navbar
      const token = localStorage.getItem('token');
      login({ ...user, fullname: profile.fullname }, token);
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp'); return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự'); return;
    }
    setSaving(true);
    try {
      await userAPI.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Đổi mật khẩu thành công!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="admin-loading">Đang tải...</div>;

  return (
    <div className="extra-page">
      <div className="extra-header"><h1>Thông tin cá nhân</h1><p>Quản lý tài khoản và bảo mật</p></div>

      <div className="profile-layout">
        {/* Tab buttons */}
        <div className="profile-tabs">
          <button className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>👤 Thông tin</button>
          <button className={`profile-tab ${activeTab === 'password' ? 'active' : ''}`} onClick={() => setActiveTab('password')}>🔒 Đổi mật khẩu</button>
        </div>

        {/* Content */}
        <div className="profile-content">
          {activeTab === 'profile' && (
            <div className="profile-card">
              <h3>Thông tin tài khoản</h3>
              <form onSubmit={handleProfileSave}>
                <div className="form-row">
                  <div className="form-group"><label>Họ và tên</label>
                    <input className="form-input" value={profile.fullname} onChange={e => setProfile({ ...profile, fullname: e.target.value })} /></div>
                  <div className="form-group"><label>Email (không thể đổi)</label>
                    <input className="form-input" value={profile.email} disabled style={{ opacity: 0.5 }} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Số điện thoại</label>
                    <input className="form-input" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} /></div>
                  <div className="form-group"><label>Giới tính</label>
                    <select className="form-input" value={profile.gender} onChange={e => setProfile({ ...profile, gender: e.target.value })}>
                      <option value="">-- Chọn --</option><option value="male">Nam</option><option value="female">Nữ</option><option value="other">Khác</option>
                    </select></div>
                </div>
                <div className="form-group" style={{ maxWidth: 300 }}><label>Ngày sinh</label>
                  <input className="form-input" type="date" value={profile.date_of_birth} onChange={e => setProfile({ ...profile, date_of_birth: e.target.value })} /></div>
                <button type="submit" className="auth-submit" style={{ maxWidth: 200 }} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="profile-card">
              <h3>Đổi mật khẩu</h3>
              <form onSubmit={handlePasswordChange} style={{ maxWidth: 400 }}>
                <div className="form-group"><label>Mật khẩu hiện tại</label>
                  <input className="form-input" type="password" value={passwords.currentPassword} onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })} placeholder="Nhập mật khẩu hiện tại" /></div>
                <div className="form-group"><label>Mật khẩu mới</label>
                  <input className="form-input" type="password" value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} placeholder="Tối thiểu 6 ký tự" /></div>
                <div className="form-group"><label>Xác nhận mật khẩu mới</label>
                  <input className="form-input" type="password" value={passwords.confirmPassword} onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })} placeholder="Nhập lại mật khẩu mới" /></div>
                <button type="submit" className="auth-submit" style={{ maxWidth: 200 }} disabled={saving}>{saving ? 'Đang lưu...' : 'Đổi mật khẩu'}</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
