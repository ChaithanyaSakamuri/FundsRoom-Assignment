import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// Auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexora_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Error interceptor
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('nexora_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

const get = <T>(url: string, params?: object) =>
  api.get<{ success: boolean; data: T }>(url, { params }).then((r) => r.data.data);

const post = <T>(url: string, data?: object) =>
  api.post<{ success: boolean; data: T; message?: string }>(url, data).then((r) => r.data);

const put = <T>(url: string, data?: object) =>
  api.put<{ success: boolean; data: T }>(url, data).then((r) => r.data.data);

const del = (url: string) =>
  api.delete<{ success: boolean; message: string }>(url).then((r) => r.data);

const getList = <T>(url: string, params?: object) =>
  api.get<any>(url, { params }).then((r) => r.data);

// ─── AUTH ──────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then((r) => r.data.data),
  me: () => get<any>('/auth/me'),
  logout: () => post('/auth/logout'),
};

// ─── CUSTOMERS ─────────────────────────────────────────────────────────────
export const customersApi = {
  getAll: (params?: object) => getList<any>('/customers', params),
  getById: (id: string) => get<any>(`/customers/${id}`),
  create: (data: object) => post<any>('/customers', data),
  update: (id: string, data: object) => put<any>(`/customers/${id}`, data),
  delete: (id: string) => del(`/customers/${id}`),
  createFollowup: (customerId: string, data: object) =>
    post<any>(`/customers/${customerId}/followups`, data),
  updateFollowup: (customerId: string, fid: string, data: object) =>
    put<any>(`/customers/${customerId}/followups/${fid}`, data),
  search: (q: string) => get<any[]>('/customers/search', { q }),
};

// ─── PRODUCTS ──────────────────────────────────────────────────────────────
export const productsApi = {
  getAll: (params?: object) => getList<any>('/products', params),
  getById: (id: string) => get<any>(`/products/${id}`),
  create: (data: object) => post<any>('/products', data),
  update: (id: string, data: object) => put<any>(`/products/${id}`, data),
  delete: (id: string) => del(`/products/${id}`),
  getCategories: () => get<string[]>('/products/categories'),
  getHealth: () => get<any>('/products/health'),
  search: (q: string) => get<any[]>('/products/search', { q }),
};

// ─── STOCK MOVEMENTS ───────────────────────────────────────────────────────
export const stockApi = {
  getAll: (params?: object) => getList<any>('/stock-movements', params),
  create: (data: object) => post<any>('/stock-movements', data),
};

// ─── CHALLANS ──────────────────────────────────────────────────────────────
export const challansApi = {
  getAll: (params?: object) => getList<any>('/challans', params),
  getById: (id: string) => get<any>(`/challans/${id}`),
  create: (data: object) => post<any>('/challans', data),
  confirm: (id: string) => post<any>(`/challans/${id}/confirm`),
  cancel: (id: string) => post<any>(`/challans/${id}/cancel`),
  search: (q: string) => get<any[]>('/challans/search', { q }),
  downloadPDF: (id: string) =>
    api
      .get(`/challans/${id}/pdf`, { responseType: 'blob' })
      .then((r) => {
        const url = window.URL.createObjectURL(new Blob([r.data]));
        const a = document.createElement('a');
        a.href = url;
        a.download = `Challan-${id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }),
};

// ─── DASHBOARD ─────────────────────────────────────────────────────────────
export const dashboardApi = {
  getSummary: () => get<any>('/dashboard/summary'),
};

// ─── REPORTS ───────────────────────────────────────────────────────────────
export const reportsApi = {
  getSalesOverview: (days = 30) => get<any>('/reports/sales-overview', { days }),
  getInventoryHealth: () => get<any>('/reports/inventory-health'),
  getCustomerActivity: (days = 30) => get<any>('/reports/customer-activity', { days }),
  getStockMovements: (days = 30) => get<any>('/reports/stock-movements', { days }),
};

// ─── ACTIVITY ──────────────────────────────────────────────────────────────
export const activityApi = {
  getAll: (page = 1) =>
    api.get('/activity', { params: { page, limit: 30 } }).then((r) => r.data),
};

// ─── SEARCH ALL ────────────────────────────────────────────────────────────
export const searchAll = async (q: string) => {
  if (!q.trim()) return { customers: [], products: [], challans: [] };
  const [customers, products, challans] = await Promise.allSettled([
    customersApi.search(q),
    productsApi.search(q),
    challansApi.search(q),
  ]);
  return {
    customers: customers.status === 'fulfilled' ? customers.value : [],
    products: products.status === 'fulfilled' ? products.value : [],
    challans: challans.status === 'fulfilled' ? challans.value : [],
  };
};

export default api;