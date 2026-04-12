// ============================================
// Trang Admin Dashboard
// File: frontend/src/pages/admin/AdminDashboard.js
// ============================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import '../../assets/css/Admin.css';

const STATUS_MAP = {
  pending: { label: 'Chờ xác nhận', color: '#EF9F27' },
  confirmed: { label: 'Đã xác nhận', color: '#378ADD' },
  processing: { label: 'Đang xử lý', color: '#534AB7' },
  shipping: { label: 'Đang giao', color: '#1D9E75' },
  delivered: { label: 'Đã giao', color: '#1D9E75' },
  cancelled: { label: 'Đã hủy', color: '#E24B4A' },
  returned: { label: 'Trả hàng', color: '#E24B4A' },
};

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) { navigate('/'); return; }
    fetchDashboard();
  }, [isAdmin]);

  const fetchDashboard = async () => {
    try {
      const data = await adminAPI.getDashboard();
      setStats(data);
    } catch (error) {
      toast.error('Không thể tải dữ liệu Dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (p) => Number(p).toLocaleString('vi-VN');
  const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) return <div className="admin-loading">Đang tải Dashboard...</div>;
  if (!stats) return <div className="admin-loading">Không thể tải dữ liệu</div>;

  return (
    <div className="admin-page">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">ADMIN PANEL</div>
        <nav className="admin-nav">
          <Link to="/admin" className="admin-nav-item active">📊 Dashboard</Link>
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

      {/* Main content */}
      <main className="admin-main">
        <div className="admin-header">
          <h1>Dashboard</h1>
          <p>Tổng quan hệ thống UNCUT GEMS</p>
        </div>

        {/* Thống kê */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C' }}>💰</div>
            <div className="stat-info">
              <div className="stat-value">{formatPrice(stats.totalRevenue)}₫</div>
              <div className="stat-label">Tổng doanh thu</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(55,138,221,0.15)', color: '#378ADD' }}>📦</div>
            <div className="stat-info">
              <div className="stat-value">{stats.totalOrders}</div>
              <div className="stat-label">Tổng đơn hàng</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(239,159,39,0.15)', color: '#EF9F27' }}>⏳</div>
            <div className="stat-info">
              <div className="stat-value">{stats.pendingOrders}</div>
              <div className="stat-label">Đơn chờ xử lý</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(29,158,117,0.15)', color: '#1D9E75' }}>👥</div>
            <div className="stat-info">
              <div className="stat-value">{stats.totalCustomers}</div>
              <div className="stat-label">Khách hàng</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(83,74,183,0.15)', color: '#534AB7' }}>💎</div>
            <div className="stat-info">
              <div className="stat-value">{stats.totalProducts}</div>
              <div className="stat-label">Sản phẩm</div>
            </div>
          </div>
        </div>

        {/* Đơn hàng gần đây */}
        <div className="admin-section">
          <div className="section-header">
            <h2>Đơn hàng gần đây</h2>
            <Link to="/admin/orders" className="view-all">Xem tất cả →</Link>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày đặt</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map(order => {
                  const status = STATUS_MAP[order.status] || {};
                  return (
                    <tr key={order.id}>
                      <td className="order-code-cell">{order.order_code}</td>
                      <td>{order.fullname}</td>
                      <td className="price-cell">{formatPrice(order.total_amount)}₫</td>
                      <td>
                        <span className="status-badge" style={{ color: status.color, borderColor: `${status.color}40`, background: `${status.color}10` }}>
                          {status.label}
                        </span>
                      </td>
                      <td className="date-cell">{formatDate(order.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top sản phẩm bán chạy */}
        <div className="admin-section">
          <div className="section-header">
            <h2>Top sản phẩm bán chạy</h2>
            <Link to="/admin/products" className="view-all">Quản lý →</Link>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Tên sản phẩm</th>
                  <th>Giá bán</th>
                  <th>Đã bán</th>
                  <th>Tồn kho</th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.map(p => (
                  <tr key={p.id}>
                    <td className="sku-cell">{p.sku}</td>
                    <td>{p.name}</td>
                    <td className="price-cell">{formatPrice(p.price)}₫</td>
                    <td>{p.sold_count}</td>
                    <td>
                      <span className={`stock-badge ${p.stock_quantity <= 3 ? 'low' : ''}`}>
                        {p.stock_quantity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
