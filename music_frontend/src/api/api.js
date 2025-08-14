// src/api/api.js
import axios from 'axios';
import { handleAction } from '../services/indexDB';

const API = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080',
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('jwt');
  console.log('[API DEBUG] Token from localStorage:', token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('[API DEBUG] Authorization header set:', config.headers.Authorization);
  } else {
    console.log('[API DEBUG] No token found in localStorage');
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
    console.error('네이버페이 검증 오류:', error.response?.data || error.message);
    throw error;
  }
};

export default API;