import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Equalizer from '../component/Equalizer';

import '../styles/UserProfilePage.css';

const UserProfilePage = () => {
  const { user, isSubscribed, setIsSubscribed, subscriptionDetails, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const jwt = localStorage.getItem('jwt');

  const fetchProfile = useCallback(async () => {
    if (!jwt) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // API 호출 주석 처리
      /*
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setProfile(res.data);
      setNickname(res.data.nickname);
      */
      setProfile({ email: user.email, nickname: user.nickname, subscriptionStatus: isSubscribed ? 'active' : 'inactive' });
      setNickname(user.nickname);
    } catch {
      setError('프로필을 불러오는 데 실패했습니다.');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [jwt, user, isSubscribed]);

  const fetchHistory = useCallback(async () => {
    if (!jwt) return;
    try {
      // API 호출 주석 처리
      /*
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/subscriptions/history`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setHistory(res.data);
      */
      setHistory([
        {
          id: 'sub_001',
          planName: 'Premium',
          subscribedAt: '2025-06-01T00:00:00Z',
          expiresAt: '2025-07-01T00:00:00Z',
          price: 14900,
        },
      ]);
    } catch {
      setHistory([]);
    }
  }, [jwt]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchHistory();
    } else {
      setLoading(false);
      setError('로그인 후 프로필을 확인할 수 있습니다.');
    }
  }, [user, fetchProfile, fetchHistory]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!profile) return;
    try {
      // API 호출 주석 처리
      /*
      const updateData = { nickname };
      if (password) updateData.password = password;
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/me`,
        updateData,
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      */
      setProfile({ ...profile, nickname });
      setEditMode(false);
      setPassword('');
      alert('프로필이 성공적으로 업데이트되었습니다!');
    } catch (err) {
      alert('프로필 업데이트 실패: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUnsubscribe = async () => {
    if (!jwt) {
      setError('로그인이 필요합니다.');
      return;
    }
    try {
      // API 호출 주석 처리
      /*
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/subscriptions/unsubscribe`,
        {},
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      */
      setIsSubscribed(false);
      setProfile({ ...profile, subscriptionStatus: 'inactive' });
      alert('구독이 해지되었습니다.');
      navigate('/subscription');
    } catch (err) {
      alert('구독 해지 실패: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleExtend = () => {
    if (subscriptionDetails?.planId) {
      navigate(`/payment/${subscriptionDetails.planId}`);
    } else {
      navigate('/subscription-plans');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="user-profile-page-loading">프로필을 불러오는 중입니다...</div>;
  }

  if (error || !profile) {
    return (
      <div className="user-profile-page-loading user-profile-page-error">
        {error || '프로필을 불러올 수 없습니다. 로그인 상태를 확인해주세요.'}
      </div>
    );
  }

  return (
    <div className="user-profile-page-container">
      <div className="user-profile-edit-section">
        <h2 className="user-profile-title">내 프로필</h2>
        {/* 구독 상태 */}
        <div className="user-profile-section">
          <h3 className="user-profile-section-title">구독 관리</h3>
          <p className="user-profile-text">
            <span className={`user-profile-subscription-status ${profile.subscriptionStatus === 'active' ? 'status-active' : 'status-inactive'}`}>
              {profile.subscriptionStatus === 'active' ? '활성화 : 구독 중' : '비활성화 : 구독 없음'}
            </span>
          </p>
          <Equalizer mode="linked" isPlaying={profile.subscriptionStatus === 'active'} />
          {profile.subscriptionStatus === 'active' && (
            <div className="subscription-actions">
              <button onClick={handleExtend} className="subscription-extend-button">
                구독 연장
              </button>
              <button onClick={handleUnsubscribe} className="unsubscribe-button">
                구독 해지
              </button>
            </div>
          )}
        </div>
        {/* 닉네임/비밀번호 변경 */}
        <div className="user-profile-section">
          <h3 className="user-profile-section-title">닉네임/비밀번호 변경</h3>
          {editMode ? (
            <form onSubmit={handleUpdate} className="user-profile-form">
              <div className="form-group">
                <label htmlFor="nickname" className="user-profile-label">닉네임:</label>
                <input
                  type="text"
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="user-profile-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password" className="user-profile-label">새 비밀번호:</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="user-profile-input"
                  placeholder="변경 시 입력"
                />
              </div>
              <div className="user-profile-buttons">
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setPassword('');
                  }}
                  className="user-profile-cancel-button"
                >
                  취소
                </button>
                <button type="submit" className="user-profile-save-button">
                  저장
                </button>
              </div>
            </form>
          ) : (
            <div className="user-profile-display-info">
              <p className="user-profile-text">
                <strong className="user-profile-label-strong">이메일:</strong> {profile.email}
              </p>
              <p className="user-profile-text">
                <strong className="user-profile-label-strong">닉네임:</strong> {profile.nickname}
              </p>
              <div className="user-profile-edit-button-wrapper">
                <button
                  onClick={() => setEditMode(true)}
                  className="user-profile-edit-button"
                >
                  프로필 수정
                </button>
              </div>
            </div>
          )}
        </div>
        {/* 구독 이력 */}
        <div className="user-profile-section">
          <h3 className="user-profile-section-title">구독 이력</h3>
          <ul className="subscription-list">
            {history.length === 0 ? (
              <li className="subscription-empty">구독 이력이 없습니다.</li>
            ) : (
              history.slice(0, 3).map((h, idx) => (
                <li key={h.id || idx} className="subscription-item">
                  <div className="subscription-item-plan-name">{h.planName}</div>
                  <div className="subscription-item-duration">
                    {new Date(h.subscribedAt).toLocaleDateString()} ~{' '}
                    {new Date(h.expiresAt).toLocaleDateString()}
                  </div>
                  <div className="subscription-item-price">
                    ₩ {h.price?.toLocaleString()}
                  </div>
                </li>
              ))
            )}
          </ul>
          <div className="user-profile-edit-button-wrapper">
            <button
              onClick={() => navigate('/my-subscription')}
              className="user-profile-edit-button"
            >
              전체 이력 보기
            </button>
          </div>
        </div>
        {/* 기타 기능 */}
        <div className="user-profile-section">
          <h3 className="user-profile-section-title">기타 기능</h3>
          <p className="user-profile-text">다양한 설정 및 관리 옵션</p>
          <div className="user-profile-edit-button-wrapper">
            <button onClick={handleLogout} className="user-profile-edit-button">
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;