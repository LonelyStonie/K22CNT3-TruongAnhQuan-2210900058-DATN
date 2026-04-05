// ============================================
// Trang Chi tiết sản phẩm
// File: frontend/src/pages/ProductDetailPage.js
// ============================================

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productAPI, cartAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../assets/css/Products.css';

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const data = await productAPI.getById(id);
      setProduct(data.product);
      setImages(data.images);
      setReviews(data.reviews);
      setAverageRating(data.averageRating);

      // Tự chọn size đầu tiên nếu có
      if (data.product.size) {
        const sizes = data.product.size.split('-');
        setSelectedSize(sizes[0].trim());
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      if (window.confirm('Bạn cần đăng nhập để thêm vào giỏ hàng. Đăng nhập ngay?')) {
        navigate('/login');
      }
      return;
    }

    setAddingToCart(true);
    try {
      await cartAPI.add({
        productId: product.id,
        quantity,
        size: selectedSize || null,
      });
      alert('Đã thêm vào giỏ hàng!');
    } catch (error) {
      alert(error.message);
    } finally {
      setAddingToCart(false);
    }
  };

  const formatPrice = (price) => Number(price).toLocaleString('vi-VN');

  const renderStars = (rating) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  if (loading) return <div className="detail-loading">Đang tải sản phẩm...</div>;
  if (!product) return <div className="detail-loading">Không tìm thấy sản phẩm</div>;

  const sizes = product.size ? product.size.split('-').map(s => s.trim()) : [];
  const discount = product.original_price && product.original_price > product.price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

  return (
    <div className="detail-page">
      {/* Breadcrumb */}
      <div className="detail-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span> / </span>
        <Link to="/products">Sản phẩm</Link>
        <span> / </span>
        {product.category_name && (
          <>
            <Link to={`/products?category=${product.category_name}`}>{product.category_name}</Link>
            <span> / </span>
          </>
        )}
        <span className="current">{product.name}</span>
      </div>

      <div className="detail-main">
        {/* Bên trái: Hình ảnh */}
        <div className="detail-gallery">
          <div className="gallery-main">
            <div className="gallery-placeholder">
              <div className="gallery-diamond" />
              {discount > 0 && <div className="gallery-sale">-{discount}%</div>}
            </div>
          </div>
          {images.length > 0 && (
            <div className="gallery-thumbs">
              {images.map((img, i) => (
                <div key={i} className={`gallery-thumb ${i === 0 ? 'active' : ''}`}>
                  <div className="thumb-placeholder" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bên phải: Thông tin */}
        <div className="detail-info">
          <div className="detail-badges">
            {product.is_featured === 1 && <span className="badge-featured">Nổi bật</span>}
            {product.is_new === 1 && <span className="badge-new">Mới</span>}
          </div>

          <h1 className="detail-name">{product.name}</h1>

          <div className="detail-meta">
            <span className="detail-sku">SKU: {product.sku}</span>
            {reviews.length > 0 && (
              <span className="detail-rating">
                <span className="stars">{renderStars(averageRating)}</span>
                <span className="rating-text">{averageRating} ({reviews.length} đánh giá)</span>
              </span>
            )}
          </div>

          <div className="detail-price-box">
            <span className="detail-price">{formatPrice(product.price)}₫</span>
            {product.original_price && product.original_price > product.price && (
              <>
                <span className="detail-original">{formatPrice(product.original_price)}₫</span>
                <span className="detail-discount">-{discount}%</span>
              </>
            )}
          </div>

          <div className="detail-short-desc">
            {product.short_description || product.description}
          </div>

          {/* Thông số */}
          <div className="detail-specs">
            {product.material_name && (
              <div className="spec-item">
                <span className="spec-label">Chất liệu</span>
                <span className="spec-value">{product.material_name}</span>
              </div>
            )}
            {product.stone_name && product.stone_name !== 'Không có đá' && (
              <div className="spec-item">
                <span className="spec-label">Loại đá</span>
                <span className="spec-value">{product.stone_name}</span>
              </div>
            )}
            {product.weight && (
              <div className="spec-item">
                <span className="spec-label">Trọng lượng</span>
                <span className="spec-value">{product.weight}g</span>
              </div>
            )}
            {product.certification && (
              <div className="spec-item">
                <span className="spec-label">Kiểm định</span>
                <span className="spec-value">{product.certification}</span>
              </div>
            )}
          </div>

          {/* Chọn size */}
          {sizes.length > 0 && (
            <div className="detail-sizes">
              <span className="spec-label">Kích thước</span>
              <div className="size-options">
                {sizes.map(size => (
                  <button
                    key={size}
                    className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Số lượng + Thêm giỏ */}
          <div className="detail-actions">
            <div className="quantity-box">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}>+</button>
            </div>

            {product.stock_quantity > 0 ? (
              <button className="add-to-cart-btn" onClick={handleAddToCart} disabled={addingToCart}>
                {addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
              </button>
            ) : (
              <button className="out-of-stock-btn" disabled>Hết hàng</button>
            )}
          </div>

          <div className="detail-stock">
            {product.stock_quantity > 0
              ? `Còn ${product.stock_quantity} sản phẩm trong kho`
              : 'Sản phẩm tạm hết hàng'}
          </div>

          {/* Chính sách */}
          <div className="detail-policies">
            <div className="policy-item">🚚 Miễn phí giao hàng cho đơn từ 5.000.000₫</div>
            <div className="policy-item">🔄 Đổi trả miễn phí trong 7 ngày</div>
            <div className="policy-item">🛡️ Bảo hành 12 tháng</div>
            <div className="policy-item">📜 Có giấy kiểm định chất lượng</div>
          </div>
        </div>
      </div>

      {/* Tabs: Mô tả + Đánh giá */}
      <div className="detail-tabs">
        <div className="tab-buttons">
          <button className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`} onClick={() => setActiveTab('description')}>
            Mô tả sản phẩm
          </button>
          <button className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
            Đánh giá ({reviews.length})
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'description' && (
            <div className="tab-description">
              <p>{product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}</p>
            </div>
          )}
          {activeTab === 'reviews' && (
            <div className="tab-reviews">
              {reviews.length === 0 ? (
                <p className="no-reviews">Chưa có đánh giá nào cho sản phẩm này.</p>
              ) : (
                reviews.map((review, i) => (
                  <div key={i} className="review-item">
                    <div className="review-header">
                      <span className="review-author">{review.fullname}</span>
                      <span className="review-stars">{renderStars(review.rating)}</span>
                      <span className="review-date">{new Date(review.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
