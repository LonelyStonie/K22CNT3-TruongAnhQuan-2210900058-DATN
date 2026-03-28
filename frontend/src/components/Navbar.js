import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          UNCUT GEMS
          <span>Fine Jewelry Since 2025</span>
        </Link>

        {/* Menu */}
        <ul className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
          <li><Link to="/" className="active">Trang chủ</Link></li>
          <li><Link to="/products">Sản phẩm</Link></li>
          <li><Link to="/about">Về chúng tôi</Link></li>
          <li><Link to="/blog">Blog</Link></li>
          <li><Link to="/contact">Liên hệ</Link></li>
        </ul>

        {/* Icons */}
        <div className="navbar-icons">
          <button title="Tìm kiếm">🔍</button>
          <button title="Yêu thích">♡</button>
          <button title="Giỏ hàng">
            🛒
            <span className="cart-badge">0</span>
          </button>
          <Link to="/login"><button title="Tài khoản">👤</button></Link>
          <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
