// ============================================
// Thanh điều hướng (cập nhật: hiển thị theo trạng thái đăng nhập)
// File: frontend/src/components/Navbar.js
// ============================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      logout();
      setDropdownOpen(false);
      navigate('/');
    }
  };

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
          <li><Link to="/">Trang chủ</Link></li>
          <li><Link to="/products">Sản phẩm</Link></li>
          <li><Link to="/about">Về chúng tôi</Link></li>
          <li><Link to="/blog">Blog</Link></li>
          <li><Link to="/contact">Liên hệ</Link></li>
          {isAdmin && <li><Link to="/admin" style={{ color: 'var(--gold)' }}>Admin</Link></li>}
        </ul>

        {/* Icons */}
        <div className="navbar-icons">
          <button title="Tìm kiếm">🔍</button>

          {isLoggedIn ? (
            <>
              <Link to="/wishlist"><button title="Yêu thích">♡</button></Link>
              <Link to="/cart">
                <button title="Giỏ hàng">
                  🛒<span className="cart-badge">0</span>
                </button>
              </Link>

              {/* User dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  title="Tài khoản"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ color: 'var(--gold)' }}
                >
                  👤
                </button>

                {dropdownOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <div className="dropdown-name">{user?.fullname}</div>
                      <div className="dropdown-email">{user?.email}</div>
                      <div className="dropdown-role">
                        {isAdmin ? '🔑 Quản trị viên' : '👤 Khách hàng'}
                      </div>
                    </div>
                    <div className="dropdown-divider" />
                    <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      Thông tin cá nhân
                    </Link>
                    <Link to="/orders" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      Đơn hàng của tôi
                    </Link>
                    <Link to="/wishlist" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      Sản phẩm yêu thích
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="dropdown-item dropdown-admin" onClick={() => setDropdownOpen(false)}>
                        Trang quản trị
                      </Link>
                    )}
                    <div className="dropdown-divider" />
                    <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/login">
              <button title="Đăng nhập" className="login-btn">Đăng nhập</button>
            </Link>
          )}

          <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
