import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SubscriptionPlansPage.css';

const SubscriptionPlansPage = () => {
  const navigate = useNavigate();
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  // 구독 플랜 정보
  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 9900,
      duration: '월',
      features: [
        '무제한 음악 스트리밍',
        '기본 음질 (128kbps)',
        '광고 없는 재생',
        '모바일/웹 이용 가능'
      ],
      color: '#4CAF50'
    },
    {
      id: 'plus',
      name: 'Plus',
      price: 14900,
      duration: '월',
      features: [
        '무제한 음악 스트리밍',
        '고품질 음질 (320kbps)',
        '광고 없는 재생',
        '모바일/웹 이용 가능',
        '오프라인 다운로드 (월 50곡)',
        '플레이리스트 무제한 생성',
        '가사 보기 기능'
      ],
      color: '#FF9800',
      popular: true
    }
  ];

  useEffect(() => {
    fetchCurrentSubscription();
  }, []);

  const fetchCurrentSubscription = async () => {
    try {
      // 로컬 스토리지에서 구독 정보 조회
      const storedSubscription = localStorage.getItem('currentSubscription');
      if (storedSubscription) {
        const subscriptionData = JSON.parse(storedSubscription);
        
        // 만료일 확인
        const now = new Date();
        const endDate = new Date(subscriptionData.endDate);
        
        if (now > endDate) {
          // 구독이 만료된 경우
          subscriptionData.status = 'EXPIRED';
        }
        
        setCurrentSubscription(subscriptionData);
      }
    } catch (error) {
      console.error('구독 정보 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (planId) => {
    const plan = plans.find(p => p.id === planId);
    navigate('/payment', { 
      state: { 
        planId: plan.id,
        planName: plan.name,
        price: plan.price
      }
    });
  };

  const isCurrentPlan = (planId) => {
    return currentSubscription?.planType === planId && currentSubscription?.status === 'ACTIVE';
  };

  const isExpiredPlan = (planId) => {
    return currentSubscription?.planType === planId && currentSubscription?.status === 'EXPIRED';
  };

  if (loading) {
    return (
      <div className="subscription-loading">
        <div className="loading-spinner"></div>
        <p>구독 정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="subscription-plans-container">
      <div className="subscription-header">
        <h1>구독 플랜 선택</h1>
        <p>음악을 더 자유롭게 즐겨보세요</p>
      </div>

      {currentSubscription && (
        <div className="current-subscription-info">
          <h3>현재 구독 상태</h3>
          <div className="subscription-status">
            <span className={`status-badge ${currentSubscription.status.toLowerCase()}`}>
              {currentSubscription.status === 'ACTIVE' ? '활성' : 
               currentSubscription.status === 'EXPIRED' ? '만료' : '비활성'}
            </span>
            <span className="plan-name">{currentSubscription.planType} 플랜</span>
            {currentSubscription.endDate && (
              <span className="end-date">
                {currentSubscription.status === 'ACTIVE' ? '만료일: ' : '만료됨: '}
                {new Date(currentSubscription.endDate).toLocaleDateString('ko-KR')}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="plans-grid">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`plan-card ${plan.popular ? 'popular' : ''} ${isCurrentPlan(plan.id) ? 'current' : ''}`}
            style={{ '--plan-color': plan.color }}
          >
            {plan.popular && <div className="popular-badge">인기</div>}
            
            <div className="plan-header">
              <h3>{plan.name}</h3>
              <div className="price">
                <span className="amount">₩{plan.price.toLocaleString()}</span>
                <span className="period">/{plan.duration}</span>
              </div>
            </div>

            <div className="plan-features">
              <ul>
                {plan.features.map((feature, index) => (
                  <li key={index}>
                    <span className="check-icon">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="plan-action">
              {isCurrentPlan(plan.id) ? (
                <button className="plan-button current-plan" disabled>
                  현재 이용중
                </button>
              ) : isExpiredPlan(plan.id) ? (
                <button 
                  className="plan-button renew-plan"
                  onClick={() => handleSubscribe(plan.id)}
                >
                  재구독하기
                </button>
              ) : (
                <button 
                  className="plan-button subscribe-plan"
                  onClick={() => handleSubscribe(plan.id)}
                >
                  구독하기
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="subscription-info">
        <h3>구독 안내</h3>
        <ul>
          <li>구독은 언제든지 해지할 수 있습니다.</li>
          <li>결제는 매월 자동으로 갱신됩니다.</li>
          <li>구독 해지 시 현재 결제 기간 종료까지 서비스를 이용할 수 있습니다.</li>
          <li>플랜 변경은 다음 결제일부터 적용됩니다.</li>
        </ul>
      </div>
    </div>
  );
};

export default SubscriptionPlansPage;
