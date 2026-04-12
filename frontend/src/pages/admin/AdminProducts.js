// ============================================
// Trang Quản lý Sản phẩm (Admin)
// File: frontend/src/pages/admin/AdminProducts.js
// ============================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productAPI, adminAPI, categoryAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';
import '../../assets/css/Admin.css';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });
  const [form, setForm] = useState({
    name: '', sku: '', description: '', shortDescription: '', price: '', originalPrice: '',
    categoryId: '', materialId: '', stoneTypeId: '', size: '', weight: '',
    stockQuantity: '', isFeatured: false, isNew: false, certification: ''
  });

  const { isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) { navigate('/'); return; }
    fetchProducts();
    categoryAPI.getAll().then(setCategories).catch(console.error);
  }, [isAdmin]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productAPI.getAll('limit=100');
      setProducts(data.products);
    } catch (error) {
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name, sku: product.sku || '', description: product.description || '',
      shortDescription: product.short_description || '', price: product.price,
      originalPrice: product.original_price || '', categoryId: product.category_id || '',
      materialId: product.material_id || '', stoneTypeId: product.stone_type_id || '',
      size: product.size || '', weight: product.weight || '', stockQuantity: product.stock_quantity,
      isFeatured: product.is_featured === 1, isNew: product.is_new === 1,
      certification: product.certification || ''
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdd = () => {
    setEditingId(null);
    setForm({
      name: '', sku: '', description: '', shortDescription: '', price: '', originalPrice: '',
      categoryId: '', materialId: '', stoneTypeId: '', size: '', weight: '',
      stockQuantity: '', isFeatured: false, isNew: false, certification: ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.error('Vui lòng nhập tên và giá sản phẩm');
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => formData.append(key, val));

      const url = editingId
        ? `http://localhost:5000/api/admin/products/${editingId}`
        : 'http://localhost:5000/api/admin/products';

      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(editingId ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!');
      setShowForm(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/products/${deleteModal.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Xóa thất bại');
      toast.success(`Đã xóa "${deleteModal.name}"`);
      setDeleteModal({ open: false, id: null, name: '' });
      fetchProducts();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const formatPrice = (p) => Number(p).toLocaleString('vi-VN');

  return (
    <>
      <div className="admin-page">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-logo">ADMIN PANEL</div>
          <nav className="admin-nav">
            <Link to="/admin" className="admin-nav-item">📊 Dashboard</Link>
            <Link to="/admin/products" className="admin-nav-item active">📦 Sản phẩm</Link>
            <Link to="/admin/orders" className="admin-nav-item">🛒 Đơn hàng</Link>
            <Link to="/admin/customers" className="admin-nav-item">👥 Khách hàng</Link>
            <Link to="/admin/statistics" className="admin-nav-item">📈 Thống kê</Link>
            <Link to="/admin/banners" className="admin-nav-item">🖼️ Banner</Link>
            <Link to="/admin/blogs" className="admin-nav-item">📝 Blog</Link>
            <div className="admin-nav-divider" />
            <Link to="/" className="admin-nav-item">🏠 Về trang chủ</Link>
          </nav>
        </aside>

        <main className="admin-main">
          <div className="admin-header">
            <h1>Quản lý sản phẩm</h1>
            <button className="admin-add-btn" onClick={handleAdd}>+ Thêm sản phẩm</button>
          </div>

          {/* Form thêm/sửa */}
          {showForm && (
            <div className="admin-form-card">
              <h3>{editingId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="admin-form-grid">
                  <div className="form-group"><label>Tên sản phẩm *</label>
                    <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="VD: Nhẫn Kim Cương Eternal" /></div>
                  <div className="form-group"><label>Mã SKU</label>
                    <input className="form-input" name="sku" value={form.sku} onChange={handleChange} placeholder="VD: UG-R003" /></div>
                  <div className="form-group"><label>Giá bán (VNĐ) *</label>
                    <input className="form-input" name="price" type="number" value={form.price} onChange={handleChange} placeholder="VD: 45900000" /></div>
                  <div className="form-group"><label>Giá gốc (VNĐ)</label>
                    <input className="form-input" name="originalPrice" type="number" value={form.originalPrice} onChange={handleChange} placeholder="Để trống nếu không giảm giá" /></div>
                  <div className="form-group"><label>Danh mục</label>
                    <select className="form-input" name="categoryId" value={form.categoryId} onChange={handleChange}>
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select></div>
                  <div className="form-group"><label>Số lượng kho</label>
                    <input className="form-input" name="stockQuantity" type="number" value={form.stockQuantity} onChange={handleChange} placeholder="VD: 10" /></div>
                  <div className="form-group"><label>Kích thước</label>
                    <input className="form-input" name="size" value={form.size} onChange={handleChange} placeholder="VD: 6-7-8 hoặc 45cm" /></div>
                  <div className="form-group"><label>Trọng lượng (gram)</label>
                    <input className="form-input" name="weight" type="number" step="0.1" value={form.weight} onChange={handleChange} placeholder="VD: 3.5" /></div>
                  <div className="form-group"><label>Giấy kiểm định</label>
                    <input className="form-input" name="certification" value={form.certification} onChange={handleChange} placeholder="VD: GIA Certificate" /></div>
                </div>
                <div className="form-group"><label>Mô tả ngắn</label>
                  <input className="form-input" name="shortDescription" value={form.shortDescription} onChange={handleChange} placeholder="Mô tả hiển thị ở danh sách" /></div>
                <div className="form-group"><label>Mô tả chi tiết</label>
                  <textarea className="form-input" name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Mô tả đầy đủ sản phẩm" /></div>
                <div className="admin-checkbox-row">
                  <label className="admin-checkbox"><input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} /> Sản phẩm nổi bật</label>
                  <label className="admin-checkbox"><input type="checkbox" name="isNew" checked={form.isNew} onChange={handleChange} /> Sản phẩm mới</label>
                </div>
                <div className="admin-form-actions">
                  <button type="submit" className="admin-save-btn">{editingId ? 'Cập nhật' : 'Thêm sản phẩm'}</button>
                  <button type="button" className="admin-cancel-btn" onClick={() => setShowForm(false)}>Hủy</button>
                </div>
              </form>
            </div>
          )}

          {/* Bảng sản phẩm */}
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Tên sản phẩm</th>
                  <th>Giá</th>
                  <th>Kho</th>
                  <th>Đã bán</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="table-loading">Đang tải...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan="7" className="table-loading">Chưa có sản phẩm nào</td></tr>
                ) : (
                  products.map(p => (
                    <tr key={p.id}>
                      <td className="sku-cell">{p.sku}</td>
                      <td>
                        <div className="product-name-cell">{p.name}</div>
                        <div className="product-cat-cell">{p.category_name}</div>
                      </td>
                      <td className="price-cell">{formatPrice(p.price)}₫</td>
                      <td><span className={`stock-badge ${p.stock_quantity <= 3 ? 'low' : ''}`}>{p.stock_quantity}</span></td>
                      <td>{p.sold_count}</td>
                      <td>
                        {p.is_featured === 1 && <span className="tag tag-gold">Nổi bật</span>}
                        {p.is_new === 1 && <span className="tag tag-blue">Mới</span>}
                      </td>
                      <td className="action-cell">
                        <button className="action-edit" onClick={() => handleEdit(p)}>Sửa</button>
                        <button className="action-delete" onClick={() => setDeleteModal({ open: true, id: p.id, name: p.name })}>Xóa</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      <ConfirmModal isOpen={deleteModal.open} title="Xóa sản phẩm" message={`Xóa "${deleteModal.name}"? Thao tác không thể hoàn tác.`}
        confirmText="Xóa" cancelText="Giữ lại" type="danger" onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ open: false, id: null, name: '' })} />
    </>
  );
}

export default AdminProducts;
