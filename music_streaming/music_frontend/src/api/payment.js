// src/api/payment.js
import axios from 'axios';
import { handleAction } from '../services/indexDB';

export const verifyNaverpayPayment = async (paymentId, orderId, signature) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/payments/verify/naverpay`,
      { paymentId, orderId },
      { headers: { 'X-NaverPay-Signature': signature } }
    );
    return response.data;
  } catch (error) {
    if (!navigator.onLine || error.response?.status === 401) {
      await handleAction('verify_payment', { paymentId, orderId, signature });
      window.showToast('오프라인. 결제 검증 나중에 동기화.', 'info');
    }
    console.error('네이버페이 검증 오류:', error.response?.data || error.message);
    throw error;
  }
};