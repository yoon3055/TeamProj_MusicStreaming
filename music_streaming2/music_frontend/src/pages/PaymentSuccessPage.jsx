import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../styles/PaymentResultPage.css';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [error, setError] = useState(null);
  const [processed, setProcessed] = useState(false);
  
  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  useEffect(() => {
    if (processed) return; // 이미 처리된 경우 중복 실행 방지
    if (!paymentKey || !orderId || !amount) return; // 필수 파라미터 체크

    const confirmPayment = async () => {
      try {
        setLoading(true);
        setProcessed(true); // 처리 시작 표시

        const token = localStorage.getItem('jwt');
        console.log('=== 결제 승인 디버깅 ===');
        console.log('localStorage에서 가져온 token:', token);
        console.log('token 존재 여부:', !!token);
        
        if (!token) {
          console.error('토큰이 없음 - localStorage 전체 내용:', localStorage);
          throw new Error('로그인이 필요합니다.');
        }

        const response = await fetch('http://localhost:8080/api/payment/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            paymentKey: paymentKey,
            orderId: orderId,
            amount: parseInt(amount)
          })
        });

        if (!response.ok) {
          throw new Error('결제 승인 요청이 실패했습니다.');
        }

        const data = await response.json();

        setSubscriptionData({
          planType: data.planType,
          status: data.status,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          paymentKey: data.paymentKey,
          orderId: data.orderId,
          amount: data.amount
        });

      } catch (error) {
        console.error('결제 승인 실패:', error);
        setError(error.message || '결제 승인 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    // 1초 후에 처리 (로딩 효과)
    setTimeout(confirmPayment, 1000);
  }, [paymentKey, orderId, amount, processed]); // navigate 제거

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToSubscription = () => {
    navigate('/subscription-plans');
  };

  if (loading) {
    return (
      <div className="payment-result-container">
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <h2>결제를 처리하고 있습니다...</h2>
          <p>잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-result-container">
      <div className="success-section">
        <div className="success-icon">
          <div className="checkmark">✓</div>
        </div>
        
        <h1>결제가 완료되었습니다!</h1>
        <p className="success-message">
          구독이 성공적으로 활성화되었습니다.
        </p>

        {subscriptionData && (
          <div className="payment-details">
            <h3>결제 정보</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">구독 플랜:</span>
                <span className="value">{subscriptionData.planType} 플랜</span>
              </div>
              <div className="detail-item">
                <span className="label">결제 금액:</span>
                <span className="value">₩{parseInt(amount).toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <span className="label">구독 시작일:</span>
                <span className="value">
                  {new Date(subscriptionData.startDate).toLocaleDateString('ko-KR')}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">구독 만료일:</span>
                <span className="value">
                  {new Date(subscriptionData.endDate).toLocaleDateString('ko-KR')}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">주문번호:</span>
                <span className="value">{orderId}</span>
              </div>
            </div>
          </div>
        )}

        <div className="subscription-benefits">
          <h3>이제 이런 혜택을 누리실 수 있어요!</h3>
          <ul>
            {subscriptionData?.planType === 'basic' ? (
              <>
                <li>✓ 무제한 음악 스트리밍</li>
                <li>✓ 기본 음질 (128kbps)</li>
                <li>✓ 광고 없는 재생</li>
                <li>✓ 모바일/웹 이용 가능</li>
              </>
            ) : (
              <>
                <li>✓ 무제한 음악 스트리밍</li>
                <li>✓ 고품질 음질 (320kbps)</li>
                <li>✓ 광고 없는 재생</li>
                <li>✓ 모바일/웹 이용 가능</li>
                <li>✓ 오프라인 다운로드 (월 50곡)</li>
                <li>✓ 플레이리스트 무제한 생성</li>
                <li>✓ 가사 보기 기능</li>
              </>
            )}
          </ul>
        </div>

        <div className="action-buttons">
          <button onClick={handleGoHome} className="primary-button">
            홈으로 가기
          </button>
          <button onClick={handleGoToSubscription} className="secondary-button">
            구독 관리
          </button>
        </div>

        <div className="support-info">
          <p>결제 관련 문의사항이 있으시면 고객센터로 연락해주세요.</p>
          <p>📞 1588-0000 | 📧 support@musicapp.com</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
