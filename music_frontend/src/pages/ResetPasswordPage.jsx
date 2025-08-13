import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ResetPasswordPage.css';

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const navigate = useNavigate();

  const token = searchParams.get('token');

  // 컴포넌트 마운트 시 토큰 유효성 검사
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setMessage('비밀번호 재설정 토큰이 없습니다.');
        return;
      }
      try {
        // 백엔드에 토큰 유효성 검사 요청
        await axios.get(`${API_BASE_URL}/api/auth/verify-password-reset-token?token=${token}`);
        setTokenValid(true);
      } catch (error) {
        setMessage('비밀번호 재설정 토큰이 유효하지 않거나 만료되었습니다.');
        console.error('Token verification failed:', error);
      }
    };
    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setMessage('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    // 비밀번호 복잡성 검증 (예시)
    if (newPassword.length < 8) {
      setMessage('비밀번호는 8자 이상이어야 합니다.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
        token,
        newPassword,
      });

      if (response.status !== 200) {
        throw new Error('비밀번호 재설정에 실패했습니다.');
      }
      setMessage('비밀번호가 성공적으로 재설정되었습니다!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || '오류가 발생했습니다.';
      setMessage(`재설정 실패: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="login-page-container">
        <div className="login-box">
          <p className="form-message">{message}</p>
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <Link to="/find-password" className="form-link">비밀번호 찾기 페이지로 돌아가기</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page-container">
      <div className="login-box">
        <h2 className="form-title">비밀번호 재설정</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="password"
              className="form-input"
              placeholder="새 비밀번호 입력 (8자 이상)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              className="form-input"
              placeholder="비밀번호 다시 입력"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="form-button" disabled={loading}>
            {loading ? '재설정 중...' : '비밀번호 재설정'}
          </button>
          {message && <p className="form-message">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;