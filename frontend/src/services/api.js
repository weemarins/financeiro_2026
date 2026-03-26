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

    if (isLocalhostConfig) {
      return '/api';
    }

    return ensureApiPath(parsedUrl.toString());
  } catch {
    return configuredUrl.startsWith('/') ? ensureApiPath(configuredUrl) : '/api';
  }
};

const API_BASE_URL = resolveApiBaseUrl();
const ABSOLUTE_URL_REGEX = /^https?:\/\//i;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em requisições
api.interceptors.request.use(
  (config) => {
    const requestUrl = config.url ?? '';
    const baseUrl = config.baseURL ?? API_BASE_URL;
    const baseIncludesApiPath = /\/api\/?$/.test(baseUrl);
    const isAbsoluteUrl = ABSOLUTE_URL_REGEX.test(requestUrl);

    if (!isAbsoluteUrl && requestUrl.startsWith('/') && !requestUrl.startsWith('/api') && !baseIncludesApiPath) {
      config.url = `/api${requestUrl}`;
    }

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
    const requestUrl = error.config?.url ?? '';
    const isLoginRequest = requestUrl.includes('/auth/login');

    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
