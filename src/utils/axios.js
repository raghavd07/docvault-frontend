import axios from 'axios';

const defaultUrl = process.env.NODE_ENV === 'production' 
  ? 'https://docvault-backend-k1ca.onrender.com' 
  : 'http://localhost:5000';
export const API_URL = process.env.REACT_APP_API_URL || defaultUrl;

const API = axios.create({
  baseURL: `${API_URL}/api`,
});

API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      sessionStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;