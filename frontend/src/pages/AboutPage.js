// ============================================
// Trang Về chúng tôi
// File: frontend/src/pages/AboutPage.js
// ============================================

import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/Extra.css';

function AboutPage() {
  return (
    <div className="about-page-full">
      {/* Hero */}
      <div className="about-hero">
        <div className="about-hero-bg" />
        <div className="about-hero-content">
          <p className="about-hero-label">VỀ CHÚNG TÔI</p>
          <h1>Câu chuyện UNCUT GEMS</h1>
          <p className="about-hero-desc">Nơi nghệ thuật chế tác gặp gỡ vẻ đẹp vĩnh cửu của đá quý</p>
        </div>
      </div>

      {/* Brand Story */}
      <section className="about-section-full">
        <div className="about-section-inner">
          <div className="about-image-box">
            <div className="about-image-placeholder">
              <div className="about-ug-logo">UG</div>
              <div className="about-ug-text">EST. 2025</div>
            </div>
          </div>
          <div className="about-text-box">
            <p className="section-label" style={{ color: '#C9A84C', fontSize: 11, letterSpacing: 6, textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}>CÂU CHUYỆN THƯƠNG HIỆU</p>
            <h2 className="about-heading">Từ đam mê đến nghệ thuật</h2>
            <p className="about-paragraph">
              UNCUT GEMS ra đời từ niềm đam mê sâu sắc với cái đẹp nguyên bản của đá quý và kim loại quý.
              Chúng tôi tin rằng mỗi viên đá, trước khi được mài giũa, đều ẩn chứa một vẻ đẹp riêng biệt —
              giống như mỗi con người đều mang trong mình một giá trị độc nhất.
            </p>
            <p className="about-paragraph">
              Với đội ngũ nghệ nhân lành nghề và công nghệ chế tác hiện đại, UNCUT GEMS cam kết mang đến
              những sản phẩm trang sức cao cấp, kết hợp hoàn hảo giữa truyền thống thủ công và xu hướng
              thiết kế đương đại.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about-values">
        <div className="about-values-inner">
          <div className="about-values-header">
            <p className="section-label" style={{ color: '#C9A84C', fontSize: 11, letterSpacing: 6, textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}>GIÁ TRỊ CỐT LÕI</p>
            <h2 className="about-heading" style={{ textAlign: 'center' }}>Những gì chúng tôi tin tưởng</h2>
            <div style={{ width: 60, height: 1, background: '#C9A84C', margin: '16px auto 0' }} />
          </div>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">💎</div>
              <h3>Chất lượng tuyệt đối</h3>
              <p>Mỗi sản phẩm đều được chế tác từ nguyên liệu cao cấp nhất, trải qua quy trình kiểm định nghiêm ngặt với chứng nhận quốc tế GIA.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🎨</div>
              <h3>Thiết kế độc bản</h3>
              <p>Đội ngũ thiết kế của chúng tôi không ngừng sáng tạo, mang đến những mẫu trang sức vừa mang tính nghệ thuật vừa phù hợp xu hướng hiện đại.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🌿</div>
              <h3>Phát triển bền vững</h3>
              <p>Cam kết sử dụng nguồn nguyên liệu có trách nhiệm, ưu tiên vàng tái chế và kim cương được khai thác theo tiêu chuẩn đạo đức quốc tế.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3>Tận tâm phục vụ</h3>
              <p>Khách hàng là trung tâm của mọi hoạt động. Chúng tôi cam kết mang đến trải nghiệm mua sắm sang trọng, minh bạch và đáng tin cậy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="about-stats-section">
        <div className="about-stats-inner">
          <div className="about-stat-item">
            <div className="about-stat-number">500+</div>
            <div className="about-stat-label">Sản phẩm cao cấp</div>
          </div>
          <div className="about-stat-divider" />
          <div className="about-stat-item">
            <div className="about-stat-number">10,000+</div>
            <div className="about-stat-label">Khách hàng tin tưởng</div>
          </div>
          <div className="about-stat-divider" />
          <div className="about-stat-item">
            <div className="about-stat-number">100%</div>
            <div className="about-stat-label">Chính hãng kiểm định</div>
          </div>
          <div className="about-stat-divider" />
          <div className="about-stat-item">
            <div className="about-stat-number">12</div>
            <div className="about-stat-label">Tháng bảo hành</div>
          </div>
        </div>
      </section>

      {/* Commitments */}
      <section className="about-section-full" style={{ background: '#080808', borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a' }}>
        <div className="about-section-inner" style={{ flexDirection: 'row-reverse' }}>
          <div className="about-image-box">
            <div className="about-image-placeholder" style={{ background: 'linear-gradient(135deg, #10151a, #0a0a0a)' }}>
              <div style={{ fontSize: 48, opacity: 0.4 }}>🛡️</div>
              <div className="about-ug-text">COMMITMENT</div>
            </div>
          </div>
          <div className="about-text-box">
            <p className="section-label" style={{ color: '#C9A84C', fontSize: 11, letterSpacing: 6, textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}>CAM KẾT CỦA CHÚNG TÔI</p>
            <h2 className="about-heading">Chính sách đặc quyền</h2>
            <div className="commitment-list">
              <div className="commitment-item">
                <span className="commitment-icon">🚚</span>
                <div>
                  <strong>Miễn phí giao hàng</strong>
                  <p>Miễn phí vận chuyển cho tất cả đơn hàng từ 5.000.000₫ trên toàn quốc</p>
                </div>
              </div>
              <div className="commitment-item">
                <span className="commitment-icon">🔄</span>
                <div>
                  <strong>Đổi trả dễ dàng</strong>
                  <p>Đổi trả miễn phí trong vòng 7 ngày nếu sản phẩm không đúng mô tả</p>
                </div>
              </div>
              <div className="commitment-item">
                <span className="commitment-icon">📜</span>
                <div>
                  <strong>Giấy kiểm định GIA</strong>
                  <p>Tất cả kim cương và đá quý đều đi kèm giấy chứng nhận kiểm định quốc tế</p>
                </div>
              </div>
              <div className="commitment-item">
                <span className="commitment-icon">🔒</span>
                <div>
                  <strong>Bảo mật thanh toán</strong>
                  <p>Hệ thống thanh toán được mã hóa SSL, bảo vệ tuyệt đối thông tin khách hàng</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <h2>Khám phá bộ sưu tập</h2>
        <p>Hãy để UNCUT GEMS đồng hành cùng bạn trong những khoảnh khắc đáng nhớ</p>
        <Link to="/products" className="about-cta-btn">Xem sản phẩm →</Link>
      </section>
    </div>
  );
}

export default AboutPage;
