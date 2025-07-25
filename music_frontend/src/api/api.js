import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080',
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem("jwt"); // 토큰 저장 키와 일치하는지 확인
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const verifyNaverpayPayment = async (paymentId, orderId, signature) => {
  try {
    const response = await API.post(
      '/payments/verify/naverpay',
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
