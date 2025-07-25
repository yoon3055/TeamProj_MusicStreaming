// ManualResetPasswordPage.jsx
import React, { useState } from 'react';
import axios from 'axios';

function ManualResetPasswordPage() {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleManualReset = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/manual-reset-password', { nickname, email, password });
      setMessage('비밀번호가 재설정되었습니다.');
    } catch (err) {
        console.error('비밀번호 재설정 실패:', err);
      setMessage('입력 정보를 확인해 주세요.');
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-box">
        <h2 className="form-title">비밀번호 수동 재설정</h2>
        <form onSubmit={handleManualReset}>
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              placeholder="닉네임"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              className="form-input"
              placeholder="이메일 주소"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              className="form-input"
              placeholder="새 비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="form-button">비밀번호 재설정</button>
        </form>
        {message && <p className="form-error">{message}</p>}
      </div>
    </div>
  );
}

export default ManualResetPasswordPage;
