import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import '../styles/SignupPage.css';

const SignupSchema = Yup.object().shape({
  email: Yup.string().email('올바른 이메일을 입력하세요').required('이메일은 필수입니다'),
  nickname: Yup.string().min(2, '닉네임은 최소 2자 이상입니다').required('닉네임은 필수입니다'),
  password: Yup.string().min(6, '비밀번호는 최소 6자 이상입니다').required('비밀번호는 필수입니다'),
});

const SignupPage = () => {
  const navigate = useNavigate();

  const handleOAuthLogin = (provider) => {
    const baseUrl = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080';
    console.log(`[SIGNUP_PAGE] Redirecting to ${provider} OAuth`);
    window.location.href = `${baseUrl}/oauth2/authorization/${provider}`;
  };

  return (
    <div className="signup-page-container">
      <div className="signup-box">
        <Link to="/" className="logo-link">
          <div className="header-logo-container">
            <div className="music-icon">🎵</div>
            <h2 className="header-app-title">Fruitify</h2>
            <div className="streaming-badge">STREAMING</div>
          </div>
        </Link>
        <h2 className="form-title">회원가입</h2>

        <Formik
          initialValues={{ email: '', nickname: '', password: '' }}
          validationSchema={SignupSchema}
          onSubmit={async (values, { setSubmitting, setFieldError }) => {
            console.log('[SIGNUP_PAGE] Submitting signup form:', values);
            try {
              const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080';
              const res = await axios.post(`${apiUrl}/api/users/register`, values);
              console.log('[SIGNUP_PAGE] Signup successful:', res.data);
              localStorage.setItem('jwt', res.data.token);
              alert('회원가입이 완료되었습니다.');
              navigate('/login');
            } catch (err) {
              console.error('[SIGNUP_PAGE] Signup failed:', err.response?.data || err.message);
              setFieldError('email', err.response?.data?.message || '이메일 오류');
              setFieldError('nickname', ' ');
              setFieldError('password', ' ');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="form-group">
                <Field type="email" name="email" placeholder="이메일" className="form-input" />
                <ErrorMessage name="email" component="div" className="form-error" />
              </div>

              <div className="form-group">
                <Field type="text" name="nickname" placeholder="닉네임" className="form-input" />
                <ErrorMessage name="nickname" component="div" className="form-error" />
              </div>

              <div className="form-group">
                <Field type="password" name="password" placeholder="비밀번호" className="form-input" />
                <ErrorMessage name="password" component="div" className="form-error" />
              </div>

              <button type="submit" className="form-button" disabled={isSubmitting}>
                {isSubmitting ? '가입 중...' : '회원가입'}
              </button>
            </Form>
          )}
        </Formik>



        <div className="form-links">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="form-link">
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;