// ============================================
// Trang Quản lý Blog (Admin)
// File: frontend/src/pages/admin/AdminBlogs.js
// ============================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';
import '../../assets/css/Admin.css';

const API = 'http://localhost:5000/api/admin-extra';

function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });
  const [form, setForm] = useState({ title: '', content: '', thumbnail: '', excerpt: '', tags: '', isPublished: false });

  const { isAdmin, loading: authLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => { if (authLoading) return; if (!isAdmin) { navigate('/'); return; } fetchBlogs(); }, [isAdmin, authLoading]);

  const fetchBlogs = async () => {
    setLoading(true);
    try { const res = await fetch(`${API}/blogs`, { headers }); setBlogs(await res.json()); }
    catch (e) { toast.error('Không thể tải bài viết'); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleEdit = (b) => {
    setEditingId(b.id);
    setForm({ title: b.title, content: b.content, thumbnail: b.thumbnail || '', excerpt: b.excerpt || '', tags: b.tags || '', isPublished: b.is_published === 1 });
    setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `${API}/blogs/${editingId}` : `${API}/blogs`;
      const res = await fetch(url, { method: editingId ? 'PUT' : 'POST', headers, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
      setShowForm(false); setEditingId(null);
      setForm({ title: '', content: '', thumbnail: '', excerpt: '', tags: '', isPublished: false });
      fetchBlogs();
    } catch (e) { toast.error(e.message); }
  };

  const handleDelete = async () => {
    try {
      await fetch(`${API}/blogs/${deleteModal.id}`, { method: 'DELETE', headers });
      toast.success('Đã xóa bài viết');
      setDeleteModal({ open: false, id: null, name: '' }); fetchBlogs();
    } catch (e) { toast.error(e.message); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN');

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
            <Link to="/admin/banners" className="admin-nav-item">🖼️ Banner</Link>
            <Link to="/admin/blogs" className="admin-nav-item active">📝 Blog</Link>
            <div className="admin-nav-divider" />
            <Link to="/" className="admin-nav-item">🏠 Về trang chủ</Link>
          </nav>
        </aside>

        <main className="admin-main">
          <div className="admin-header">
            <h1>Quản lý Blog</h1>
            <button className="admin-add-btn" onClick={() => { setEditingId(null); setShowForm(true); setForm({ title: '', content: '', thumbnail: '', excerpt: '', tags: '', isPublished: false }); }}>+ Viết bài mới</button>
          </div>

          {showForm && (
            <div className="admin-form-card">
              <h3>{editingId ? 'Sửa bài viết' : 'Viết bài mới'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group"><label>Tiêu đề *</label><input className="form-input" name="title" value={form.title} onChange={handleChange} placeholder="Tiêu đề bài viết" /></div>
                <div className="admin-form-grid">
                  <div className="form-group"><label>Ảnh đại diện (URL)</label><input className="form-input" name="thumbnail" value={form.thumbnail} onChange={handleChange} placeholder="https://..." /></div>
                  <div className="form-group"><label>Tags</label><input className="form-input" name="tags" value={form.tags} onChange={handleChange} placeholder="kim-cuong, xu-huong" /></div>
                </div>
                <div className="form-group"><label>Tóm tắt</label><textarea className="form-input" name="excerpt" value={form.excerpt} onChange={handleChange} rows={2} placeholder="Tóm tắt ngắn hiển thị ở danh sách" /></div>
                <div className="form-group"><label>Nội dung *</label><textarea className="form-input" name="content" value={form.content} onChange={handleChange} rows={8} placeholder="Nội dung bài viết..." /></div>
                <div className="admin-checkbox-row">
                  <label className="admin-checkbox"><input type="checkbox" name="isPublished" checked={form.isPublished} onChange={handleChange} /> Xuất bản ngay</label>
                </div>
                <div className="admin-form-actions">
                  <button type="submit" className="admin-save-btn">{editingId ? 'Cập nhật' : 'Đăng bài'}</button>
                  <button type="button" className="admin-cancel-btn" onClick={() => setShowForm(false)}>Hủy</button>
                </div>
              </form>
            </div>
          )}

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead><tr><th>Tiêu đề</th><th>Tác giả</th><th>Lượt xem</th><th>Trạng thái</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan="6" className="table-loading">Đang tải...</td></tr> :
                blogs.length === 0 ? <tr><td colSpan="6" className="table-loading">Chưa có bài viết</td></tr> :
                blogs.map(b => (
                  <tr key={b.id}>
                    <td><div className="name-cell">{b.title}</div><div className="product-cat-cell">{b.tags}</div></td>
                    <td>{b.author_name || 'Admin'}</td>
                    <td>{b.view_count}</td>
                    <td>{b.is_published ? <span className="tag tag-gold">Đã xuất bản</span> : <span className="tag tag-outline">Nháp</span>}</td>
                    <td className="date-cell">{formatDate(b.created_at)}</td>
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
      <ConfirmModal isOpen={deleteModal.open} title="Xóa bài viết" message={`Xóa bài viết "${deleteModal.name}"?`} confirmText="Xóa" cancelText="Giữ lại" type="danger" onConfirm={handleDelete} onCancel={() => setDeleteModal({ open: false, id: null, name: '' })} />
    </>
  );
}

export default AdminBlogs;
