// ============================================
// Trang Thanh toán (Checkout)
// File: frontend/src/pages/CheckoutPage.js
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI, orderAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import '../assets/css/Cart.css';

function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [couponCode, setCouponCode] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    receiverName: '', phone: '', province: '', district: '', ward: '', addressDetail: '', isDefault: false
  });

  const { isLoggedIn, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return; }
    fetchData();
  }, [isLoggedIn]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cartData, addressData] = await Promise.all([
        cartAPI.get(),
        userAPI.getAddresses()
      ]);
      setCartItems(cartData.items);
      setCartTotal(cartData.total);
      setAddresses(addressData);

      if (cartData.items.length === 0) {
        toast.warning('Giỏ hàng trống, vui lòng thêm sản phẩm');
        navigate('/products');
        return;
      }

      const defaultAddr = addressData.find(a => a.is_default === 1);
      if (defaultAddr) setSelectedAddress(defaultAddr.id);
      else if (addressData.length > 0) setSelectedAddress(addressData[0].id);
    } catch (error) {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.receiverName || !newAddress.phone || !newAddress.province || !newAddress.addressDetail) {
      toast.error('Vui lòng điền đầy đủ thông tin địa chỉ');
      return;
    }
    try {
      await userAPI.addAddress(newAddress);
      toast.success('Thêm địa chỉ thành công!');
      setShowAddAddress(false);
      setNewAddress({ receiverName: '', phone: '', province: '', district: '', ward: '', addressDetail: '', isDefault: false });
      const updatedAddresses = await userAPI.getAddresses();
      setAddresses(updatedAddresses);
      setSelectedAddress(updatedAddresses[updatedAddresses.length - 1].id);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSubmitOrder = async () => {
    if (!selectedAddress) {
      toast.error('Vui lòng chọn địa chỉ giao hàng');
      return;
    }

    const addr = addresses.find(a => a.id === selectedAddress);
    const fullAddress = `${addr.receiver_name}, ${addr.phone}, ${addr.address_detail}, ${addr.ward || ''} ${addr.district}, ${addr.province}`;

    setSubmitting(true);
    try {
      const result = await orderAPI.create({
        receiverName: addr.receiver_name,
        receiverPhone: addr.phone,
        shippingAddress: fullAddress,
        paymentMethod,
        couponCode: couponCode || undefined,
        note: note || undefined,
      });

      toast.success(`Đặt hàng thành công! Mã đơn: ${result.orderCode}`);
      navigate(`/orders`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => Number(price).toLocaleString('vi-VN');
  const shippingFee = cartTotal >= 5000000 ? 0 : 30000;
  const finalTotal = cartTotal + shippingFee;

  if (loading) return <div className="cart-loading">Đang tải trang thanh toán...</div>;

  return (
    <div className="checkout-page">
      <div className="cart-header">
        <h1>Thanh toán</h1>
        <p>Hoàn tất đơn hàng của bạn</p>
      </div>

      <div className="checkout-layout">
        {/* Bên trái: Form */}
        <div className="checkout-form">
          {/* Địa chỉ giao hàng */}
          <div className="checkout-section">
            <h3 className="checkout-section-title">📍 Địa chỉ giao hàng</h3>

            {addresses.length === 0 && !showAddAddress ? (
              <div className="no-address">
                <p>Bạn chưa có địa chỉ giao hàng nào</p>
                <button className="add-address-btn" onClick={() => setShowAddAddress(true)}>
                  + Thêm địa chỉ mới
                </button>
              </div>
            ) : (
              <>
                <div className="address-list">
                  {addresses.map(addr => (
                    <label className={`address-card ${selectedAddress === addr.id ? 'selected' : ''}`} key={addr.id}>
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddress === addr.id}
                        onChange={() => setSelectedAddress(addr.id)}
                      />
                      <div className="address-content">
                        <div className="address-name">
                          {addr.receiver_name} — {addr.phone}
                          {addr.is_default === 1 && <span className="default-tag">Mặc định</span>}
                        </div>
                        <div className="address-detail">
                          {addr.address_detail}, {addr.ward} {addr.district}, {addr.province}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                <button className="add-address-link" onClick={() => setShowAddAddress(!showAddAddress)}>
                  {showAddAddress ? '− Đóng' : '+ Thêm địa chỉ mới'}
                </button>
              </>
            )}

            {showAddAddress && (
              <div className="new-address-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Tên người nhận *</label>
                    <input className="form-input" placeholder="Nhập tên" value={newAddress.receiverName}
                      onChange={e => setNewAddress({...newAddress, receiverName: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại *</label>
                    <input className="form-input" placeholder="Nhập SĐT" value={newAddress.phone}
                      onChange={e => setNewAddress({...newAddress, phone: e.target.value})} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Tỉnh/Thành phố *</label>
                    <input className="form-input" placeholder="VD: Hà Nội" value={newAddress.province}
                      onChange={e => setNewAddress({...newAddress, province: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Quận/Huyện</label>
                    <input className="form-input" placeholder="VD: Cầu Giấy" value={newAddress.district}
                      onChange={e => setNewAddress({...newAddress, district: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Địa chỉ chi tiết *</label>
                  <input className="form-input" placeholder="Số nhà, tên đường..." value={newAddress.addressDetail}
                    onChange={e => setNewAddress({...newAddress, addressDetail: e.target.value})} />
                </div>
                <button className="save-address-btn" onClick={handleAddAddress}>Lưu địa chỉ</button>
              </div>
            )}
          </div>

          {/* Phương thức thanh toán */}
          <div className="checkout-section">
            <h3 className="checkout-section-title">💳 Phương thức thanh toán</h3>
            <div className="payment-options">
              <label className={`payment-card ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={e => setPaymentMethod(e.target.value)} />
                <div className="payment-info">
                  <div className="payment-name">🚚 Thanh toán khi nhận hàng (COD)</div>
                  <div className="payment-desc">Thanh toán bằng tiền mặt khi nhận được hàng</div>
                </div>
              </label>
              <label className={`payment-card ${paymentMethod === 'bank_transfer' ? 'selected' : ''}`}>
                <input type="radio" name="payment" value="bank_transfer" checked={paymentMethod === 'bank_transfer'} onChange={e => setPaymentMethod(e.target.value)} />
                <div className="payment-info">
                  <div className="payment-name">🏦 Chuyển khoản ngân hàng</div>
                  <div className="payment-desc">Chuyển khoản qua tài khoản ngân hàng của cửa hàng</div>
                </div>
              </label>
              <label className={`payment-card ${paymentMethod === 'e_wallet' ? 'selected' : ''}`}>
                <input type="radio" name="payment" value="e_wallet" checked={paymentMethod === 'e_wallet'} onChange={e => setPaymentMethod(e.target.value)} />
                <div className="payment-info">
                  <div className="payment-name">📱 Ví điện tử (MoMo / ZaloPay)</div>
                  <div className="payment-desc">Thanh toán nhanh chóng qua ví điện tử</div>
                </div>
              </label>
            </div>
          </div>

          {/* Ghi chú */}
          <div className="checkout-section">
            <h3 className="checkout-section-title">📝 Ghi chú đơn hàng</h3>
            <textarea className="checkout-note" placeholder="Ghi chú thêm cho đơn hàng (không bắt buộc)..."
              value={note} onChange={e => setNote(e.target.value)} rows={3} />
          </div>
        </div>

        {/* Bên phải: Tổng kết */}
        <div className="checkout-summary">
          <h3 className="summary-title">Đơn hàng của bạn</h3>

          <div className="checkout-items">
            {cartItems.map(item => (
              <div className="checkout-item" key={item.id}>
                <div className="checkout-item-info">
                  <span className="checkout-item-name">{item.name}</span>
                  {item.size && <span className="checkout-item-size">Size: {item.size}</span>}
                  <span className="checkout-item-qty">x{item.quantity}</span>
                </div>
                <span className="checkout-item-price">{formatPrice(item.subtotal)}₫</span>
              </div>
            ))}
          </div>

          {/* Mã giảm giá */}
          <div className="coupon-box">
            <input className="coupon-input" placeholder="Nhập mã giảm giá" value={couponCode} onChange={e => setCouponCode(e.target.value)} />
            <button className="coupon-apply" onClick={() => toast.info('Mã giảm giá sẽ được kiểm tra khi đặt hàng')}>Áp dụng</button>
          </div>

          <div className="summary-divider" />

          <div className="summary-row">
            <span>Tạm tính</span>
            <span>{formatPrice(cartTotal)}₫</span>
          </div>
          <div className="summary-row">
            <span>Phí vận chuyển</span>
            <span>{shippingFee === 0 ? <span className="free-ship">Miễn phí</span> : `${formatPrice(shippingFee)}₫`}</span>
          </div>

          <div className="summary-divider" />

          <div className="summary-row summary-total">
            <span>Tổng thanh toán</span>
            <span className="total-price">{formatPrice(finalTotal)}₫</span>
          </div>

          <button className="place-order-btn" onClick={handleSubmitOrder} disabled={submitting}>
            {submitting ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
          </button>

          <div className="checkout-policies">
            <p>🔒 Thông tin thanh toán được bảo mật tuyệt đối</p>
            <p>🔄 Đổi trả miễn phí trong 7 ngày</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
