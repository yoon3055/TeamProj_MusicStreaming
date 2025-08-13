import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/FindPasswordPage.css';

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080';

const FindPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mode, setMode] = useState('email'); // 'email' or 'manual'
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    if (mode === 'manual' && newPassword !== confirmPassword) {
      setMessage('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'email') {
        await axios.post(`${API_BASE_URL}/api/auth/password-reset-request`, { email });
        setMessage('비밀번호 재설정 링크가 이메일로 전송되었습니다.');
      } else {
        await axios.post(`${API_BASE_URL}/api/auth/manual-reset-password`, { 
          email, 
          nickname,
          password: newPassword,
        });
        setMessage('비밀번호 재설정이 완료되었습니다. 로그인해 주세요.');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || '오류가 발생했습니다. 입력 정보를 확인해 주세요.';
      setMessage(errorMsg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-box">
        <img
          src="/images/logo.png"
          alt="로고"
          style={{
            display: 'block',
            width: '150px',
            margin: '0 auto 20px',
          }}
        />
        <h2 className="form-title">비밀번호 찾기</h2>
        <div className="mode-toggle-container">
          <button
            type="button"
            onClick={() => setMode('email')}
            className={`mode-toggle-button ${mode === 'email' ? 'active' : ''}`}
          >
            이메일로 찾기
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`mode-toggle-button ${mode === 'manual' ? 'active' : ''}`}
          >
            닉네임으로 재설정
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="이메일 주소"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {mode === 'manual' && (
            <>
              <input
                type="text"
                placeholder="닉네임"
                className="form-input"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="새 비밀번호"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="새 비밀번호 확인"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </>
          )}
          <button type="submit" className="form-button" style={{ marginTop: '1rem' }} disabled={loading}>
            {loading ? '처리 중...' : '비밀번호 찾기'}
          </button>
        </form>
        {message && <div className="form-message">{message}</div>}
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Link to="/login" className="form-link">로그인 페이지로 돌아가기</Link>
        </div>
      </div>
    </div>
  );
};

export default FindPasswordPage;