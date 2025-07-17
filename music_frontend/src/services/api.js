import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api', // Spring Boot 서버 주소
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem("jwt");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});



export const verifyNaverpayPayment = async (paymentId, orderId, signature) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/payments/verify/naverpay`,
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
