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

  return (
    <div className="login-page-container">
      <div className="login-box">
        {/* 로고를 박스 내부 상단에 배치 */}
        <Link to="/" className="logo-link">
          <img src="/logo.png" alt="FLO 로고" className="logo-image" />
        </Link>

        <Formik
          initialValues={{ identifier: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={async (values, { setSubmitting, setFieldError }) => {
            setSubmitting(true);
            try {
              await axios.post('/api/login', values); // 실제 API 주소로 변경
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

              {/* 비밀번호 찾기 링크를 입력칸 바로 아래 오른쪽에 배치 */}
              <div className="forgot-password-link">
                <Link to="/forgot-password">비밀번호를 잊으셨나요?</Link>
              </div>

              <button type="submit" disabled={isSubmitting} className="form-button">
                {isSubmitting ? '로그인 중...' : '로그인'}
              </button>

              <div className="form-links">
                <p>
                  계정이 없으신가요?{' '}
                  <Link to="/signup" className="form-link">회원가입</Link>
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