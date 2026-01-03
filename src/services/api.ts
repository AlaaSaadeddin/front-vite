import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  // Don't add token for login/register endpoints
  const isAuthEndpoint = config.url?.includes('/auth/login') || config.url?.includes('/auth/register');
  if (token && !isAuthEndpoint) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401 and 403 (Todo: refresh token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login or clear token
      localStorage.removeItem('token');
      // window.location.href = '/login'; // simple redirect
    }
    // Log 403 errors for debugging
    if (error.response?.status === 403) {
      console.error('403 Forbidden:', error.response?.data);
    }
    return Promise.reject(error);
  }
);

export default api;
