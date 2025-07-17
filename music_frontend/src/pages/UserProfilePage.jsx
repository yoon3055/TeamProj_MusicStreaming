// src/pages/UserProfilePage.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios'; // 🌐 백엔드 통신을 위한 axios 임포트
import { AuthContext } from '../context/AuthContext'; // 🌐 AuthContext 임포트

import '../styles/UserProfilePage.css'; // ✨ CSS 파일 임포트

const UserProfilePage = () => {
  // 🌐 AuthContext에서 사용자 정보를 가져옵니다.
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false); // 수정 모드 여부
  const [nickname, setNickname] = useState(''); // 수정 중인 닉네임
  const [loading, setLoading] = useState(true); // 🌐 로딩 상태 추가
  const [error, setError] = useState(null); // 🌐 에러 상태 추가

  const token = localStorage.getItem('token');

  // 🌐 프로필 정보 가져오기
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
      setNickname(res.data.nickname);
      console.log("🌐 사용자 프로필 로드 성공:", res.data);
    } catch (err) {
      console.error('🌐 프로필 가져오기 실패:', err);
      setError('프로필을 불러오는 데 실패했습니다.');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
      setProfile(null);
      setError('로그인 후 프로필을 확인할 수 있습니다.');
    }
  }, [user, fetchProfile]);

  // 🌐 프로필 업데이트 핸들러
  const handleUpdate = useCallback(async (e) => {
    e.preventDefault();
    if (!profile) return;

    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/me`,
        { nickname },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile({ ...profile, nickname });
      setEditMode(false);
      alert('프로필이 성공적으로 업데이트되었습니다!');
      console.log("🌐 프로필 업데이트 성공:", nickname);
    } catch (err) {
      alert('프로필 업데이트 실패: ' + (err.response?.data?.message || err.message));
      console.error('🌐 프로필 업데이트 오류:', err);
    }
  }, [profile, nickname, token]);

  if (loading) {
    return (
      <div className="user-profile-page-loading">
        프로필을 불러오는 중입니다...
      </div>
    );
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
      <div className="user-profile-card">
        <h2 className="user-profile-title">내 프로필</h2>

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
            <div className="user-profile-buttons">
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="user-profile-cancel-button"
              >
                취소
              </button>
              <button
                type="submit"
                className="user-profile-save-button"
              >
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
            {/* 🌐 구독 정보 (선택 사항) */}
            {profile.subscriptionStatus && (
              <p className="user-profile-text">
                <strong className="user-profile-label-strong">구독 상태:</strong>{' '}
                <span className={`user-profile-subscription-status ${profile.subscriptionStatus === 'active' ? 'status-active' : 'status-inactive'}`}>
                  {profile.subscriptionStatus === 'active' ? '활성' : '비활성'}
                </span>
              </p>
            )}
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
    </div>
  );
};

export default UserProfilePage;