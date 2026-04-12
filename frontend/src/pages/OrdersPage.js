// ============================================
// Trang Đơn hàng của tôi
// File: frontend/src/pages/OrdersPage.js
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import '../assets/css/Cart.css';

const STATUS_MAP = {
  pending: { label: 'Chờ xác nhận', color: '#EF9F27', step: 1 },
  confirmed: { label: 'Đã xác nhận', color: '#378ADD', step: 2 },
  processing: { label: 'Đang xử lý', color: '#534AB7', step: 3 },
  shipping: { label: 'Đang giao', color: '#1D9E75', step: 4 },
  delivered: { label: 'Đã giao', color: '#1D9E75', step: 5 },
  cancelled: { label: 'Đã hủy', color: '#E24B4A', step: 0 },
  returned: { label: 'Trả hàng', color: '#E24B4A', step: 0 },
};

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [cancelModal, setCancelModal] = useState({ open: false, orderId: null, orderCode: '' });

  const { isLoggedIn } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return; }
    fetchOrders();
  }, [isLoggedIn]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderAPI.getAll();
      setOrders(data);
    } catch (error) {
      toast.error('Không thể tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const viewDetail = async (orderId) => {
    try {
      const data = await orderAPI.getById(orderId);
      setOrderDetail(data);
      setSelectedOrder(orderId);
    } catch (error) {
      toast.error('Không thể tải chi tiết đơn hàng');
    }
  };

  const handleCancelClick = (orderId, orderCode) => {
    setCancelModal({ open: true, orderId, orderCode });
  };

  const handleCancelConfirm = async () => {
    try {
      await orderAPI.cancel(cancelModal.orderId);
      toast.success(`Đã hủy đơn hàng ${cancelModal.orderCode}`);
      setCancelModal({ open: false, orderId: null, orderCode: '' });
      fetchOrders();
      if (selectedOrder === cancelModal.orderId) {
        setSelectedOrder(null);
        setOrderDetail(null);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const formatPrice = (p) => Number(p).toLocaleString('vi-VN');
  const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const filteredOrders = filterStatus ? orders.filter(o => o.status === filterStatus) : orders;

  if (loading) return <div className="cart-loading">Đang tải đơn hàng...</div>;

  return (
    <>
      <div className="orders-page">
        <div className="cart-header">
          <h1>Đơn hàng của tôi</h1>
          <p>{orders.length} đơn hàng</p>
        </div>

        {/* Bộ lọc trạng thái */}
        <div className="orders-filter">
          <button className={`filter-btn ${!filterStatus ? 'active' : ''}`} onClick={() => setFilterStatus('')}>Tất cả</button>
          <button className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`} onClick={() => setFilterStatus('pending')}>Chờ xác nhận</button>
          <button className={`filter-btn ${filterStatus === 'confirmed' ? 'active' : ''}`} onClick={() => setFilterStatus('confirmed')}>Đã xác nhận</button>
          <button className={`filter-btn ${filterStatus === 'shipping' ? 'active' : ''}`} onClick={() => setFilterStatus('shipping')}>Đang giao</button>
          <button className={`filter-btn ${filterStatus === 'delivered' ? 'active' : ''}`} onClick={() => setFilterStatus('delivered')}>Đã giao</button>
          <button className={`filter-btn ${filterStatus === 'cancelled' ? 'active' : ''}`} onClick={() => setFilterStatus('cancelled')}>Đã hủy</button>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">📦</div>
            <h3>Chưa có đơn hàng nào</h3>
            <p>{filterStatus ? 'Không có đơn hàng ở trạng thái này' : 'Bạn chưa đặt đơn hàng nào'}</p>
          </div>
        ) : (
          <div className="orders-layout">
            {/* Danh sách đơn */}
            <div className="orders-list">
              {filteredOrders.map(order => {
                const status = STATUS_MAP[order.status] || {};
                return (
                  <div
                    className={`order-card ${selectedOrder === order.id ? 'selected' : ''}`}
                    key={order.id}
                    onClick={() => viewDetail(order.id)}
                  >
                    <div className="order-card-header">
                      <span className="order-code">{order.order_code}</span>
                      <span className="order-status" style={{ color: status.color, borderColor: `${status.color}40`, background: `${status.color}10` }}>
                        {status.label}
                      </span>
                    </div>
                    <div className="order-card-body">
                      <div className="order-date">{formatDate(order.created_at)}</div>
                      <div className="order-total">{formatPrice(order.total_amount)}₫</div>
                    </div>
                    <div className="order-card-footer">
                      <span className="order-method">
                        {order.payment_method === 'cod' ? '🚚 COD' : order.payment_method === 'bank_transfer' ? '🏦 Chuyển khoản' : '📱 Ví điện tử'}
                      </span>
                      {order.status === 'pending' && (
                        <button className="order-cancel-btn" onClick={(e) => { e.stopPropagation(); handleCancelClick(order.id, order.order_code); }}>
                          Hủy đơn
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chi tiết đơn hàng */}
            {orderDetail && (
              <div className="order-detail">
                <h3 className="detail-title">Chi tiết đơn #{orderDetail.order.order_code}</h3>

                {/* Thanh trạng thái */}
                {orderDetail.order.status !== 'cancelled' && orderDetail.order.status !== 'returned' && (
                  <div className="status-tracker">
                    {['Chờ xác nhận', 'Đã xác nhận', 'Đang xử lý', 'Đang giao', 'Đã giao'].map((step, i) => {
                      const currentStep = STATUS_MAP[orderDetail.order.status]?.step || 0;
                      const isActive = i + 1 <= currentStep;
                      const isCurrent = i + 1 === currentStep;
                      return (
                        <div className={`status-step ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`} key={i}>
                          <div className="step-dot">{isActive ? '✓' : i + 1}</div>
                          <div className="step-label">{step}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Thông tin giao hàng */}
                <div className="detail-section">
                  <h4>Thông tin giao hàng</h4>
                  <p>{orderDetail.order.receiver_name} — {orderDetail.order.receiver_phone}</p>
                  <p className="text-muted">{orderDetail.order.shipping_address}</p>
                  {orderDetail.order.note && <p className="order-note">Ghi chú: {orderDetail.order.note}</p>}
                </div>

                {/* Danh sách sản phẩm */}
                <div className="detail-section">
                  <h4>Sản phẩm đã đặt</h4>
                  {orderDetail.items.map((item, i) => (
                    <div className="detail-item" key={i}>
                      <div className="detail-item-info">
                        <span className="detail-item-name">{item.product_name}</span>
                        {item.size && <span className="detail-item-size">Size: {item.size}</span>}
                      </div>
                      <div className="detail-item-right">
                        <span>{formatPrice(item.price)}₫ x {item.quantity}</span>
                        <span className="detail-item-total">{formatPrice(item.total)}₫</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tổng tiền */}
                <div className="detail-section detail-totals">
                  <div className="detail-total-row">
                    <span>Tạm tính</span><span>{formatPrice(orderDetail.order.subtotal)}₫</span>
                  </div>
                  {orderDetail.order.discount_amount > 0 && (
                    <div className="detail-total-row discount">
                      <span>Giảm giá</span><span>-{formatPrice(orderDetail.order.discount_amount)}₫</span>
                    </div>
                  )}
                  <div className="detail-total-row">
                    <span>Phí vận chuyển</span>
                    <span>{orderDetail.order.shipping_fee > 0 ? `${formatPrice(orderDetail.order.shipping_fee)}₫` : 'Miễn phí'}</span>
                  </div>
                  <div className="detail-total-row final">
                    <span>Tổng thanh toán</span>
                    <span>{formatPrice(orderDetail.order.total_amount)}₫</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={cancelModal.open}
        title="Hủy đơn hàng"
        message={`Bạn có chắc muốn hủy đơn hàng ${cancelModal.orderCode}? Thao tác này không thể hoàn tác.`}
        confirmText="Hủy đơn"
        cancelText="Giữ lại"
        type="danger"
        onConfirm={handleCancelConfirm}
        onCancel={() => setCancelModal({ open: false, orderId: null, orderCode: '' })}
      />
    </>
  );
}

export default OrdersPage;
