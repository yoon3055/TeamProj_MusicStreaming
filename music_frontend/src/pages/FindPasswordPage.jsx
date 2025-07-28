import React, { useState } from 'react';
import axios from 'axios';
import '../styles/FindPasswordPage.css';  // 로그인 페이지 CSS 그대로 사용

const FindPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [mode, setMode] = useState('email'); // 'email' or 'nickname'
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      if (mode === 'email') {
        // 1번 방식 - 이메일로 비밀번호 재설정 링크 전송 API 호출
        await axios.post('http://localhost:8080/api/auth/password-reset-request', { email });
        setMessage('비밀번호 재설정 링크가 이메일로 전송되었습니다.');
      } else {
        // 2번 방식 - 이메일 + 닉네임으로 비밀번호 초기화 API 호출
        await axios.post('http://localhost:8080/api/auth/password-reset-by-nickname', { email, nickname });
        setMessage('비밀번호 재설정이 완료되었습니다. 로그인해 주세요.');
      }
    } catch (error) {
      setMessage('오류가 발생했습니다. 다시 시도해 주세요.');
      console.error(error);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-box">
        <h2 className="form-title">비밀번호 찾기</h2>
        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
<button
  type="button"
  onClick={() => setMode('email')}
  className={`mode-toggle-button ${mode === 'email' ? 'active' : ''}`}
>
  이메일로 찾기
</button>

<button
  type="button"
  onClick={() => setMode('nickname')}
  className={`mode-toggle-button ${mode === 'nickname' ? 'active' : ''}`}
>
  닉네임으로 찾기
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
          {mode === 'nickname' && (
            <input
              type="text"
              placeholder="닉네임"
              className="form-input"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
          )}
          <button type="submit" className="form-button" style={{ marginTop: '1rem' }}>
            비밀번호 찾기
          </button>
        </form>

        {message && <div style={{ marginTop: '1rem', textAlign: 'center', color: '#44308a' }}>{message}</div>}
      </div>
    </div>
  );
};

export default FindPasswordPage;
