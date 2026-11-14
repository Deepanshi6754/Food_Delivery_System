import axios from 'axios';

const ownerApi = axios.create({
  baseURL: 'http://localhost:5000/api/v1/owner',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach owner token
ownerApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('owner_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401s
ownerApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized on owner routes, clear owner storage
      if (window.location.pathname.startsWith('/owner') && window.location.pathname !== '/owner/login') {
        localStorage.removeItem('owner_token');
        localStorage.removeItem('owner_user');
        window.location.href = '/owner/login';
      }
    }
    return Promise.reject(error);
  }
);

export default ownerApi;

