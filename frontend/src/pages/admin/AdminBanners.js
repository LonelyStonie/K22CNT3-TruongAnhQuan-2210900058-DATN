// ============================================
// Trang Quản lý Banner (Admin)
// File: frontend/src/pages/admin/AdminBanners.js
// ============================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';
import '../../assets/css/Admin.css';

const API = 'http://localhost:5000/api/admin-extra';

function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });
  const [form, setForm] = useState({ title: '', subtitle: '', imageUrl: '', linkUrl: '', position: 'home_slider', sortOrder: 0, isActive: 1 });

  const { isAdmin, loading: authLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => { if (authLoading) return; if (!isAdmin) { navigate('/'); return; } fetchBanners(); }, [isAdmin, authLoading]);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/banners`, { headers });
      setBanners(await res.json());
    } catch (e) { toast.error('Không thể tải banner'); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => { const { name, value } = e.target; setForm({ ...form, [name]: value }); };

  const handleEdit = (b) => {
    setEditingId(b.id);
    setForm({ title: b.title, subtitle: b.subtitle || '', imageUrl: b.image_url, linkUrl: b.link_url || '', position: b.position, sortOrder: b.sort_order, isActive: b.is_active });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `${API}/banners/${editingId}` : `${API}/banners`;
      const res = await fetch(url, { method: editingId ? 'PUT' : 'POST', headers, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
      setShowForm(false); setEditingId(null);
      setForm({ title: '', subtitle: '', imageUrl: '', linkUrl: '', position: 'home_slider', sortOrder: 0, isActive: 1 });
      fetchBanners();
    } catch (e) { toast.error(e.message); }
  };

  const handleDelete = async () => {
    try {
      await fetch(`${API}/banners/${deleteModal.id}`, { method: 'DELETE', headers });
      toast.success('Đã xóa banner');
      setDeleteModal({ open: false, id: null, name: '' });
      fetchBanners();
    } catch (e) { toast.error(e.message); }
  };

  const positionLabels = { home_slider: 'Slider trang chủ', home_middle: 'Giữa trang chủ', category_top: 'Đầu danh mục', popup: 'Popup' };

  return (
    <>
      <div className="admin-page">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-logo">ADMIN PANEL</div>
          <nav className="admin-nav">
            <Link to="/admin" className="admin-nav-item">📊 Dashboard</Link>
            <Link to="/admin/statistics" className="admin-nav-item">📈 Thống kê</Link>
            <Link to="/admin/products" className="admin-nav-item">📦 Sản phẩm</Link>
            <Link to="/admin/orders" className="admin-nav-item">🛒 Đơn hàng</Link>
            <Link to="/admin/customers" className="admin-nav-item">👥 Khách hàng</Link>
            <Link to="/admin/banners" className="admin-nav-item active">🖼️ Banner</Link>
            <Link to="/admin/blogs" className="admin-nav-item">📝 Blog</Link>
            <div className="admin-nav-divider" />
            <Link to="/" className="admin-nav-item">🏠 Về trang chủ</Link>
          </nav>
        </aside>

        <main className="admin-main">
          <div className="admin-header">
            <h1>Quản lý Banner</h1>
            <button className="admin-add-btn" onClick={() => { setEditingId(null); setShowForm(true); setForm({ title: '', subtitle: '', imageUrl: '', linkUrl: '', position: 'home_slider', sortOrder: 0, isActive: 1 }); }}>+ Thêm banner</button>
          </div>

          {showForm && (
            <div className="admin-form-card">
              <h3>{editingId ? 'Sửa banner' : 'Thêm banner mới'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="admin-form-grid">
                  <div className="form-group"><label>Tiêu đề *</label><input className="form-input" name="title" value={form.title} onChange={handleChange} placeholder="Tiêu đề banner" /></div>
                  <div className="form-group"><label>Phụ đề</label><input className="form-input" name="subtitle" value={form.subtitle} onChange={handleChange} placeholder="Slogan ngắn" /></div>
                  <div className="form-group"><label>URL hình ảnh *</label><input className="form-input" name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://..." /></div>
                  <div className="form-group"><label>Link khi click</label><input className="form-input" name="linkUrl" value={form.linkUrl} onChange={handleChange} placeholder="/products" /></div>
                  <div className="form-group"><label>Vị trí</label>
                    <select className="form-input" name="position" value={form.position} onChange={handleChange}>
                      <option value="home_slider">Slider trang chủ</option><option value="home_middle">Giữa trang chủ</option>
                      <option value="category_top">Đầu danh mục</option><option value="popup">Popup</option>
                    </select></div>
                  <div className="form-group"><label>Thứ tự</label><input className="form-input" name="sortOrder" type="number" value={form.sortOrder} onChange={handleChange} /></div>
                </div>
                <div className="admin-form-actions">
                  <button type="submit" className="admin-save-btn">{editingId ? 'Cập nhật' : 'Thêm'}</button>
                  <button type="button" className="admin-cancel-btn" onClick={() => setShowForm(false)}>Hủy</button>
                </div>
              </form>
            </div>
          )}

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Tiêu đề</th><th>Vị trí</th><th>Thứ tự</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan="6" className="table-loading">Đang tải...</td></tr> :
                banners.length === 0 ? <tr><td colSpan="6" className="table-loading">Chưa có banner</td></tr> :
                banners.map(b => (
                  <tr key={b.id}>
                    <td className="id-cell">#{b.id}</td>
                    <td><div className="name-cell">{b.title}</div><div className="product-cat-cell">{b.subtitle}</div></td>
                    <td><span className="tag tag-outline">{positionLabels[b.position]}</span></td>
                    <td>{b.sort_order}</td>
                    <td>{b.is_active ? <span className="status-badge" style={{ color: '#1D9E75', borderColor: '#1D9E7540', background: '#1D9E7510' }}>Hiện</span> : <span className="status-badge" style={{ color: '#E24B4A', borderColor: '#E24B4A40', background: '#E24B4A10' }}>Ẩn</span>}</td>
                    <td className="action-cell">
                      <button className="action-edit" onClick={() => handleEdit(b)}>Sửa</button>
                      <button className="action-delete" onClick={() => setDeleteModal({ open: true, id: b.id, name: b.title })}>Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
      <ConfirmModal isOpen={deleteModal.open} title="Xóa banner" message={`Xóa banner "${deleteModal.name}"?`} confirmText="Xóa" cancelText="Giữ lại" type="danger" onConfirm={handleDelete} onCancel={() => setDeleteModal({ open: false, id: null, name: '' })} />
    </>
  );
}

export default AdminBanners;
