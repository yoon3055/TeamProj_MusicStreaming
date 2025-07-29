// src/pages/PaymentSuccessPage.jsx
import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
// import axios from 'axios'; // 🌐 백엔드 통신 기능이 주석 처리되므로 임포트도 주석 처리

import '../styles/PaymentSuccessPage.css'; // ✨ CSS 파일 임포트

const PaymentSuccessPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // 🌐 결제 검증 로직 (전체 주석 처리)
  useEffect(() => {
    // const verifyPayment = async () => {
    //   const paymentKey = params.get('paymentKey');
    //   const orderId = params.get('orderId');
    //   const amount = params.get('amount');

    //   if (!paymentKey || !orderId || !amount) {
    //     console.error('🌐 필수 결제 파라미터 누락');
    //     navigate('/payment/fail', { replace: true });
    //     return;
    //   }

    //   try {
    //     // await axios.post(`${process.env.REACT_APP_API_URL}/api/payments/verify/toss`, {
    //     //   paymentKey,
    //     //   orderId,
    //     //   amount: Number(amount),
    //     //   userId: localStorage.getItem('userId'),
    //     //   planId: localStorage.getItem('selectedPlanId'),
    //     // });

    //     console.log('🌐 결제 검증 성공');
    //     setTimeout(() => {
    //       navigate('/subscription', { replace: true });
    //     }, 4000);
    //   } catch (err) {
    //     console.error('🌐 결제 검증 실패:', err);
    //     navigate('/payment/fail', { replace: true });
    //   }
    // };

    // verifyPayment();
  }, [params, navigate]);

  return (
    <div className="payment-success-page-container">
      <div className="payment-success-card animate-fadeInUp">
        {/* 체크 아이콘 (SVG) */}
        <svg
          className="payment-success-icon animate-pulse"
          width="96"
          height="96"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path fillRule="evenodd" clipRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.893a.75.75 0 00-1.06-1.06l-4.47 4.47-2.065-2.065a.75.75 0 00-1.06 1.06l2.59 2.59a.75.75 0 001.06 0l5-5z" />
        </svg>

        <h1 className="payment-success-title">결제가 성공적으로 완료되었습니다!</h1>
        <p className="payment-success-message">
          🎉 이제 프리미엄 서비스의 모든 혜택을 누리실 수 있습니다.
        </p>
        <div className="payment-success-info-box">
          <p className="payment-success-info-item">
            결제 금액: <span className="payment-success-info-value">
              ₩{params.get('amount')?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </span>
          </p>
          <p className="payment-success-info-item">
            주문 번호: <span className="payment-success-info-value">{params.get('orderId')}</span>
          </p>
          <p className="payment-success-info-item">
            결제 키: <span className="payment-success-info-value">{params.get('paymentKey')}</span>
          </p>
        </div>
        <Link to="/" className="payment-success-button">
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;