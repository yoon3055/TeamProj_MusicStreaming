// src/component/UnifiedPaymentButton.jsx
import React from 'react';
// import TossPayments from '@tosspayments/payment-sdk'; // 🌐 토스페이먼츠 SDK 임포트 주석 처리
import PropTypes from 'prop-types';

import '../styles/UnifiedPaymentButton.css'; // ✨ CSS 파일 임포트

const UnifiedPaymentButton = ({ amount, orderId, productName, onSuccess, onFailure }) => {
  // 🌐 토스페이먼츠 객체 초기화 (전체 주석 처리)
  // const toss = new TossPayments('toss_test_*****************');

  // 🌐 토스페이 결제 요청 핸들러 (전체 주석 처리)
  const handleTossPayment = () => {
    // if (!window.TossPayments) {
    //   alert('토스페이먼츠 SDK가 로드되지 않았습니다.');
    //   return;
    // }

    // toss.requestPayment('카드', {
    //   amount,
    //   orderId,
    //   orderName: productName,
    //   successUrl: `${window.location.origin}/payment/success`,
    //   failUrl: `${window.location.origin}/payment/fail`,
    // })
    // .then((response) => {
    //   if (onSuccess) onSuccess(response);
    // })
    // .catch((error) => {
    //   if (onFailure) onFailure(error);
    //   console.error('🌐 토스 결제 실패:', error);
    //   alert('토스 결제 실패: ' + error.message);
    // });
    alert('토스페이 결제하기 버튼 클릭! (기능 주석 처리됨)');
  };

  // 🌐 네이버페이 버튼 클릭 트리거 핸들러 (전체 주석 처리)
  const handleNaverPay = () => {
    // const naverPayButton = document.querySelector('#naver-pay-btn');
    // if (naverPayButton) {
    //   naverPayButton.dispatchEvent(new Event('click'));
    // } else {
    //   alert('네이버페이 버튼이 준비되지 않았습니다. 잠시 후 다시 시도해주세요.');
    // }
    alert('네이버페이 결제하기 버튼 클릭! (기능 주석 처리됨)');
  };

  return (
    <div className="unified-payment-buttons-container"> {/* ✨ 클래스 적용 */}
      {/* 1. 토스페이 결제 버튼 */}
      <button onClick={handleTossPayment} className="unified-payment-button unified-payment-toss"> {/* ✨ 클래스 적용 */}
        <svg className="unified-payment-icon" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm-3 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm6.5-4a.5.5 0 00-.5-.5h-7a.5.5 0 00-.5.5v1a.5.5 0 00.5.5h7a.5.5 0 00.5-.5v-1z" />
        </svg>
        <span>토스페이로 결제하기 ({amount.toLocaleString()}원)</span>
      </button>

      {/* 2. 네이버페이 SDK가 렌더링할 버튼 컨테이너 */}
      {/* ⚠️ 네이버페이 SDK가 #naver-pay-btn 엘리먼트에 버튼을 삽입합니다. */}
      <div className="unified-payment-naver-button-wrapper"> {/* ✨ 클래스 적용 */}
        <div
          id="naver-pay-btn"
          className="naver-pay-button"
          data-pay-method="NAVERPAY"
          data-product-name={productName}
          data-price={amount.toString()}
          data-product-code={orderId}
          data-customer-name="홍길동"
          data-return-url={`${window.location.origin}/payment/success`}
          data-cancel-url={`${window.location.origin}/payment/fail`}
        />
      </div>

      {/* 3. 네이버페이 결제 트리거 버튼 (SDK가 렌더링한 버튼을 클릭) */}
      <button onClick={handleNaverPay} className="unified-payment-button unified-payment-naver-trigger"> {/* ✨ 클래스 적용 */}
        <svg className="unified-payment-icon" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm-1 11a1 1 0 112 0v1a1 1 0 11-2 0v-1zm1-8a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z" />
        </svg>
        <span>네이버페이로 결제하기</span>
      </button>

      {/* 🌐 네이버페이 스크립트 삽입 (React 외부에서 로드하는 것을 권장) */}
      {/* ⚠️ 주의: React 컴포넌트 내부에 <script> 태그를 직접 넣는 것은 권장되지 않습니다. */}
      {/* 이 스크립트는 컴포넌트가 렌더링될 때마다 실행될 수 있습니다. */}
      {/* 이상적으로는 public/index.html 파일의 <head> 또는 <body> 끝에 한 번만 로드하거나, */}
      {/* React Helmet과 같은 라이브러리를 사용하여 동적으로 로드하는 것이 좋습니다. */}
      {/* <script src="https://pay.naver.com/customer/js/naverPay.js" defer></script> */}
    </div>
  );
};

UnifiedPaymentButton.propTypes = {
  amount: PropTypes.number.isRequired,
  orderId: PropTypes.string.isRequired,
  productName: PropTypes.string.isRequired,
  onSuccess: PropTypes.func,
  onFailure: PropTypes.func,
};

export default UnifiedPaymentButton;