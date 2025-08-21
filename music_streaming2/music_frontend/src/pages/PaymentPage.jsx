import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import '../styles/PaymentPage.css';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { planId, planName, price } = location.state || {};
  
  const [tossPayments, setTossPayments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const clientKey = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'; // 토스 테스트 클라이언트 키

  useEffect(() => {
    if (!planId || !planName || !price) {
      setError('결제 정보가 없습니다.');
      setLoading(false);
      return;
    }

    const initializeTossPayments = async () => {
      try {
        const toss = await loadTossPayments(clientKey);
        setTossPayments(toss);
        setLoading(false);
      } catch (err) {
        console.error('토스 페이먼츠 초기화 실패:', err);
        setError('결제 시스템을 불러올 수 없습니다.');
        setLoading(false);
      }
    };

    initializeTossPayments();
  }, [planId, planName, price]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePayment = async () => {
    if (!tossPayments) {
      setError('결제 시스템이 준비되지 않았습니다.');
      return;
    }

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      setError('모든 정보를 입력해주세요.');
      return;
    }

    const orderId = `subscription_${planId}_${Date.now()}`;
    
    try {
      await tossPayments.requestPayment('카드', {
        amount: price,
        orderId: orderId,
        orderName: `${planName} 구독`,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerMobilePhone: customerInfo.phone,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
        metadata: {
          planId: planId,
          planName: planName
        }
      });
    } catch (err) {
      console.error('결제 요청 실패:', err);
      setError('결제 요청 중 오류가 발생했습니다.');
    }
  };

  const handleBack = () => {
    navigate('/subscription-plans');
  };

  if (loading) {
    return (
      <div className="payment-loading">
        <div className="loading-spinner"></div>
        <p>결제 시스템을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-error">
        <h2>오류 발생</h2>
        <p>{error}</p>
        <button onClick={handleBack} className="back-button">
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-header">
        <h1>구독 결제</h1>
        <button onClick={handleBack} className="back-btn">
          ← 돌아가기
        </button>
      </div>

      <div className="payment-content">
        <div className="order-summary">
          <h2>주문 정보</h2>
          <div className="plan-info">
            <div className="plan-details">
              <h3>{planName} 플랜</h3>
              <p className="plan-description">
                {planId === 'basic' ? 
                  '무제한 음악 스트리밍, 기본 음질, 광고 없는 재생' :
                  '무제한 음악 스트리밍, 고품질 음질, 오프라인 다운로드, 플레이리스트 무제한'
                }
              </p>
            </div>
            <div className="plan-price">
              <span className="price">₩{price.toLocaleString()}</span>
              <span className="period">/월</span>
            </div>
          </div>
          
          <div className="benefits">
            <h4>구독 혜택</h4>
            <ul>
              {planId === 'basic' ? (
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
        </div>

        <div className="payment-form">
          <h2>결제자 정보</h2>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="name">이름 *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={customerInfo.name}
                onChange={handleInputChange}
                placeholder="홍길동"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">이메일 *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={customerInfo.email}
                onChange={handleInputChange}
                placeholder="example@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">휴대폰 번호 *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={customerInfo.phone}
                onChange={handleInputChange}
                placeholder="010-1234-5678"
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="payment-actions">
              <div className="total-amount">
                <span>총 결제금액: </span>
                <strong>₩{price.toLocaleString()}</strong>
              </div>
              <button 
                type="button" 
                onClick={handlePayment}
                className="payment-button"
              >
                결제하기
              </button>
            </div>
          </form>

          <div className="payment-notice">
            <h4>결제 안내</h4>
            <ul>
              <li>• 구독은 결제일로부터 30일간 이용 가능합니다.</li>
              <li>• 자동 갱신되며, 언제든지 해지할 수 있습니다.</li>
              <li>• 해지 시 현재 구독 기간 종료까지 서비스 이용 가능합니다.</li>
              <li>• 결제는 토스페이먼츠를 통해 안전하게 처리됩니다.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
