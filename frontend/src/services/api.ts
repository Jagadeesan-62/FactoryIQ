import axios from 'axios';

const getBaseURL = () => {
  const savedUrl = localStorage.getItem('backend_url');
  if (savedUrl) return savedUrl;

  const hostname = window.location.hostname;
  // If running locally (localhost, 127.0.0.1, .local or any IP address), use local port 8000
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.local') ||
    /^[0-9.]+$/.test(hostname)
  ) {
    return `http://${hostname}:8000`;
  }
  return 'https://optimanufacture-1.onrender.com';
};

export const api = axios.create({
  baseURL: getBaseURL(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
