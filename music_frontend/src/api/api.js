// src/api/api.js
import axios from 'axios';
import { handleAction } from '../services/indexDB';

const API = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080',
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  response => response,
  async (error) => {
    if (error.response?.status === 401 && !navigator.onLine) {
      await handleAction('api_call', { method: error.config.method, url: error.config.url, data: error.config.data });
      window.showToast('오프라인. 나중에 동기화.', 'info');
    }
    return Promise.reject(error);
  }
);

export const verifyNaverpayPayment = async (paymentId, orderId, signature) => {
  try {
    const response = await API.post(
      '/api/payments/verify/naverpay',
      { paymentId, orderId },
      { headers: { 'X-NaverPay-Signature': signature } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default API;