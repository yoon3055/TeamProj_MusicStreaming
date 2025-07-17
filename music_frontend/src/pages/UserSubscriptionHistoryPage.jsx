// src/pages/UserSubscriptionHistory.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // 🌐 백엔드 통신을 위한 axios 임포트

import '../styles/UserSubscriptionHistory.css'; // ✨ CSS 파일 임포트

export const UserSubscriptionHistory = () => {
  const [history, setHistory] = useState([]); // 구독 이력 상태
  const [loading, setLoading] = useState(true); // 🌐 로딩 상태 추가
  const [error, setError] = useState(null); // 🌐 에러 상태 추가

  const token = localStorage.getItem('token');

  // 🌐 구독 이력 가져오기
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/subscriptions/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data);
      console.log("🌐 구독 이력 로드 성공:", res.data);
    } catch (err) {
      console.error('🌐 이력 조회 실패:', err);
      setError('구독 이력을 불러오는 데 실패했습니다.');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (loading) {
    return (
      <div className="subscription-history-loading">
        구독 이력을 불러오는 중입니다...
      </div>
    );
  }

  if (error) {
    return (
      <div className="subscription-history-loading subscription-history-error">
        {error}
      </div>
    );
  }

  return (
    <div className="subscription-history-container">
      <h2 className="subscription-history-title">구독 이력</h2>

      <ul className="subscription-history-list">
        {history.length === 0 ? (
          <li className="subscription-history-empty-message">
            구독 이력이 없습니다.
          </li>
        ) : (
          history.map((h, idx) => (
            <li
              key={h.id || idx} // key는 고유한 값이어야 합니다. h.id가 있다면 h.id를 사용하는 것이 좋습니다.
              className="subscription-history-item"
            >
              <div className="subscription-history-item-plan-name">
                {h.planName}
              </div>
              <div className="subscription-history-item-duration">
                {new Date(h.subscribedAt).toLocaleDateString()} ~ {new Date(h.expiresAt).toLocaleDateString()}
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