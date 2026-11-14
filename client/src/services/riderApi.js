import axios from 'axios';

const riderApi = axios.create({
  baseURL: 'http://localhost:5000/api/v1/rider',
  headers: { 'Content-Type': 'application/json' }
});

riderApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('rider_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

riderApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('rider_token');
      localStorage.removeItem('rider_user');
      window.location.href = '/rider/login';
    }
    return Promise.reject(error);
  }
);

export default riderApi;
