// ============================================
// Thanh điều hướng - CẬP NHẬT: ConfirmModal thay window.confirm
// File: frontend/src/components/Navbar.js — GHI ĐÈ
// ============================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import ConfirmModal from './ConfirmModal';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(false);
    if (dropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [dropdownOpen]);

  const handleLogoutClick = () => {
    setDropdownOpen(false);
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutModal(false);
    toast.success('Đăng xuất thành công!');
    navigate('/');
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo">
            UNCUT GEMS
            <span>Fine Jewelry Since 2025</span>
          </Link>

          <ul className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
            <li><Link to="/">Trang chủ</Link></li>
            <li><Link to="/products">Sản phẩm</Link></li>
            <li><Link to="/about">Về chúng tôi</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/contact">Liên hệ</Link></li>
            {isAdmin && <li><Link to="/admin" style={{ color: 'var(--gold)' }}>Admin</Link></li>}
          </ul>

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

                <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
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
                      <button className="dropdown-item dropdown-logout" onClick={handleLogoutClick}>
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

      {/* Modal xác nhận đăng xuất */}
      <ConfirmModal
        isOpen={showLogoutModal}
        title="Đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?"
        confirmText="Đăng xuất"
        cancelText="Ở lại"
        type="warning"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
}

export default Navbar;
