import React, { useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/LoginPage.css';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('유효한 이메일 주소를 입력해주세요.')
    .required('이메일은 필수입니다.'),
  password: Yup.string()
    .required('비밀번호는 필수입니다.'),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080';

  const handleOAuth2Redirect = useCallback(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const provider = urlParams.get('state');

    if (code && provider) {
      console.log(`[LOGIN_PAGE] Handling ${provider} OAuth redirect, code:`, code);
      try {
        const endpoint = provider === 'kakao' ? '/user/kakao/doLogin' : '/login/oauth2/code/google';
        const res = await axios.get(`${API_BASE_URL}${endpoint}?code=${code}`);
        console.log(`[LOGIN_PAGE] ${provider} OAuth response:`, res.data);

        const token = res.data.token;
        if (token) {
          localStorage.setItem('jwt', token); // 토큰 먼저 저장
          await login({ identifier: res.data.user?.email || '', password: '' });
          alert(`${provider === 'kakao' ? '카카오' : 'Google'} 로그인 성공!`);
          navigate('/');
        } else {
          throw new Error('No token received');
        }
      } catch (err) {
        console.error(`[LOGIN_PAGE] ${provider} 로그인 실패:`, err.response?.data || err.message);
        alert(`${provider === 'kakao' ? '카카오' : 'Google'} 로그인에 실패했습니다.`);
      }
    }
  }, [API_BASE_URL, navigate, login]);

  useEffect(() => {
    console.log('[LOGIN_PAGE] Checking for OAuth redirect');
    handleOAuth2Redirect();
    
    // 크롬 비밀번호 경고창 비활성화
    const disablePasswordManager = () => {
      // 모든 password input 필드에 속성 추가
      const passwordInputs = document.querySelectorAll('input[type="password"]');
      passwordInputs.forEach(input => {
        input.setAttribute('autocomplete', 'new-password');
        input.setAttribute('data-lpignore', 'true');
        input.setAttribute('data-form-type', 'other');
      });
      
      // 모든 email input 필드에 속성 추가
      const emailInputs = document.querySelectorAll('input[type="email"]');
      emailInputs.forEach(input => {
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('data-lpignore', 'true');
      });
    };
    
    // DOM이 로드된 후 실행
    setTimeout(disablePasswordManager, 100);
    
    // 폼 변경 시에도 실행
    const observer = new MutationObserver(disablePasswordManager);
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }
    
    return () => observer.disconnect();
  }, [handleOAuth2Redirect]);

  return (
    <div className="login-page-container">
      <div className="login-box">
        <Link to="/" className="logo-link">
          <div className="header-logo-container">
            <div className="music-icon">🎵</div>
            <h2 className="header-app-title">Fruitify</h2>
            <div className="streaming-badge">STREAMING</div>
          </div>
        </Link>

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={async (values, { setSubmitting, setFieldError }) => {
            console.log('[LOGIN_PAGE] Submitting login form:', values);
            setSubmitting(true);
            try {
              const success = await login({ identifier: values.email, password: values.password });
              if (success) {
                console.log('[LOGIN_PAGE] Login successful, redirecting to /');
                alert('로그인 성공!');
                navigate('/');
              } else {
                console.log('[LOGIN_PAGE] Login failed, setting form errors');
                setFieldError('email', '이메일 또는 비밀번호가 올바르지 않습니다.');
                setFieldError('password', ' ');
              }
            } catch (err) {
              console.error('[LOGIN_PAGE] Login error:', err.response?.data || err.message);
              setFieldError('email', err.response?.data?.message || '이메일 또는 비밀번호가 올바르지 않습니다.');
              setFieldError('password', ' ');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="login-form" autoComplete="off">
              <h2 className="form-title">로그인</h2>

              <div className="form-group">
                <Field
                  type="email"
                  name="email"
                  placeholder="이메일"
                  className="form-input"
                  autoComplete="off"
                  data-lpignore="true"
                  data-form-type="other"
                />
                <ErrorMessage name="email" component="div" className="form-error" />
              </div>

              <div className="form-group">
                <Field
                  type="password"
                  name="password"
                  placeholder="비밀번호"
                  className="form-input"
                  autoComplete="new-password"
                  data-lpignore="true"
                  data-form-type="other"
                  data-1p-ignore="true"
                />
                <ErrorMessage name="password" component="div" className="form-error" />
              </div>

              <div className="forgot-password-link">
                <Link to="/find-password" className="forgot-password-link">
                  비밀번호를 잊으셨나요?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="form-button"
              >
                {isSubmitting ? '로그인 중...' : '로그인'}
              </button>

              <div className="form-links">
                <p>
                  계정이 없으신가요?{' '}
                  <Link to="/signup" className="form-link">
                    회원가입
                  </Link>
                </p>
              </div>


            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default LoginPage;