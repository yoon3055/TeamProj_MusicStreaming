import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

import '../styles/SignupPage.css';

const SignupSchema = Yup.object().shape({
  email: Yup.string().email('올바른 이메일을 입력하세요').required('이메일은 필수입니다'),
  nickname: Yup.string().min(2, '닉네임은 2자 이상이어야 합니다').required('닉네임은 필수입니다'),
  password: Yup.string().min(8, '비밀번호는 8자 이상이어야 합니다').required('비밀번호는 필수입니다'),
});

const SignupPage = () => {
  const navigate = useNavigate();

  return (
    <div className="signup-page-container">
      <div className="signup-box">
        <Link to="/" className="logo-link">
          <img src="/logo.png" alt="FLO 로고" className="logo-image" />
        </Link>

        <h2 className="form-title">회원가입</h2>
        <Formik
          initialValues={{ email: '', nickname: '', password: '' }}
          validationSchema={SignupSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080';
              await axios.post(`${apiUrl}/user/create`, values);
              alert('회원가입이 완료되었습니다. 로그인해주세요.');
              navigate('/login');
            } catch (err) {
              // 백엔드에서 error 메시지를 { message: '...' } 형태로 보내준다고 가정
              alert('회원가입 실패: ' + (err.response?.data?.message || err.message));
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="signup-form">
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
            </Form>
          )}
        </Formik>

        <div className="form-links">
          <p>
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="form-link">로그인</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
