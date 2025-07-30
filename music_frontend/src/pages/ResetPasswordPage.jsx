import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ResetPasswordPage.css'; // 로그인 페이지와 동일한 CSS 사용

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const token = searchParams.get('token'); // 이메일 링크 방식용 토큰

  useEffect(() => {
    if (!token) {
      setMessage('비밀번호 재설정 토큰이 유효하지 않습니다.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setMessage('모든 필드를 입력해주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      // 실제 API 연동 시 아래 URL 수정
      const response = await axios.post('/api/auth/reset-password', {
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
    }
  };

  return (
    <div className="login-page">
      <div className="login-form-container">
        <h2 className="login-title">비밀번호 재설정</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="newPassword">새 비밀번호</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="새 비밀번호 입력"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호 다시 입력"
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            비밀번호 재설정
          </button>

          {message && <p className="form-message">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
