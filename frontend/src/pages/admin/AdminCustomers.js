// ============================================
// Trang Quản lý Khách hàng (Admin)
// File: frontend/src/pages/admin/AdminCustomers.js
// ============================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';
import '../../assets/css/Admin.css';

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toggleModal, setToggleModal] = useState({ open: false, id: null, name: '', isActive: true });

  const { isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) { navigate('/'); return; }
    fetchCustomers();
  }, [isAdmin]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getCustomers();
      setCustomers(data);
    } catch (error) {
      toast.error('Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleClick = (customer) => {
    setToggleModal({
      open: true, id: customer.id, name: customer.fullname, isActive: customer.is_active === 1
    });
  };

  const handleToggleConfirm = async () => {
    try {
      await adminAPI.toggleCustomer(toggleModal.id);
      toast.success(toggleModal.isActive ? `Đã khóa tài khoản ${toggleModal.name}` : `Đã mở khóa tài khoản ${toggleModal.name}`);
      setToggleModal({ open: false, id: null, name: '', isActive: true });
      fetchCustomers();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const filteredCustomers = customers.filter(c =>
    c.fullname.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search))
  );

  return (
    <>
      <div className="admin-page">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-logo">ADMIN PANEL</div>
          <nav className="admin-nav">
            <Link to="/admin" className="admin-nav-item">📊 Dashboard</Link>
            <Link to="/admin/products" className="admin-nav-item">📦 Sản phẩm</Link>
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
            <h1>Quản lý khách hàng</h1>
            <span className="admin-count">{customers.length} khách hàng</span>
          </div>

          {/* Tìm kiếm */}
          <div className="admin-search-bar">
            <input type="text" className="admin-search-input" placeholder="Tìm theo tên, email hoặc SĐT..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Ngày đăng ký</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="table-loading">Đang tải...</td></tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr><td colSpan="7" className="table-loading">{search ? 'Không tìm thấy khách hàng' : 'Chưa có khách hàng nào'}</td></tr>
                ) : (
                  filteredCustomers.map(c => (
                    <tr key={c.id}>
                      <td className="id-cell">#{c.id}</td>
                      <td className="name-cell">{c.fullname}</td>
                      <td>{c.email}</td>
                      <td>{c.phone || '—'}</td>
                      <td className="date-cell">{formatDate(c.created_at)}</td>
                      <td>
                        {c.is_active === 1 ? (
                          <span className="status-badge" style={{ color: '#1D9E75', borderColor: '#1D9E7540', background: '#1D9E7510' }}>Hoạt động</span>
                        ) : (
                          <span className="status-badge" style={{ color: '#E24B4A', borderColor: '#E24B4A40', background: '#E24B4A10' }}>Đã khóa</span>
                        )}
                      </td>
                      <td className="action-cell">
                        <button className={c.is_active === 1 ? 'action-delete' : 'action-confirm'} onClick={() => handleToggleClick(c)}>
                          {c.is_active === 1 ? 'Khóa' : 'Mở khóa'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      <ConfirmModal isOpen={toggleModal.open}
        title={toggleModal.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
        message={toggleModal.isActive
          ? `Khóa tài khoản "${toggleModal.name}"? Khách hàng sẽ không thể đăng nhập.`
          : `Mở khóa tài khoản "${toggleModal.name}"? Khách hàng sẽ có thể đăng nhập lại.`}
        confirmText={toggleModal.isActive ? 'Khóa' : 'Mở khóa'}
        cancelText="Hủy" type={toggleModal.isActive ? 'danger' : 'success'}
        onConfirm={handleToggleConfirm}
        onCancel={() => setToggleModal({ open: false, id: null, name: '', isActive: true })} />
    </>
  );
}

export default AdminCustomers;
