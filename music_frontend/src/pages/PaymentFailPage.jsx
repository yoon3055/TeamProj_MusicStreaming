import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../styles/PaymentResultPage.css';

const PaymentFailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const message = searchParams.get('message');
  const code = searchParams.get('code');

  const errorMessage = message ? decodeURIComponent(message) : '결제 처리 중 오류가 발생했습니다.';

  const handleRetry = () => {
    navigate('/subscription-plans');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="payment-result-container">
      <div className="fail-section">
        <div className="fail-icon">
          <div className="error-mark">✕</div>
        </div>
        
        <h1>결제에 실패했습니다</h1>
        <p className="fail-message">
          {errorMessage}
        </p>

        {code && (
          <div className="error-details">
            <p><strong>오류 코드:</strong> {code}</p>
          </div>
        )}

        <div className="fail-reasons">
          <h3>결제 실패 원인</h3>
          <ul>
            <li>• 카드 한도 초과</li>
            <li>• 카드 정보 오류</li>
            <li>• 네트워크 연결 문제</li>
            <li>• 카드사 승인 거절</li>
            <li>• 시스템 일시적 오류</li>
          </ul>
        </div>

        <div className="action-buttons">
          <button onClick={handleRetry} className="primary-button">
            다시 시도
          </button>
          <button onClick={handleGoHome} className="secondary-button">
            홈으로 가기
          </button>
        </div>

        <div className="support-info">
          <p>계속해서 문제가 발생하면 고객센터로 연락해주세요.</p>
          <p>📞 1588-0000 | 📧 support@musicapp.com</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailPage;
