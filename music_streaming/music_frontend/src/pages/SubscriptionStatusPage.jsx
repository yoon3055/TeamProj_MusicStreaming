import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/SubscriptionStatusPage.css';

const SubscriptionStatusPage = () => {
  const navigate = useNavigate();
  const { user, subscriptionDetails, isSubscribed, apiClient } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState(null);

  // 구독 상태 조회
  const fetchSubscriptionStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get('/api/subscription/current');
      console.log('구독 상태 응답:', response.data);
      
      if (response.data) {
        setSubscription(response.data);
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error('구독 상태 조회 실패:', error);
      if (error.response?.status === 404) {
        // 구독이 없는 경우
        setSubscription(null);
      } else {
        setError('구독 정보를 불러오는 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [user]);

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 남은 일수 계산
  const getRemainingDays = (endDate) => {
    if (!endDate) return 0;
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (!user) {
    return (
      <div className="subscription-status-page">
        <div className="page-header">
          <button className="back-button" onClick={() => navigate('/myPage')}>
            ← 마이페이지로 돌아가기
          </button>
          <h1>구독 상태</h1>
        </div>
        <div className="login-required">
          <div className="login-icon">🔐</div>
          <h2>로그인이 필요합니다</h2>
          <p>구독 상태를 확인하려면 먼저 로그인해주세요.</p>
          <button 
            className="login-btn"
            onClick={() => navigate('/login')}
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-status-page">
      {/* 헤더 */}
      <div className="page-header">
        <button className="back-button" onClick={() => navigate('/myPage')}>
          ← 마이페이지로 돌아가기
        </button>
        <h1>구독 상태</h1>
      </div>

      {/* 메인 구독 상태 섹션 */}
      <div className="main-status-section">
        {loading ? (
          <div className="status-loading">
            <div className="loading-spinner"></div>
            <p>구독 정보를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="status-error">
            <div className="error-icon">⚠️</div>
            <h3>오류 발생</h3>
            <p>{error}</p>
            <button 
              className="retry-btn"
              onClick={fetchSubscriptionStatus}
            >
              다시 시도
            </button>
          </div>
        ) : subscription ? (
          <div className="subscription-overview">
            <div className="overview-header">
              <div className="status-badge">
                <span className={`status-indicator ${subscription.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                  {subscription.status === 'ACTIVE' ? '✅ 활성' : '❌ 비활성'}
                </span>
              </div>
              <h2>구독 상태</h2>
            </div>
            <div className="overview-content">
              <div className="plan-info">
                <h3>{subscription.planName || subscription.planType}</h3>
                <p className="plan-price">{subscription.price?.toLocaleString()}원/월</p>
              </div>
              {subscription.description && (
                <p className="plan-description">{subscription.description}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="no-subscription-overview">
            <div className="no-sub-icon">📋</div>
            <h2>활성 구독이 없습니다</h2>
            <p>프리미엄 기능을 이용하려면 구독을 시작해보세요.</p>
          </div>
        )}
      </div>

      {/* 상세 정보 섹션 */}
      {subscription && (
        <div className="detailed-info-section">
          <div className="info-grid">
            <div className="info-card">
              <div className="info-header">
                <h3>📅 구독 기간</h3>
              </div>
              <div className="info-content">
                <div className="date-range">
                  <div className="date-item">
                    <span className="label">시작일</span>
                    <span className="value">{formatDate(subscription.startDate)}</span>
                  </div>
                  <div className="date-separator">→</div>
                  <div className="date-item">
                    <span className="label">만료일</span>
                    <span className="value">{formatDate(subscription.endDate)}</span>
                  </div>
                </div>
                {subscription.status === 'ACTIVE' && (
                  <div className="remaining-days">
                    <span className="days-count">{getRemainingDays(subscription.endDate)}</span>
                    <span className="days-text">일 남음</span>
                  </div>
                )}
              </div>
            </div>

            <div className="info-card">
              <div className="info-header">
                <h3>💳 결제 정보</h3>
              </div>
              <div className="info-content">
                <div className="payment-info">
                  <div className="payment-item">
                    <span className="label">플랜</span>
                    <span className="value">{subscription.planName || subscription.planType}</span>
                  </div>
                  <div className="payment-item">
                    <span className="label">월 요금</span>
                    <span className="value price">{subscription.price?.toLocaleString()}원</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="info-card">
              <div className="info-header">
                <h3>⚙️ 구독 관리</h3>
              </div>
              <div className="info-content">
                <div className="management-buttons">
                  {subscription.status === 'ACTIVE' ? (
                    <>
                      <button className="manage-btn upgrade-btn">
                        플랜 업그레이드
                      </button>
                      <button className="manage-btn cancel-btn">
                        구독 취소
                      </button>
                    </>
                  ) : (
                    <button 
                      className="manage-btn subscribe-btn"
                      onClick={() => navigate('/subscription-plans')}
                    >
                      새 구독 시작하기
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default SubscriptionStatusPage;
