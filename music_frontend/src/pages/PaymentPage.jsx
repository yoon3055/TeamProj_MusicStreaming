import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/SubscriptionPage.css';

const dummyPlans = [
  { id: 'plan_basic', name: 'Basic', description: '기본 구독 요금제로, 표준 음질 스트리밍 제공', price: 9900, durationDays: 30, supportsHighQuality: false },
  { id: 'plan_premium', name: 'Premium', description: '고음질 스트리밍과 오프라인 재생 지원', price: 14900, durationDays: 30, supportsHighQuality: true },
  { id: 'plan_pro', name: 'Pro', description: '최고 음질과 모든 프리미엄 기능 포함', price: 19900, durationDays: 30, supportsHighQuality: true },
];

const PaymentPage = () => {
  const { planId } = useParams();
  const { setIsSubscribed } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const jwt = localStorage.getItem('jwt');

  useEffect(() => {
    console.log(`🌐 현재 planId: ${planId}`);
    if (!jwt) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }
    if (planId) {
      const selectedPlan = dummyPlans.find((p) => p.id === planId);
      if (selectedPlan) {
        setItem({ ...selectedPlan, type: 'subscription' });
        setLoading(false);
      } else {
        console.log(`🌐 유효하지 않은 planId: ${planId}, 기본 요금제로 리다이렉트`);
        setError('선택한 요금제를 찾을 수 없습니다. 기본 요금제로 이동합니다.');
        navigate('/payment/subscription/plan_basic', { replace: true });
      }
    } else {
      setError('구독 ID가 필요합니다.');
      setLoading(false);
    }
  }, [planId, jwt, navigate]);

  const generateDummyPaymentData = () => {
    const paymentKey = `pay_${Math.random().toString(36).substr(2, 9)}`;
    const orderId = `order_subscription_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    return { paymentKey, orderId };
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (isProcessing) {
      console.log('🌐 결제 처리 중, 중복 요청 무시');
      return;
    }
    setIsProcessing(true);
    setError(null);

    if (!jwt) {
      setError('로그인이 필요합니다.');
      setIsProcessing(false);
      return;
    }
    if (!item) {
      setError('구독 정보가 없습니다.');
      setIsProcessing(false);
      return;
    }

    const isValidCard = cardNumber.match(/^\d{16}$/);
    const isValidExpiry = expiry.match(/^(0[1-9]|1[0-2])\/\d{2}$/);
    const isValidCvc = cvc.match(/^\d{3}$/);

    if (!cardNumber || !expiry || !cvc) {
      setError('모든 결제 정보를 입력해주세요.');
      setIsProcessing(false);
      return;
    }
    if (!isValidCard || !isValidExpiry || !isValidCvc) {
      setError('유효한 결제 정보를 입력해주세요.');
      setIsProcessing(false);
      return;
    }

    try {
      const isSuccess = true; // 실제 결제 성공 여부 확인
      const { paymentKey, orderId } = generateDummyPaymentData();
      if (isSuccess) {
        setIsSubscribed(true);
        console.log(`🌐 더미 구독 결제 성공: 요금제 ID ${planId}`);
        const successUrl = `/payment/success?paymentKey=${paymentKey}&orderId=${orderId}&amount=${item.price}&type=subscription&planId=${planId}`;
        navigate(successUrl, { replace: true });
      } else {
        throw new Error('결제 처리 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('🌐 결제 실패:', err);
      const failUrl = `/payment/fail?error=${encodeURIComponent(err.message)}&type=subscription&planId=${planId}`;
      navigate(failUrl, { replace: true });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    navigate('/subscription-plans', { replace: true });
  };

  if (loading) {
    return <div className="subscription-page-loading">결제 정보를 불러오는 중입니다...</div>;
  }

  if (error || !item) {
    return (
      <div className="subscription-page-loading subscription-page-error">
        {error || '결제 정보를 불러올 수 없습니다.'}
        <button onClick={handleCancel} className="retry-button">
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="subscription-page-container">
      <h2 className="subscription-page-title">구독 결제</h2>
      <div className="subscription-plan-card">
        <h3 className="plan-name">{item.name}</h3>
        <p className="plan-description">{item.description}</p>
        <p className="plan-price">₩ {item.price?.toLocaleString()} / {item.durationDays}일</p>
        {item.supportsHighQuality && (
          <span className="plan-high-quality-badge">고음질 지원</span>
        )}
        <form onSubmit={handleConfirmPayment} className="payment-form">
          <div className="form-group">
            <label htmlFor="cardNumber">카드 번호</label>
            <input
              type="text"
              id="cardNumber"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="1234 5678 9012 3456"
              className="payment-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="expiry">유효 기간</label>
            <input
              type="text"
              id="expiry"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              placeholder="MM/YY"
              className="payment-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="cvc">CVC</label>
            <input
              type="text"
              id="cvc"
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
              placeholder="123"
              className="payment-input"
            />
          </div>
          {error && <p className="payment-error">{error}</p>}
          <div className="payment-buttons">
            <button type="submit" className="plan-select-button" disabled={isProcessing}>
              {isProcessing ? '처리 중...' : '결제 진행'}
            </button>
            <button type="button" onClick={handleCancel} className="user-profile-cancel-button">
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;
