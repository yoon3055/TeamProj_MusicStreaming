import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import '../styles/LoginPage.css'; // LoginPage.css 재사용

const SignupSchema = Yup.object().shape({
  email: Yup.string().email('올바른 이메일을 입력하세요').required('이메일은 필수입니다'),
  nickname: Yup.string().min(2, '닉네임은 2자 이상이어야 합니다').required('닉네임은 필수입니다'),
  password: Yup.string().min(8, '비밀번호는 8자 이상이어야 합니다').required('비밀번호는 필수입니다'),
});

const SignupPage = () => {
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
        alert(`${provider === 'kakao' ? '카카오' : 'Google'} 회원가입 성공!`);
        navigate('/');
      } catch (err) {
        console.error(`${provider} 회원가입 실패:`, err);
        alert(`${provider === 'kakao' ? '카카오' : 'Google'} 회원가입에 실패했습니다.`);
      }
    }
  };

  React.useEffect(() => {
    handleOAuth2Redirect();
  }, []);

  return (
    <div className="signup-page-container">
      <div className="signup-box">
        <Link to="/" className="logo-link">
          <img src="/logo.png" alt="FLO 로고" className="logo-image" />
        </Link>

        <Formik
          initialValues={{ email: '', nickname: '', password: '' }}
          validationSchema={SignupSchema}
          onSubmit={async (values, { setSubmitting, setFieldError }) => {
            try {
              const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080';
              const res = await axios.post(`${apiUrl}/user/create`, values);
              localStorage.setItem('jwt', res.data.token); // JWT 저장
              alert('회원가입이 완료되었습니다.');
              navigate('/'); // 홈으로 이동
            } catch (err) {
              console.error('API 호출 실패:', err);
              setFieldError('email', err.response?.data?.message || '회원가입에 실패했습니다.');
              setFieldError('nickname', ' ');
              setFieldError('password', ' ');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="signup-form">
              <h2 className="form-title">회원가입</h2>

              <div className="form-group">
                <Field
                  type="email"
                  name="email"
                  placeholder="이메일"
                  className="form-input"
                />
                <ErrorMessage name="email" component="div" className="form-error" />
              </div>

              <div className="form-group">
                <Field
                  type="text"
                  name="nickname"
                  placeholder="닉네임"
                  className="form-input"
                />
                <ErrorMessage name="nickname" component="div" className="form-error" />
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

              <button type="submit" disabled={isSubmitting} className="form-button">
                {isSubmitting ? '가입 중...' : '회원가입'}
              </button>

              <div className="form-links">
                <p>
                  이미 계정이 있으신가요?{' '}
                  <Link to="/login" className="form-link">로그인</Link>
                </p>
              </div>

              <div className="oauth-login">
                <a href="http://localhost:8080/oauth2/authorization/google" className="oauth-button google-login-button">
                  Google로 회원가입
                </a>
                <a href="http://localhost:8080/oauth2/authorization/kakao" className="oauth-button kakao-login-button">
                  카카오로 회원가입
                </a>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default SignupPage;