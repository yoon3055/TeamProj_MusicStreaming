// src/pages/PaymentFailPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

import '../styles/PaymentFailpage.css'; // ✨ CSS 파일 임포트

const PaymentFailPage = () => {
  // 🌐 이 컴포넌트는 주로 UI를 표시하므로, 기능적인 로직은 없습니다.
  // '결제 다시 시도' 버튼은 /purchase 경로로 이동하는 단순한 Link입니다.

  return (
    <div className="payment-fail-page-container">
      <div className="payment-fail-card">
        <h1 className="payment-fail-title">결제 실패</h1>
        <p className="payment-fail-message">
          결제 처리 중 오류가 발생했습니다. 다시 시도해 주세요.
        </p>
        <Link to="/purchase" className="payment-fail-button">
          결제 다시 시도
        </Link>
      </div>
    </div>
  );
};

export default PaymentFailPage;