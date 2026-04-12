// ============================================
// Trang Thống kê (Admin)
// File: frontend/src/pages/admin/AdminStatistics.js
// ============================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import '../../assets/css/Admin.css';

const API = 'http://localhost:5000/api';

function AdminStatistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
const { isAdmin, loading: authLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) { navigate('/'); return; }
    fetchStats();
  }, [isAdmin, authLoading]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/admin-extra/statistics`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStats(data);
    } catch (error) { toast.error('Không thể tải thống kê'); }
    finally { setLoading(false); }
  };

  const formatPrice = (p) => Number(p).toLocaleString('vi-VN');

  if (loading) return <div className="admin-loading">Đang tải thống kê...</div>;
  if (!stats) return <div className="admin-loading">Không có dữ liệu</div>;

  const maxRevenue = Math.max(...stats.revenueByDay.map(d => Number(d.revenue)), 1);
  const maxMonthRevenue = Math.max(...stats.revenueByMonth.map(d => Number(d.revenue)), 1);
  const totalOrders = stats.ordersByStatus.reduce((s, o) => s + o.count, 0) || 1;
  const statusColors = { pending: '#EF9F27', confirmed: '#378ADD', processing: '#534AB7', shipping: '#1D9E75', delivered: '#1D9E75', cancelled: '#E24B4A', returned: '#E24B4A' };
  const statusLabels = { pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', processing: 'Đang xử lý', shipping: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy', returned: 'Trả hàng' };

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">ADMIN PANEL</div>
        <nav className="admin-nav">
          <Link to="/admin" className="admin-nav-item">📊 Dashboard</Link>
          <Link to="/admin/statistics" className="admin-nav-item active">📈 Thống kê</Link>
          <Link to="/admin/products" className="admin-nav-item">📦 Sản phẩm</Link>
          <Link to="/admin/orders" className="admin-nav-item">🛒 Đơn hàng</Link>
          <Link to="/admin/customers" className="admin-nav-item">👥 Khách hàng</Link>
          <Link to="/admin/banners" className="admin-nav-item">🖼️ Banner</Link>
          <Link to="/admin/blogs" className="admin-nav-item">📝 Blog</Link>
          <div className="admin-nav-divider" />
          <Link to="/" className="admin-nav-item">🏠 Về trang chủ</Link>
        </nav>
      </aside>

      <main className="admin-main">
        <div className="admin-header"><h1>Thống kê & Báo cáo</h1></div>

        {/* Biểu đồ doanh thu 7 ngày */}
        <div className="admin-section">
          <div className="section-header"><h2>Doanh thu 7 ngày gần nhất</h2></div>
          <div className="chart-container">
            <div className="bar-chart">
              {stats.revenueByDay.length === 0 ? (
                <div className="chart-empty">Chưa có dữ liệu doanh thu</div>
              ) : (
                stats.revenueByDay.map((d, i) => (
                  <div className="bar-item" key={i}>
                    <div className="bar-value">{formatPrice(d.revenue)}₫</div>
                    <div className="bar-fill" style={{ height: `${(Number(d.revenue) / maxRevenue) * 200}px`, background: 'linear-gradient(180deg, #C9A84C, #A88B3D)' }} />
                    <div className="bar-label">{new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</div>
                    <div className="bar-orders">{d.orders} đơn</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="stats-two-col">
          {/* Đơn hàng theo trạng thái */}
          <div className="admin-section">
            <div className="section-header"><h2>Đơn hàng theo trạng thái</h2></div>
            <div className="donut-chart-container">
              {stats.ordersByStatus.map((s, i) => (
                <div className="donut-row" key={i}>
                  <div className="donut-color" style={{ background: statusColors[s.status] }} />
                  <div className="donut-label">{statusLabels[s.status] || s.status}</div>
                  <div className="donut-bar-wrap">
                    <div className="donut-bar" style={{ width: `${(s.count / totalOrders) * 100}%`, background: statusColors[s.status] }} />
                  </div>
                  <div className="donut-count">{s.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Doanh thu theo danh mục */}
          <div className="admin-section">
            <div className="section-header"><h2>Doanh thu theo danh mục</h2></div>
            <div className="donut-chart-container">
              {stats.revenueByCategory.map((c, i) => {
                const colors = ['#C9A84C', '#378ADD', '#1D9E75', '#534AB7', '#EF9F27', '#E24B4A'];
                const maxCatRev = Math.max(...stats.revenueByCategory.map(x => Number(x.revenue)), 1);
                return (
                  <div className="donut-row" key={i}>
                    <div className="donut-color" style={{ background: colors[i % colors.length] }} />
                    <div className="donut-label">{c.name}</div>
                    <div className="donut-bar-wrap">
                      <div className="donut-bar" style={{ width: `${(Number(c.revenue) / maxCatRev) * 100}%`, background: colors[i % colors.length] }} />
                    </div>
                    <div className="donut-count">{formatPrice(c.revenue)}₫</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top khách hàng */}
        <div className="admin-section">
          <div className="section-header"><h2>Top khách hàng VIP</h2></div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead><tr><th>Khách hàng</th><th>Email</th><th>Số đơn</th><th>Tổng chi tiêu</th></tr></thead>
              <tbody>
                {stats.topCustomers.length === 0 ? (
                  <tr><td colSpan="4" className="table-loading">Chưa có dữ liệu</td></tr>
                ) : (
                  stats.topCustomers.map((c, i) => (
                    <tr key={i}>
                      <td className="name-cell">{c.fullname}</td>
                      <td>{c.email}</td>
                      <td>{c.order_count}</td>
                      <td className="price-cell">{formatPrice(c.total_spent)}₫</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminStatistics;
