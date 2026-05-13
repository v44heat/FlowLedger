// frontend/src/api/client.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  timeout: 30_000,
});

// Inject JWT on every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('fl_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Handle 401 globally → redirect to login
api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fl_token');
      localStorage.removeItem('fl_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  profile: () => api.get('/auth/profile'),
};

// ─── Transactions ─────────────────────────────────────────────────────────────
export const transactionsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get('/transactions', { params }),
  categorize: (id: string, category: string) =>
    api.patch(`/transactions/${id}/categorize`, { category }),
  bulkCategorize: (ids: string[], category: string) =>
    api.post('/transactions/bulk-categorize', { ids, category }),
};

// ─── Import ───────────────────────────────────────────────────────────────────
export const importApi = {
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/import', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  batches: () => api.get('/import/batches'),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsApi = {
  monthly: (params?: { year?: number; month?: number }) =>
    api.get('/analytics/monthly', { params }),
  trends: (months = 6) =>
    api.get('/analytics/trends', { params: { months } }),
  categories: (months = 3) =>
    api.get('/analytics/categories', { params: { months } }),
  insights: () =>
    api.get('/analytics/insights'),
};

// ─── Budgets ──────────────────────────────────────────────────────────────────
export const budgetsApi = {
  list: (params?: { year?: number; month?: number }) =>
    api.get('/budgets', { params }),
  upsert: (data: { category: string; monthlyLimit: number; month?: number; year?: number }) =>
    api.post('/budgets', data),
  remove: (id: string) => api.delete(`/budgets/${id}`),
};