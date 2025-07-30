import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SubscriptionPage.css';

// 더미 데이터
const dummyPlans = [
  {
    id: 'plan_basic',
    name: 'Basic',
    description: '기본 구독 요금제로, 표준 음질 스트리밍 제공',
    price: 9900,
    durationDays: 30,
    supportsHighQuality: false,
  },
  {
    id: 'plan_premium',
    name: 'Premium',
    description: '고음질 스트리밍과 오프라인 재생 지원',
    price: 14900,
    durationDays: 30,
    supportsHighQuality: true,
  },
  {
    id: 'plan_pro',
    name: 'Pro',
    description: '최고 음질과 모든 프리미엄 기능 포함',
    price: 19900,
    durationDays: 30,
    supportsHighQuality: true,
  },
];

export const SubscriptionPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const jwt = localStorage.getItem('jwt'); // token -> jwt로 변경

  // 구독 요금제 데이터를 fetch하는 함수
  const fetchData = useCallback(async () => {
    if (!jwt) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      navigate('/login'); // 로그인 페이지로 리다이렉트
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // 실제 API 호출 (주석 처리)
      /*
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/subscriptions`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setPlans(res.data);
      console.log('🌐 구독 요금제 로드 성공:', res.data);
      */
      // 더미 데이터로 대체
      setPlans(dummyPlans);
      console.log('🌐 더미 구독 요금제 로드 성공:', dummyPlans);
    } catch (err) {
      console.error('🌐 요금제 불러오기 실패:', err);
      setError('요금제를 불러오는 데 실패했습니다.');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, [jwt, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 구독 요금제를 선택했을 때 결제 페이지로 이동
  const handleSelectPlan = (planId) => {
    if (!jwt) {
      setError('로그인 후 이용해 주세요.');
      navigate('/login');
      return;
    }
    navigate(`/payment/${planId}`);
  };

  if (loading) {
    return <div className="subscription-page-loading">요금제를 불러오는 중입니다...</div>;
  }

  if (error) {
    return (
      <div className="subscription-page-loading subscription-page-error">
        {error}
        <button onClick={fetchData} className="retry-button">
          재시도
        </button>
      </div>
    );
  }

  return (
    <div className="subscription-page-container">
      <h2 className="subscription-page-title">구독 요금제</h2>
      <div className="subscription-plans-grid">
        {plans.length === 0 ? (
          <p className="subscription-message">표시할 요금제가 없습니다.</p>
        ) : (
          plans.map((plan) => (
            <div key={plan.id} className="subscription-plan-card">
              <div>
                <h3 className="plan-name">{plan.name}</h3>
                <p className="plan-description">{plan.description}</p>
                <p className="plan-price">
                  ₩ {plan.price?.toLocaleString()} / {plan.durationDays}일
                </p>
                {plan.supportsHighQuality && (
                  <span className="plan-high-quality-badge">고음질 지원</span>
                )}
              </div>
              <button
                className="plan-select-button"
                onClick={() => handleSelectPlan(plan.id)}
                disabled={!jwt} // 로그인하지 않으면 버튼 비활성화
              >
                결제하기
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
