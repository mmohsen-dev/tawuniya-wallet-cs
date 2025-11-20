import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
};

// Wallet APIs
export const walletAPI = {
  getWallet: (userId: string) => api.get(`/wallet/${userId}`),
  
  earnPoints: (userId: string, serviceId: string, sarAmount: number) =>
    api.post('/wallet/earn', { userId, serviceId, sarAmount }),
  
  burnPoints: (userId: string, points: number, serviceId: string) =>
    api.post('/wallet/burn', { userId, points, serviceId }),
};

// Transaction APIs
export const transactionAPI = {
  getTransactions: (userId: string) =>
    api.get(`/transactions/${userId}`),
  
  getTransactionSummary: (userId: string) =>
    api.get(`/transactions/${userId}/summary`),
};

// Service APIs
export const serviceAPI = {
  getServices: (usageType?: 'earn' | 'burn') => {
    const params = usageType ? `?usageType=${usageType}` : '';
    return api.get(`/services${params}`);
  },
  
  getService: (id: string) => api.get(`/services/${id}`),
};

// Configuration APIs (public)
export const configAPI = {
  getPublicConfigurations: () => api.get('/configurations/public'),
};

// Admin APIs
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  
  // Services
  getServices: () => api.get('/admin/services'),
  
  // Configurations
  getConfigurations: () => api.get('/admin/configurations'),
  updateConfiguration: (id: string, data: {
    value: string;
    description?: string;
  }) => api.put(`/admin/configurations/${id}`, data),
};

export default api;

