import React, { useState, useEffect, useCallback } from 'react';
//import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import '../styles/UserSubscriptionHistory.css';

// 더미 구독 이력 데이터
const dummyHistory = [
  {
    id: 'sub_001',
    planName: 'Premium',
    subscribedAt: '2025-06-01T00:00:00Z',
    expiresAt: '2025-07-01T00:00:00Z',
    price: 14900,
  },
  {
    id: 'sub_002',
    planName: 'Basic',
    subscribedAt: '2025-05-01T00:00:00Z',
    expiresAt: '2025-06-01T00:00:00Z',
    price: 9900,
  },
];

export const UserSubscriptionHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isSubscribed, setIsSubscribed, subscriptionDetails } = useAuth();
  const navigate = useNavigate();
  const jwt = localStorage.getItem('jwt');

  const fetchHistory = useCallback(async () => {
    if (!jwt) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // 실제 API 호출 (주석 처리)
      /*
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/subscriptions/history`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setHistory(res.data);
      console.log('🌐 구독 이력 로드 성공:', res.data);
      */
      // 더미 데이터로 대체
      setHistory(dummyHistory);
      console.log('🌐 더미 구독 이력 로드 성공:', dummyHistory);
    } catch (err) {
      console.error('🌐 이력 조회 실패:', err);
      setError('구독 이력을 불러오는 데 실패했습니다.');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [jwt]);

  const handleUnsubscribe = async () => {
    if (!jwt) {
      setError('로그인이 필요합니다.');
      return;
    }
    try {
      // 실제 API 호출 (주석 처리)
      /*
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/subscriptions/unsubscribe`,
        {},
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      */
      setIsSubscribed(false);
      alert('구독이 해지되었습니다.');
      console.log('🌐 더미 구독 해지 성공');
      navigate('/subscription');
    } catch (err) {
      alert('구독 해지 실패: ' + (err.response?.data?.message || err.message));
      console.error('🌐 구독 해지 실패:', err);
    }
  };

  const handleExtend = () => {
    if (subscriptionDetails?.planId) {
      navigate(`/payment/${subscriptionDetails.planId}`);
    } else {
      navigate('/subscription-plans');
    }
  };

  useEffect(() => {
    if (isSubscribed) {
      fetchHistory();
    } else {
      setLoading(false);
      setError('구독 중이 아닙니다.');
    }
  }, [isSubscribed, fetchHistory]);

  if (loading) {
    return <div className="subscription-history-loading">구독 이력을 불러오는 중입니다...</div>;
  }

  if (error) {
    return (
      <div className="subscription-history-loading subscription-error">
        {error}
        <button onClick={fetchHistory} className="retry-button">
          재시도
        </button>
      </div>
    );
  }

  return (
    <div className="subscription-history-container">
      <h2 className="subscription-history-title">구독 관리</h2>
      {isSubscribed && (
        <div className="subscription-actions">
          <button className="subscription-extend-button" onClick={handleExtend}>
            구독 연장
          </button>
          <button className="unsubscribe-button" onClick={handleUnsubscribe}>
            구독 해지
          </button>
        </div>
      )}
      <h3 className="subtitle">구독 목록</h3>
      <ul className="subscription-list">
        {history.length === 0 ? (
          <li className="subscription-empty">구독 이력이 없습니다.</li>
        ) : (
          history.map((item, index) => (
            <li key={item.id || index} className="subscription-item">
              <div className="subscription-item-plan-name">{item.planName}</div>
              <div className="subscription-item-duration">
                {new Date(item.subscribedAt).toLocaleDateString()} ~{' '}
                {new Date(item.expiresAt).toLocaleDateString()}
              </div>
              <div className="subscription-item-price">
                ₩ {item.price?.toLocaleString()}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};
