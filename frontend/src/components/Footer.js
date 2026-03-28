import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Brand */}
        <div>
          <div className="navbar-logo" style={{ fontSize: 20, marginBottom: 16 }}>
            UNCUT GEMS
          </div>
          <p style={{ color: '#666', fontSize: 13, fontFamily: 'var(--font-body)', lineHeight: 1.7 }}>
            Trang sức cao cấp<br />
            Vẻ đẹp vĩnh cửu
          </p>
        </div>

        {/* Products */}
        <div>
          <div className="footer-title">Sản phẩm</div>
          <Link to="/products?category=nhan">Nhẫn</Link>
          <Link to="/products?category=day-chuyen">Dây chuyền</Link>
          <Link to="/products?category=vong-tay">Vòng tay</Link>
          <Link to="/products?category=khuyen-tai">Khuyên tai</Link>
          <Link to="/products?category=bo-trang-suc">Bộ trang sức</Link>
        </div>

        {/* Support */}
        <div>
          <div className="footer-title">Hỗ trợ</div>
          <Link to="/guide">Hướng dẫn mua hàng</Link>
          <Link to="/return-policy">Chính sách đổi trả</Link>
          <Link to="/warranty">Chính sách bảo hành</Link>
          <Link to="/faq">Câu hỏi thường gặp</Link>
          <Link to="/contact">Liên hệ</Link>
        </div>

        {/* Contact */}
        <div>
          <div className="footer-title">Liên hệ</div>
          <a href="#">📍 123 Đường ABC, Hà Nội</a>
          <a href="tel:0123456789">📞 0123-456-789</a>
          <a href="mailto:info@uncutgems.vn">✉️ info@uncutgems.vn</a>
          <a href="#">🕐 8:00 - 21:00 (T2 - CN)</a>
        </div>
      </div>

      <div className="footer-bottom">
        © 2025 UNCUT GEMS. All rights reserved. | Thiết kế bởi Trương Anh Quân - K22CNT3
      </div>
    </footer>
  );
}

export default Footer;
