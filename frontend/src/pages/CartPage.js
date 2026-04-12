// ============================================
// Trang Giỏ hàng
// File: frontend/src/pages/CartPage.js
// ============================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import '../assets/css/Cart.css';

function CartPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, itemId: null, itemName: '' });

  const { isLoggedIn } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [isLoggedIn]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const data = await cartAPI.get();
      setItems(data.items);
      setTotal(data.total);
    } catch (error) {
      toast.error('Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQty = async (itemId, newQty) => {
    if (newQty < 1) return;
    try {
      await cartAPI.update(itemId, newQty);
      fetchCart();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRemoveClick = (itemId, itemName) => {
    setDeleteModal({ open: true, itemId, itemName });
  };

  const handleRemoveConfirm = async () => {
    try {
      await cartAPI.remove(deleteModal.itemId);
      toast.success(`Đã xóa "${deleteModal.itemName}" khỏi giỏ hàng`);
      setDeleteModal({ open: false, itemId: null, itemName: '' });
      fetchCart();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const formatPrice = (price) => Number(price).toLocaleString('vi-VN');

  if (loading) return <div className="cart-loading">Đang tải giỏ hàng...</div>;

  return (
    <>
      <div className="cart-page">
        <div className="cart-header">
          <h1>Giỏ hàng của bạn</h1>
          <p>{items.length} sản phẩm</p>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h3>Giỏ hàng trống</h3>
            <p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <Link to="/products" className="cart-shop-btn">Tiếp tục mua sắm</Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Danh sách sản phẩm */}
            <div className="cart-items">
              <div className="cart-table-header">
                <span className="col-product">Sản phẩm</span>
                <span className="col-price">Đơn giá</span>
                <span className="col-qty">Số lượng</span>
                <span className="col-total">Thành tiền</span>
                <span className="col-action"></span>
              </div>

              {items.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className="col-product">
                  <div className="cart-item-image">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div className="cart-item-placeholder" />
                    )}
                  </div>
                    <div className="cart-item-info">
                      <Link to={`/products/${item.product_id}`} className="cart-item-name">
                        {item.name}
                      </Link>
                      {item.size && <div className="cart-item-size">Size: {item.size}</div>}
                    </div>
                  </div>

                  <div className="col-price">
                    <span className="cart-price">{formatPrice(item.price)}₫</span>
                  </div>

                  <div className="col-qty">
                    <div className="cart-qty-box">
                      <button onClick={() => handleUpdateQty(item.id, item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleUpdateQty(item.id, item.quantity + 1)}>+</button>
                    </div>
                  </div>

                  <div className="col-total">
                    <span className="cart-subtotal">{formatPrice(item.subtotal)}₫</span>
                  </div>

                  <div className="col-action">
                    <button className="cart-remove-btn" onClick={() => handleRemoveClick(item.id, item.name)}>
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Tổng kết */}
            <div className="cart-summary">
              <h3 className="summary-title">Tổng kết đơn hàng</h3>

              <div className="summary-row">
                <span>Tạm tính ({items.length} sản phẩm)</span>
                <span>{formatPrice(total)}₫</span>
              </div>

              <div className="summary-row">
                <span>Phí vận chuyển</span>
                <span>{total >= 5000000 ? <span className="free-ship">Miễn phí</span> : '30.000₫'}</span>
              </div>

              {total < 5000000 && (
                <div className="summary-note">
                  Mua thêm {formatPrice(5000000 - total)}₫ để được miễn phí vận chuyển
                </div>
              )}

              <div className="summary-divider" />

              <div className="summary-row summary-total">
                <span>Tổng cộng</span>
                <span className="total-price">
                  {formatPrice(total >= 5000000 ? total : total + 30000)}₫
                </span>
              </div>

              <Link to="/checkout">
                <button className="checkout-btn">Tiến hành đặt hàng →</button>
              </Link>

              <Link to="/products" className="continue-shopping">
                ← Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModal.open}
        title="Xóa sản phẩm"
        message={`Bạn có chắc muốn xóa "${deleteModal.itemName}" khỏi giỏ hàng?`}
        confirmText="Xóa"
        cancelText="Giữ lại"
        type="danger"
        onConfirm={handleRemoveConfirm}
        onCancel={() => setDeleteModal({ open: false, itemId: null, itemName: '' })}
      />
    </>
  );
}

export default CartPage;
