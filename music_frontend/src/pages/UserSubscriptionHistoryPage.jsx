
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import '../styles/UserSubscriptionHistory.css';

export const UserSubscriptionHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isSubscribed, setIsSubscribed } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const fetchHistory = useCallback(async () => {
    if (!token) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/subscriptions/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data);
      console.log('🌐 구독 이력 로드 성공:', res.data);
    } catch (err) {
      console.error('🌐 이력 조회 실패:', err);
      setError('구독 이력을 불러오는 데 실패했습니다.');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleUnsubscribe = async () => {
    if (!token) {
      setError('로그인이 필요합니다.');
      return;
    }
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/subscriptions/unsubscribe`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsSubscribed(false);
      alert('구독이 해지되었습니다.');
      console.log('🌐 구독 해지 성공');
      navigate('/subscription');
    } catch (err) {
      alert('구독 해지 실패: ' + (err.response?.data?.message || err.message));
      console.error('🌐 구독 해지 실패:', err);
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
      <div className="subscription-history-loading subscription-history-error">
        {error}
        <button onClick={fetchHistory} className="retry-button">
          재시도
        </button>
      </div>
    );
  }

  return (
    <div className="subscription-history-container">
      <h2 className="subscription-history-title">구독 이력</h2>
      {isSubscribed && (
        <button className="unsubscribe-button" onClick={handleUnsubscribe}>
          구독 해지
        </button>
      )}
      <ul className="subscription-history-list">
        {history.length === 0 ? (
          <li className="subscription-history-empty-message">
            구독 이력이 없습니다.
          </li>
        ) : (
          history.map((h, idx) => (
            <li key={h.id || idx} className="subscription-history-item">
              <div className="subscription-history-item-plan-name">{h.planName}</div>
              <div className="subscription-history-item-duration">
                {new Date(h.subscribedAt).toLocaleDateString()} ~{' '}
                {new Date(h.expiresAt).toLocaleDateString()}
              </div>
              <div className="subscription-history-item-price">
                ₩ {h.price?.toLocaleString()}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};
