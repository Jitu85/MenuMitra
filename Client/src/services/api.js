import axios from 'axios';

// Get base URL for backend API. Default to local port 4000.
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach bearer token if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('menumitra_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Standardize error management & handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      console.warn('API returned 401 Unauthorized. Clearing local credentials...');
      localStorage.removeItem('menumitra_token');
      localStorage.removeItem('menumitra_role');
      localStorage.removeItem('menumitra_profile');
      
      // Optionally redirect to login page (avoiding circular routing in public pages)
      if (!window.location.pathname.startsWith('/login') && 
          !window.location.pathname.startsWith('/admin/login') &&
          !window.location.pathname.startsWith('/menu') &&
          window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    
    // Return custom error message from server if exists
    const serverMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
    const customError = new Error(serverMessage);
    customError.status = error.response?.status;
    customError.data = error.response?.data;
    
    return Promise.reject(customError);
  }
);

export default api;
