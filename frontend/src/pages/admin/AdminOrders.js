// ============================================
// Trang Quản lý Đơn hàng (Admin)
// File: frontend/src/pages/admin/AdminOrders.js
// ============================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';
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

const NEXT_STATUS = {
  pending: { next: 'confirmed', label: 'Xác nhận', action: 'confirm' },
  confirmed: { next: 'processing', label: 'Xử lý' },
  processing: { next: 'shipping', label: 'Giao hàng' },
  shipping: { next: 'delivered', label: 'Đã giao' },
};

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [confirmModal, setConfirmModal] = useState({ open: false, orderId: null, orderCode: '', action: '', nextStatus: '', label: '' });

  const { isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) { navigate('/'); return; }
    fetchOrders();
  }, [isAdmin, filterStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getOrders(filterStatus);
      setOrders(data);
    } catch (error) {
      toast.error('Không thể tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusClick = (order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    setConfirmModal({
      open: true, orderId: order.id, orderCode: order.order_code,
      action: next.action || 'status', nextStatus: next.next, label: next.label,
    });
  };

  const handleStatusConfirm = async () => {
    try {
      if (confirmModal.action === 'confirm') {
        await adminAPI.confirmOrder(confirmModal.orderId);
      } else {
        await adminAPI.updateOrderStatus(confirmModal.orderId, confirmModal.nextStatus);
      }
      toast.success(`Đơn ${confirmModal.orderCode}: ${confirmModal.label} thành công!`);
      setConfirmModal({ open: false, orderId: null, orderCode: '', action: '', nextStatus: '', label: '' });
      fetchOrders();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCancel = async (orderId, orderCode) => {
    try {
      await adminAPI.updateOrderStatus(orderId, 'cancelled');
      toast.success(`Đã hủy đơn hàng ${orderCode}`);
      fetchOrders();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const formatPrice = (p) => Number(p).toLocaleString('vi-VN');
  const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <div className="admin-page">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-logo">ADMIN PANEL</div>
          <nav className="admin-nav">
            <Link to="/admin" className="admin-nav-item">📊 Dashboard</Link>
            <Link to="/admin/products" className="admin-nav-item">📦 Sản phẩm</Link>
            <Link to="/admin/orders" className="admin-nav-item active">🛒 Đơn hàng</Link>
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
            <h1>Quản lý đơn hàng</h1>
          </div>

          {/* Lọc trạng thái */}
          <div className="orders-filter" style={{ marginBottom: 20 }}>
            {['', 'pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled'].map(s => (
              <button key={s} className={`filter-btn ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>
                {s ? STATUS_MAP[s]?.label : 'Tất cả'}
              </button>
            ))}
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Thanh toán</th>
                  <th>Trạng thái</th>
                  <th>Ngày đặt</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="table-loading">Đang tải...</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan="7" className="table-loading">Không có đơn hàng nào</td></tr>
                ) : (
                  orders.map(order => {
                    const status = STATUS_MAP[order.status] || {};
                    const next = NEXT_STATUS[order.status];
                    return (
                      <tr key={order.id}>
                        <td className="order-code-cell">{order.order_code}</td>
                        <td>
                          <div>{order.fullname}</div>
                          <div className="product-cat-cell">{order.email}</div>
                        </td>
                        <td className="price-cell">{formatPrice(order.total_amount)}₫</td>
                        <td>
                          <span className="tag tag-outline">
                            {order.payment_method === 'cod' ? 'COD' : order.payment_method === 'bank_transfer' ? 'Chuyển khoản' : 'Ví điện tử'}
                          </span>
                        </td>
                        <td>
                          <span className="status-badge" style={{ color: status.color, borderColor: `${status.color}40`, background: `${status.color}10` }}>
                            {status.label}
                          </span>
                        </td>
                        <td className="date-cell">{formatDate(order.created_at)}</td>
                        <td className="action-cell">
                          {next && (
                            <button className="action-confirm" onClick={() => handleStatusClick(order)}>
                              {next.label}
                            </button>
                          )}
                          {order.status === 'pending' && (
                            <button className="action-delete" onClick={() => handleCancel(order.id, order.order_code)}>
                              Hủy
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      <ConfirmModal isOpen={confirmModal.open}
        title={`${confirmModal.label} đơn hàng`}
        message={`Chuyển đơn ${confirmModal.orderCode} sang trạng thái "${confirmModal.label}"?`}
        confirmText={confirmModal.label} cancelText="Hủy" type="info"
        onConfirm={handleStatusConfirm}
        onCancel={() => setConfirmModal({ open: false, orderId: null, orderCode: '', action: '', nextStatus: '', label: '' })} />
    </>
  );
}

export default AdminOrders;
