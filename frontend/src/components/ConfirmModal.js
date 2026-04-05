// ============================================
// Confirm Modal Component (thay thế window.confirm)
// File: frontend/src/components/ConfirmModal.js
// ============================================

import React from 'react';
import '../assets/css/Toast.css';

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Xác nhận', cancelText = 'Hủy', type = 'warning' }) {
  if (!isOpen) return null;

  const icons = {
    warning: '⚠',
    danger: '✕',
    info: '?',
    success: '✓',
  };

  const colors = {
    warning: '#EF9F27',
    danger: '#E24B4A',
    info: '#C9A84C',
    success: '#1D9E75',
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon" style={{ borderColor: `${colors[type]}40`, color: colors[type], background: `${colors[type]}15` }}>
          {icons[type]}
        </div>
        <h3 className="modal-title">{title}</h3>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button className="modal-btn modal-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            className="modal-btn modal-confirm"
            style={{ background: colors[type] }}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
