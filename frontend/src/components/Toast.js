// ============================================
// Toast Notification Component
// File: frontend/src/components/Toast.js
// ============================================

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import '../assets/css/Toast.css';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);

    // Tự động xóa sau duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Các hàm tiện lợi
  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setClosing(true), toast.duration - 400);
    return () => clearTimeout(timer);
  }, [toast.duration]);

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };

  const titles = {
    success: 'Thành công',
    error: 'Lỗi',
    info: 'Thông báo',
    warning: 'Cảnh báo',
  };

  return (
    <div className={`toast-item toast-${toast.type} ${closing ? 'toast-closing' : ''}`}>
      <div className={`toast-icon toast-icon-${toast.type}`}>
        {icons[toast.type]}
      </div>
      <div className="toast-body">
        <div className="toast-title">{titles[toast.type]}</div>
        <div className="toast-message">{toast.message}</div>
      </div>
      <button className="toast-close" onClick={onClose}>✕</button>
      <div className="toast-progress">
        <div
          className={`toast-progress-bar toast-progress-${toast.type}`}
          style={{ animationDuration: `${toast.duration}ms` }}
        />
      </div>
    </div>
  );
}

// Hook để sử dụng toast ở bất kỳ component nào
export function useToast() {
  return useContext(ToastContext);
}

export default ToastContext;
