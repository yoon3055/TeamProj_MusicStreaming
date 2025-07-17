// src/pages/SubscriptionPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // 🌐 백엔드 통신을 위한 axios 임포트
import { useNavigate } from 'react-router-dom';

import '../styles/SubscriptionPage.css'; // ✨ CSS 파일 임포트

export const SubscriptionPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  // 🌐 요금제 목록 가져오기
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/subscriptions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlans(res.data);
      console.log("🌐 구독 요금제 로드 성공:", res.data);
    } catch (err) {
      console.error('🌐 요금제 불러오기 실패:', err);
      setError('요금제를 불러오는 데 실패했습니다.');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 🌐 요금제 구독 처리 핸들러
  const handleSubscribe = async (planId) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/subscriptions/subscribe`, { planId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('구독이 완료되었습니다.');
      console.log(`🌐 요금제 ID ${planId} 구독 성공`);
      navigate('/profile');
    } catch (err) {
      alert('구독 실패: ' + (err.response?.data?.message || err.message));
      console.error('🌐 구독 실패:', err);
    }
  };

  if (loading) {
    return (
      <div className="subscription-page-loading">
        요금제를 불러오는 중입니다...
      </div>
    );
  }

  if (error) {
    return (
      <div className="subscription-page-loading subscription-page-error">
        {error}
      </div>
    );
  }

  return (
    <div className="subscription-page-container">
      <h2 className="subscription-page-title">구독 요금제</h2>

      <div className="subscription-plans-grid">
        {plans.length === 0 ? (
          <p className="subscription-message">
            표시할 요금제가 없습니다.
          </p>
        ) : (
          plans.map(plan => (
            <div key={plan.id} className="subscription-plan-card">
              <div>
                <h3 className="plan-name">{plan.name}</h3>
                <p className="plan-description">{plan.description}</p>
                <p className="plan-price">
                  ₩ {plan.price?.toLocaleString()} / {plan.durationDays}일
                </p>
                {plan.supportsHighQuality && (
                  <span className="plan-high-quality-badge">
                    고음질 지원
                  </span>
                )}
              </div>
              <button
                className="plan-select-button"
                onClick={() => handleSubscribe(plan.id)}
              >
                이 요금제 선택
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};