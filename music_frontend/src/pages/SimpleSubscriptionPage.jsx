import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SimpleSubscriptionPage.css';

const SimpleSubscriptionPage = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 모든 구독 정보 조회 (DB 데이터만 사용)
  const fetchAllSubscriptions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        setError('로그인이 필요합니다.');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8080/api/subscription/all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('구독 정보를 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      setSubscriptions(data || []);
    } catch (error) {
      console.error('구독 정보 조회 실패:', error);
      setError(error.message || '구독 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSubscriptions();
  }, []);

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 상태 표시
  const getStatusBadge = (isActive, endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    
    if (!isActive) {
      return <span className="status-badge inactive">비활성</span>;
    }
    
    if (end < now) {
      return <span className="status-badge expired">만료됨</span>;
    }
    
    return <span className="status-badge active">활성</span>;
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

  if (loading) {
    return (
      <div className="simple-subscription-page">
        <div className="page-header">
          <button className="back-button" onClick={() => navigate('/')}>
            ← 홈으로 돌아가기
          </button>
          <h1>구독 정보 조회</h1>
        </div>
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <p>구독 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="simple-subscription-page">
        <div className="page-header">
          <button className="back-button" onClick={() => navigate('/')}>
            ← 홈으로 돌아가기
          </button>
          <h1>구독 정보 조회</h1>
        </div>
        <div className="error-section">
          <div className="error-icon">⚠️</div>
          <h3>오류 발생</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchAllSubscriptions}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="simple-subscription-page">
      <div className="page-header">
        <h1>구독 정보</h1>
        <button className="back-button" onClick={() => navigate('/')}>
          ← 홈으로 돌아가기
        </button>
        <button className="refresh-btn" onClick={fetchAllSubscriptions}>
          🔄 새로고침
        </button>
      </div>

      <div className="subscriptions-section">
        {subscriptions.length === 0 ? (
          <div className="no-subscriptions">
            <div className="no-sub-icon">📋</div>
            <h2>구독 정보가 없습니다</h2>
            <p>아직 구독한 플랜이 없습니다.</p>
            <button 
              className="subscribe-btn"
              onClick={() => navigate('/subscription-plans')}
            >
              구독 플랜 보기
            </button>
          </div>
        ) : (
          <div className="subscriptions-grid">
            {subscriptions.map((sub, index) => (
              <div key={sub.id || index} className="subscription-card">
                <div className="card-header">
                  <h3>{sub.planName || sub.planType || 'Unknown Plan'}</h3>
                  {getStatusBadge(sub.isActive, sub.endDate)}
                </div>
                
                <div className="card-content">
                  <div className="info-row">
                    <span className="label">플랜명:</span>
                    <span className="value">{sub.planName || 'Unknown Plan'}</span>
                  </div>
                  
                  <div className="info-row">
                    <span className="label">금액:</span>
                    <span className="value price">
                      {(sub.amount || sub.price) ? `₩${(sub.amount || sub.price).toLocaleString()}` : '-'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleSubscriptionPage;
