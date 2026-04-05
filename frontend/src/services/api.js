// ============================================
// Kết nối React với Backend API
// File: frontend/src/services/api.js
// ============================================

const API_URL = 'http://localhost:5000/api';

// Hàm gọi API chung
async function fetchAPI(endpoint, options = {}) {
  // Tự động thêm token vào header nếu đã đăng nhập
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  // Nếu token hết hạn → tự động đăng xuất
  if (response.status === 403 && data.message === 'Token không hợp lệ hoặc đã hết hạn') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return;
  }

  if (!response.ok) {
    throw new Error(data.message || 'Có lỗi xảy ra');
  }

  return data;
}

// ===== AUTH API =====
export const authAPI = {
  register: (data) => fetchAPI('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  login: (data) => fetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// ===== PRODUCTS API =====
export const productAPI = {
  getAll: (params = '') => fetchAPI(`/products?${params}`),
  getById: (id) => fetchAPI(`/products/${id}`),
};

// ===== CATEGORIES API =====
export const categoryAPI = {
  getAll: () => fetchAPI('/categories'),
};

// ===== CART API =====
export const cartAPI = {
  get: () => fetchAPI('/cart'),
  add: (data) => fetchAPI('/cart/add', { method: 'POST', body: JSON.stringify(data) }),
  update: (itemId, quantity) => fetchAPI(`/cart/${itemId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  remove: (itemId) => fetchAPI(`/cart/${itemId}`, { method: 'DELETE' }),
};

// ===== ORDERS API =====
export const orderAPI = {
  create: (data) => fetchAPI('/orders', { method: 'POST', body: JSON.stringify(data) }),
  getAll: () => fetchAPI('/orders'),
  getById: (id) => fetchAPI(`/orders/${id}`),
  cancel: (id) => fetchAPI(`/orders/${id}/cancel`, { method: 'PUT' }),
};

// ===== USER API =====
export const userAPI = {
  getProfile: () => fetchAPI('/users/profile'),
  updateProfile: (data) => fetchAPI('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data) => fetchAPI('/users/change-password', { method: 'PUT', body: JSON.stringify(data) }),
  getAddresses: () => fetchAPI('/users/addresses'),
  addAddress: (data) => fetchAPI('/users/addresses', { method: 'POST', body: JSON.stringify(data) }),
  deleteAddress: (id) => fetchAPI(`/users/addresses/${id}`, { method: 'DELETE' }),
};

// ===== ADMIN API =====
export const adminAPI = {
  getDashboard: () => fetchAPI('/admin/dashboard'),
  getOrders: (status = '') => fetchAPI(`/admin/orders${status ? '?status=' + status : ''}`),
  confirmOrder: (id) => fetchAPI(`/admin/orders/${id}/confirm`, { method: 'PUT' }),
  updateOrderStatus: (id, status) => fetchAPI(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getCustomers: () => fetchAPI('/admin/customers'),
  toggleCustomer: (id) => fetchAPI(`/admin/customers/${id}/toggle`, { method: 'PUT' }),
};

export default fetchAPI;
