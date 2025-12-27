import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
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

// Handle token expiration and network errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error (backend not reachable)
    if (!error.response) {
      console.error('Network Error:', error.message);
      console.error('Make sure the backend server is running on', API_URL);
      return Promise.reject(new Error('Network Error: Cannot connect to server. Please make sure the backend is running.'));
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;



