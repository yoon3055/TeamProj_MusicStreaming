import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import '../styles/LoginPage.css';

const LoginSchema = Yup.object().shape({
  identifier: Yup.string().required('이메일 또는 닉네임은 필수입니다.'),
  password: Yup.string().required('비밀번호는 필수입니다.'),
});

const LoginPage = () => {
  const navigate = useNavigate();

  // OAuth2 리다이렉트 후 토큰 처리 (Google, Kakao 공통)
  const handleOAuth2Redirect = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const provider = urlParams.get('state'); // OAuth2 제공자 식별 (google 또는 kakao)
    if (code && provider) {
      try {
        const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080';
        const endpoint = provider === 'kakao' ? '/user/kakao/doLogin' : '/login/oauth2/code/google';
        const res = await axios.get(`${apiUrl}${endpoint}?code=${code}`);
        localStorage.setItem('jwt', res.data.token);
        alert(`${provider === 'kakao' ? '카카오' : 'Google'} 로그인 성공!`);
        navigate('/');
      } catch (err) {
        console.error(`${provider} 로그인 실패:`, err);
        alert(`${provider === 'kakao' ? '카카오' : 'Google'} 로그인에 실패했습니다.`);
      }
    }
  };

  React.useEffect(() => {
    handleOAuth2Redirect();
  }, []);

  return (
    <div className="login-page-container">
      <div className="login-box">
        <Link to="/" className="logo-link">
          <img src="/logo.png" alt="FLO 로고" className="logo-image" />
        </Link>

        <Formik
          initialValues={{ identifier: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={async (values, { setSubmitting, setFieldError }) => {
            setSubmitting(true);
            try {
              const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080';
              const res = await axios.post(`${apiUrl}/user/doLogin`, values);
              localStorage.setItem('jwt', res.data.token);
              alert('로그인 성공!');
              navigate('/');
            } catch (err) {
              console.error('API 호출 실패:', err);
              setFieldError('identifier', '로그인 정보가 올바르지 않습니다.');
              setFieldError('password', ' ');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="login-form">
              <h2 className="form-title">로그인</h2>

              <div className="form-group">
                <Field
                  type="text"
                  name="identifier"
                  placeholder="이메일 또는 닉네임"
                  className="form-input"
                />
                <ErrorMessage name="identifier" component="div" className="form-error" />
              </div>

              <div className="form-group">
                <Field
                  type="password"
                  name="password"
                  placeholder="비밀번호"
                  className="form-input"
                />
                <ErrorMessage name="password" component="div" className="form-error" />
              </div>

              <div className="forgot-password-link">
                <Link to="/forgot-password">비밀번호를 잊으셨나요?</Link>
              </div>

              <button type="submit" disabled={isSubmitting} className="form-button">
                {isSubmitting ? '로그인 중...' : '로그인'}
              </button>

              <div className="form-links">
                <p>
                  계정이 없으신가요? <Link to="/signup" className="form-link">회원가입</Link>
                </p>
              </div>

              <div className="oauth-login">
                <a href="http://localhost:8080/oauth2/authorization/google" className="oauth-button google-login-button">
                  Google로 로그인
                </a>
                <a href="http://localhost:8080/oauth2/authorization/kakao" className="oauth-button kakao-login-button">
                  카카오로 로그인
                </a>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default LoginPage;