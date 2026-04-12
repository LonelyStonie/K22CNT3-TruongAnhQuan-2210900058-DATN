import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// ===== DỮ LIỆU MẪU (sau này sẽ lấy từ API) =====
const slides = [
  { title: 'Vẻ đẹp vĩnh cửu', subtitle: 'Bộ sưu tập Kim Cương 2025', desc: 'Khám phá những thiết kế độc bản, nơi nghệ thuật chế tác gặp gỡ ánh sáng vĩnh hằng', cta: 'Khám phá ngay' },
  { title: 'Tỏa sáng mọi khoảnh khắc', subtitle: 'Trang sức cao cấp UNCUT GEMS', desc: 'Mỗi viên đá quý kể một câu chuyện — hãy để câu chuyện ấy là của bạn', cta: 'Xem bộ sưu tập' },
  { title: 'Quà tặng ý nghĩa', subtitle: 'Bộ sưu tập quà tặng đặc biệt', desc: 'Dành tặng người thương những món quà mang giá trị vĩnh cửu', cta: 'Chọn quà ngay' },
];

const categories = [
  { name: 'Nhẫn', icon: '💍', count: 48, slug: 'nhan' },
  { name: 'Dây chuyền', icon: '📿', count: 35, slug: 'day-chuyen' },
  { name: 'Vòng tay', icon: '⭕', count: 28, slug: 'vong-tay' },
  { name: 'Khuyên tai', icon: '✨', count: 42, slug: 'khuyen-tai' },
  { name: 'Bộ trang sức', icon: '👑', count: 15, slug: 'bo-trang-suc' },
  { name: 'Mặt dây chuyền', icon: '🔶', count: 22, slug: 'mat-day-chuyen' },
];


const blogs = [
  { id: 1, title: 'Xu hướng trang sức 2025: Vàng hồng lên ngôi', date: '25/03/2025', views: 1240 },
  { id: 2, title: 'Cách phân biệt kim cương thật và kim cương nhân tạo', date: '20/03/2025', views: 3580 },
  { id: 3, title: '5 tiêu chí chọn nhẫn cưới hoàn hảo cho ngày trọng đại', date: '15/03/2025', views: 2150 },
];

function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);

useEffect(() => {
  fetch('http://localhost:5000/api/products?featured=1&limit=8')
    .then(res => res.json())
    .then(data => { if (data.products) setFeaturedProducts(data.products); })
    .catch(console.error);
}, []);

  // Tự động chuyển slide mỗi 5 giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      {/* ===== HERO BANNER ===== */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-decor" />
        <div className="hero-decor-inner" />
        <div className="hero-content">
          <p className="hero-label">{slides[currentSlide].subtitle}</p>
          <h1 className="hero-title">{slides[currentSlide].title}</h1>
          <p className="hero-desc">{slides[currentSlide].desc}</p>
          <Link to="/products">
            <button className="hero-cta">{slides[currentSlide].cta} →</button>
          </Link>
          <div className="hero-dots">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== DANH MỤC ===== */}
      <section className="section">
        <div className="section-title">
          <p className="section-label">Danh mục</p>
          <h2 className="section-h2">Khám phá theo phong cách</h2>
          <div className="section-divider" />
        </div>
        <div className="category-grid">
          {categories.map((cat) => (
            <Link to={`/products?category=${cat.slug}`} key={cat.slug}>
              <div className="category-card">
                <div className="category-icon">{cat.icon}</div>
                <div className="category-name">{cat.name}</div>
                <div className="category-count">{cat.count} sản phẩm</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== SẢN PHẨM NỔI BẬT ===== */}
      <section className="section">
        <div className="section-title">
          <p className="section-label">Bộ sưu tập</p>
          <h2 className="section-h2">Sản phẩm nổi bật</h2>
          <div className="section-divider" />
        </div>
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <Link to={`/products/${product.id}`} key={product.id}>
              <div className="product-card">
              <div className="product-image" style={{ background: `linear-gradient(135deg, #1a1a2e, #0d0d0d)` }}>
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div className="product-placeholder" />
                )}
                  {product.is_featured === 1 && <div className="product-badge featured">Nổi bật</div>}
                  {product.is_new === 1 && <div className="product-badge new">Mới</div>}
                </div>
                <div className="product-info">
                  <div className="product-stone">{product.stone_name || 'Trang sức'} • {product.material_name || 'Kim loại quý'}</div>
                  <div className="product-name">{product.name}</div>
                  <div>
                    <span className="product-price">{Number(product.price).toLocaleString('vi-VN')}₫</span>
                      {product.original_price && product.original_price > product.price && <span className="product-original">{Number(product.original_price).toLocaleString('vi-VN')}₫</span>}
                  </div>
                  <button className="product-btn" onClick={(e) => { e.preventDefault(); alert('Đã thêm vào giỏ hàng!'); }}>
                    Thêm vào giỏ hàng
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== VỀ CHÚNG TÔI ===== */}
      <section className="about-section">
        <div className="about-inner">
          <div className="about-image">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 64, color: 'rgba(201,168,76,0.3)', fontWeight: 300 }}>UG</div>
              <div style={{ color: 'var(--gold)', fontSize: 11, letterSpacing: 6, marginTop: 8, fontFamily: 'var(--font-body)' }}>SINCE 2025</div>
            </div>
          </div>
          <div className="about-text">
            <p className="section-label">Về chúng tôi</p>
            <h3>Câu chuyện UNCUT GEMS</h3>
            <p>
              UNCUT GEMS ra đời từ niềm đam mê với cái đẹp nguyên bản và nghệ thuật chế tác trang sức tinh xảo.
              Mỗi sản phẩm là sự kết hợp hoàn hảo giữa chất liệu kim loại quý và đá quý tự nhiên,
              được chế tác tỉ mỉ bởi những nghệ nhân lành nghề.
            </p>
            <p>
              Chúng tôi tin rằng trang sức không chỉ là phụ kiện — đó là câu chuyện cá nhân,
              là biểu tượng của những khoảnh khắc đáng nhớ trong cuộc đời.
            </p>
            <div className="about-stats">
              <div>
                <div className="stat-number">500+</div>
                <div className="stat-label">Sản phẩm</div>
              </div>
              <div>
                <div className="stat-number">10K+</div>
                <div className="stat-label">Khách hàng</div>
              </div>
              <div>
                <div className="stat-number">100%</div>
                <div className="stat-label">Chính hãng</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BLOG ===== */}
      <section className="section">
        <div className="section-title">
          <p className="section-label">Blog & Tin tức</p>
          <h2 className="section-h2">Xu hướng trang sức</h2>
          <div className="section-divider" />
        </div>
        <div className="blog-grid">
          {blogs.map((blog) => (
            <Link to={`/blog/${blog.id}`} key={blog.id}>
              <div className="blog-card">
                <div className="blog-thumb" />
                <div className="blog-info">
                  <div className="blog-date">{blog.date}</div>
                  <div className="blog-title">{blog.title}</div>
                  <div className="blog-views">{blog.views.toLocaleString()} lượt xem</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section className="newsletter">
        <p className="section-label">Đăng ký nhận tin</p>
        <h2 className="section-h2" style={{ marginTop: 8, marginBottom: 12 }}>Ưu đãi dành riêng cho bạn</h2>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: 14 }}>
          Nhận ngay mã giảm giá 10% cho đơn hàng đầu tiên
        </p>
        <div className="newsletter-form">
          <input className="newsletter-input" placeholder="Nhập email của bạn..." type="email" />
          <button className="newsletter-btn">Đăng ký</button>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
