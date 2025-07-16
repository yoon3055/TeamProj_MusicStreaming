// src/pages/LoginPage.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // 🌐 AuthContext 임포트
import { useNavigate, Link } from 'react-router-dom'; // Link 컴포넌트 임포트
import { Formik, Form, Field, ErrorMessage } from 'formik'; // Formik 관련 컴포넌트 임포트
import * as Yup from 'yup'; // Yup 유효성 검사 스키마 임포트
import axios from 'axios'; // 🌐 백엔드 통신을 위한 axios 임포트

import '../styles/LoginPage.css'; // ✨ CSS 파일 임포트

// Yup을 사용한 로그인 폼 유효성 검사 스키마
const LoginSchema = Yup.object().shape({
  identifier: Yup.string().required('이메일 또는 닉네임은 필수입니다.'),
  password: Yup.string().required('비밀번호는 필수입니다.'),
});

const LoginPage = () => {
  // 🌐 AuthContext에서 로그인 함수를 가져옵니다.
  const { login } = useContext(AuthContext);
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅

  return (
    <div className="login-page-container"> {/* ✨ 클래스 적용 */}
      <Formik
        initialValues={{ identifier: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={async (values, { setSubmitting, setFieldError }) => {
          setSubmitting(true);
          try {
            // 🌐 login 함수 호출 (백엔드 통신 포함)
            const success = await login({ identifier: values.identifier, password: values.password });
            if (success) {
              navigate('/'); // 로그인 성공 시 메인 페이지로 이동
            } else {
              // login 함수가 false를 반환하거나 에러를 throw하지 않을 경우
              setFieldError('identifier', '로그인 정보가 올바르지 않습니다.');
              setFieldError('password', ' '); // 비밀번호 필드에도 에러 표시
            }
          } catch (err) {
            // 🌐 백엔드에서 받은 에러 메시지를 표시하거나 일반적인 메시지 표시
            setFieldError('identifier', err.response?.data?.message || '로그인 실패: 서버 오류');
            setFieldError('password', ' ');
            console.error('🌐 로그인 오류:', err);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="login-form"> {/* ✨ 클래스 적용 */}
            <h2 className="login-title">로그인</h2> {/* ✨ 클래스 적용 */}

            {/* 이메일 또는 닉네임 입력 필드 */}
            <div className="form-group">
              <Field
                type="text"
                name="identifier"
                placeholder="이메일 또는 닉네임"
                className="login-input" /* ✨ 클래스 적용 */
                aria-label="이메일 또는 닉네임"
              />
              <ErrorMessage name="identifier" component="div" className="form-error-message" /> {/* ✨ 클래스 적용 */}
            </div>

            {/* 비밀번호 입력 필드 */}
            <div className="form-group">
              <Field
                type="password"
                name="password"
                placeholder="비밀번호"
                className="login-input login-input-password" /* ✨ 클래스 적용 */
                aria-label="비밀번호"
              />
              <ErrorMessage name="password" component="div" className="form-error-message" /> {/* ✨ 클래스 적용 */}
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="login-button" /* ✨ 클래스 적용 */
            >
              {isSubmitting ? '로그인 중...' : '로그인'}
            </button>

            {/* 추가 링크 (회원가입, 비밀번호 찾기) */}
            <div className="login-links-container"> {/* ✨ 클래스 적용 */}
              <p className="login-link-text">
                계정이 없으신가요?{' '}
                <Link to="/signup" className="login-link">회원가입</Link> {/* ✨ 클래스 적용 */}
              </p>
              <p className="login-link-text login-link-text-margin-top">
                <Link to="/forgot-password" className="login-link">비밀번호를 잊으셨나요?</Link> {/* ✨ 클래스 적용 */}
              </p>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default LoginPage;