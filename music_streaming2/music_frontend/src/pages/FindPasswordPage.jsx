import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/FindPasswordPage.css';

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080';

const FindPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/api/users/send-password`, { email });
      setMessage('비밀번호 재설정 링크가 이메일로 전송되었습니다.');
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
        <Link to="/" className="header-logo-link" style={{ textDecoration: 'none', display: 'block', margin: '0 auto 20px' }}>
          <div className="header-logo-container" style={{ justifyContent: 'center' }}>
            <div className="music-icon">🎵</div>
            <h2 className="header-app-title">Fruitify</h2>
            <div className="streaming-badge">STREAMING</div>
          </div>
        </Link>
        <h2 className="form-title">비밀번호 찾기</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="이메일 주소"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
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