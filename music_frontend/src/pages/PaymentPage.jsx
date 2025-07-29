// src/pages/PaymentPage.jsx
import React from 'react';
// import { useNavigate } from 'react-router-dom'; // 🌐 네비게이션 기능이 주석 처리되므로 임포트도 주석 처리

import '../styles/PaymentPage.css'; // ✨ CSS 파일 임포트

export const PaymentPage = () => {
  // const navigate = useNavigate(); // 🌐 네비게이션 기능이 주석 처리되므로 훅도 주석 처리

  // 🌐 결제 API 호출 로직 (현재는 테스트 모드)
  const handlePayment = async () => {
    // try {
    //   // 🌐 실제 결제 API 호출 (Stripe, TossPayments 등)
    //   // 이 부분은 백엔드 결제 연동 또는 결제 SDK 호출 로직이 들어갑니다.
    //   alert('결제 요청 성공! (테스트 모드)');
    //   // navigate('/payment/success');
    // } catch (err) {
    //   alert('결제 실패: ' + err.message);
    //   console.error('🌐 결제 처리 중 오류 발생:', err);
    //   // navigate('/payment/fail');
    // }
    alert('결제 진행하기 버튼 클릭! (기능 주석 처리됨)');
  };

  return (
    <div className="payment-page-container">
      <div className="payment-card">
        <h2 className="payment-title">구독 요금제 결제</h2>
        <button onClick={handlePayment} className="payment-button">
          결제 진행하기
        </button>
        {/* 🌐 여기에 NaverPayButton, TossPaymentButton 등 다양한 결제 수단 버튼을 추가할 수 있습니다. */}
        {/*
        <div className="payment-options-container">
          <TossPaymentButton amount={10000} orderId="order123" customerName="김철수" />
          <NaverPayButton amount={10000} orderId="order123" customerName="김철수" />
        </div>
        */}
      </div>
    </div>
  );
};