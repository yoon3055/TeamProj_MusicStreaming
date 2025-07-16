// src/component/PrivateRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import PropTypes from 'prop-types';

const PrivateRoute = ({ element }) => {
  // 🌐 AuthContext에서 사용자 정보와 로딩 상태를 가져옵니다.
  const { user, loading } = useContext(AuthContext);

  // 🌐 로딩 중일 때는 아무것도 렌더링하지 않습니다.
  // 로딩 UI는 이제 MainLayout의 LoadingToast가 담당합니다.
  if (loading) {
    return null;
  }

  // 사용자가 로그인되어 있으면 요청된 컴포넌트(element)를 렌더링하고,
  // 그렇지 않으면 /login 페이지로 리다이렉트합니다.
  return user ? element : <Navigate to="/login" />;
};

PrivateRoute.propTypes = {
  element: PropTypes.node.isRequired,
};

export default PrivateRoute;