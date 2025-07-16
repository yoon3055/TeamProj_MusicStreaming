// src/pages/SignupPage.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios'; // 🌐 백엔드 통신을 위한 axios 임포트

import '../styles/SignupPage.css'; // ✨ CSS 파일 임포트

// Yup을 사용한 회원가입 폼 유효성 검사 스키마
const SignupSchema = Yup.object().shape({
  email: Yup.string().email('올바른 이메일을 입력하세요').required('이메일은 필수입니다'),
  nickname: Yup.string().min(2, '닉네임은 2자 이상이어야 합니다').required('닉네임은 필수입니다'),
  password: Yup.string().min(8, '비밀번호는 8자 이상이어야 합니다').required('비밀번호는 필수입니다'),
});

export const SignupPage = () => {
  const navigate = useNavigate();

  return (
    <div className="signup-page-container"> {/* ✨ 클래스 적용 */}
      <div className="signup-card"> {/* ✨ 클래스 적용 */}
        <h2 className="signup-title">회원가입</h2> {/* ✨ 클래스 적용 */}
        <Formik
          initialValues={{ email: '', nickname: '', password: '' }}
          validationSchema={SignupSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              // 🌐 백엔드 API 호출: 회원가입
              await axios.post(`${process.env.REACT_APP_API_URL}/api/users/signup`, values);
              alert('회원가입이 완료되었습니다. 로그인해주세요.');
              console.log("🌐 회원가입 성공:", values);
              navigate('/login');
            } catch (err) {
              alert('회원가입 실패: ' + (err.response?.data?.message || err.message));
              console.error('🌐 회원가입 오류:', err);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="signup-form"> {/* ✨ 클래스 적용 */}
              <div className="form-group">
                <Field
                  type="email"
                  name="email"
                  placeholder="이메일"
                  className="signup-input" /* ✨ 클래스 적용 */
                />
                <ErrorMessage name="email" component="div" className="form-error-message" />
              </div>
              <div className="form-group">
                <Field
                  type="text"
                  name="nickname"
                  placeholder="닉네임"
                  className="signup-input" /* ✨ 클래스 적용 */
                />
                <ErrorMessage name="nickname" component="div" className="form-error-message" />
              </div>
              <div className="form-group">
                <Field
                  type="password"
                  name="password"
                  placeholder="비밀번호"
                  className="signup-input" /* ✨ 클래스 적용 */
                />
                <ErrorMessage name="password" component="div" className="form-error-message" />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="signup-button" /* ✨ 클래스 적용 */
              >
                {isSubmitting ? '가입 중...' : '회원가입'}
              </button>
            </Form>
          )}
        </Formik>

        {/* 로그인 페이지로 이동하는 링크 */}
        <div className="signup-links-container"> {/* ✨ 클래스 적용 */}
          <p className="signup-link-text">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="signup-link">로그인</Link> {/* ✨ 클래스 적용 */}
          </p>
        </div>
      </div>
    </div>
  );
};