import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor — só adiciona token em rotas protegidas
api.interceptors.request.use((config) => {
  const publicRoutes = [
    '/auth/register',
    '/auth/login',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/confirm-email',
  ];

  const isPublic = publicRoutes.some(route => config.url?.includes(route));

  if (!isPublic) {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default api;