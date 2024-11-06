import axios from 'axios';

const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const axiosmeow = axios.create({
  baseURL: backendURL,
});

axiosmeow.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      localStorage.removeItem('token');
      alert('Session expired or invalid token. Please log in again.');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default axiosmeow;
