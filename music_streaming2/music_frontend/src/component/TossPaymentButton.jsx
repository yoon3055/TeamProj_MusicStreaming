// src/component/TossPaymentButton.jsx
import React from 'react';
// import TossPayments from '@tosspayments/payment-sdk'; // 🌐 토스페이먼츠 SDK 임포트 주석 처리
import PropTypes from 'prop-types';

import '../styles/TosspaymentButton.css'; // ✨ CSS 파일 임포트

const TossPaymentButton = ({ amount, orderId, customerName, onSuccess, onFailure }) => {
  // 🌐 토스페이먼츠 객체 초기화 (전체 주석 처리)
  // const toss = new TossPayments('toss_test_*****************');

  // 🌐 결제 요청 처리 함수 (전체 주석 처리)
  const handleClick = () => {
    // if (!window.TossPayments) {
    //   alert('토스페이먼츠 SDK가 로드되지 않았습니다.');
    //   return;
    // }

    // toss.requestPayment('카드', {
    //   amount: amount,
    //   orderId: orderId,
    //   orderName: '음악 스트리밍 구독', // 결제 상품명
    //   customerName: customerName,
    //   successUrl: `${window.location.origin}/payment/success`, // 결제 성공 시 리다이렉트될 URL
    //   failUrl: `${window.location.origin}/payment/fail`,     // 결제 실패 시 리다이렉트될 URL
    // })
    // .then((response) => {
    //   if (onSuccess) onSuccess(response);
    // })
    // .catch((error) => {
    //   if (onFailure) onFailure(error);
    //   console.error('🌐 토스 결제 실패:', error);
    //   alert(`결제 실패: ${error.message}`);
    // });
    alert('토스페이 결제하기 버튼 클릭! (기능 주석 처리됨)'); // 🌐 버튼 클릭 확인용 임시 알림
  };

  return (
    <button onClick={handleClick} className="toss-payment-button"> {/* ✨ 클래스 적용 */}
      결제하기 (토스)
    </button>
  );
};

TossPaymentButton.propTypes = {
  amount: PropTypes.number.isRequired,
  orderId: PropTypes.string.isRequired,
  customerName: PropTypes.string.isRequired,
  onSuccess: PropTypes.func,
  onFailure: PropTypes.func,
};

export default TossPaymentButton;