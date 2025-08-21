import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../styles/SubscriptionStatusCard.css';

const SubscriptionStatusCard = () => {
  const { user, subscriptionDetails, isSubscribed, apiClient } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);

  // 구독 상태 조회
  const fetchSubscriptionStatus = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await apiClient.get('/api/subscription/current');
      if (response.data) {
        setSubscription(response.data);
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error('구독 상태 조회 실패:', error);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSubscriptionStatus();
    }
  }, [user]);

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 가격 포맷팅
  const formatPrice = (price) => {
    if (!price) return '-';
    return `${price.toLocaleString()}원`;
  };

  // 상태에 따른 스타일 클래스
  const getStatusClass = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'status-active';
      case 'EXPIRED':
        return 'status-expired';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return 'status-none';
    }
  };

  // 상태 텍스트
  const getStatusText = (status) => {
    switch (status) {
      case 'ACTIVE':
        return '활성';
      case 'EXPIRED':
        return '만료됨';
      case 'CANCELLED':
        return '취소됨';
      default:
        return '구독 없음';
    }
  };

  if (!user) {
    return (
      <div className="subscription-status-card">
        <div className="card-header">
          <h3>구독 상태</h3>
        </div>
        <div className="card-content">
          <p>로그인이 필요합니다.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="subscription-status-card">
        <div className="card-header">
          <h3>구독 상태</h3>
        </div>
        <div className="card-content">
          <div className="loading">구독 정보를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-status-card">
      <div className="card-header">
        <h3>구독 상태</h3>
        <button 
          className="refresh-btn"
          onClick={fetchSubscriptionStatus}
          disabled={loading}
        >
          🔄 새로고침
        </button>
      </div>
      
      <div className="card-content">
        {subscription ? (
          <div className="subscription-info">
            <div className="status-row">
              <span className="label">상태:</span>
              <span className={`status ${getStatusClass(subscription.status)}`}>
                {getStatusText(subscription.status)}
              </span>
            </div>
            
            <div className="info-row">
              <span className="label">플랜:</span>
              <span className="value">{subscription.planName || subscription.planType}</span>
            </div>
            
            <div className="info-row">
              <span className="label">가격:</span>
              <span className="value">{formatPrice(subscription.price)}</span>
            </div>
            
            <div className="info-row">
              <span className="label">시작일:</span>
              <span className="value">{formatDate(subscription.startDate)}</span>
            </div>
            
            <div className="info-row">
              <span className="label">만료일:</span>
              <span className="value">{formatDate(subscription.endDate)}</span>
            </div>
            
            {subscription.description && (
              <div className="description">
                <span className="label">설명:</span>
                <p className="value">{subscription.description}</p>
              </div>
            )}
            
            {subscription.status === 'ACTIVE' && (
              <div className="active-badge">
                ✅ 현재 활성 구독
              </div>
            )}
          </div>
        ) : (
          <div className="no-subscription">
            <div className="no-sub-icon">📋</div>
            <h4>활성 구독이 없습니다</h4>
            <p>구독 플랜을 선택하여 프리미엄 기능을 이용해보세요!</p>
            <button 
              className="subscribe-btn"
              onClick={() => window.location.href = '/subscription-plans'}
            >
              구독 플랜 보기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionStatusCard;
