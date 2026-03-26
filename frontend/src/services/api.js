import axios from 'axios';

const ensureApiPath = (url) => {
  const normalized = url.replace(/\/+$/, '');
  return normalized.endsWith('/api') ? normalized : `${normalized}/api`;
};

const resolveApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();

  if (!configuredUrl) {
    return '/api';
  }

  try {
    const parsedUrl = new URL(configuredUrl);
    const hostname = parsedUrl.hostname;
    const isLocalhostConfig = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';

    if (isLocalhostConfig && typeof window !== 'undefined') {
      const runtimeUrl = new URL(window.location.origin);
      parsedUrl.protocol = runtimeUrl.protocol;
      parsedUrl.hostname = runtimeUrl.hostname;

      if (!parsedUrl.port && runtimeUrl.port) {
        parsedUrl.port = runtimeUrl.port;
      }
    }

    return ensureApiPath(parsedUrl.toString());
  } catch {
    return configuredUrl.startsWith('/') ? ensureApiPath(configuredUrl) : '/api';
  }
};

const API_BASE_URL = resolveApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
