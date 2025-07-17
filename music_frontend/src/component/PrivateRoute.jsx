import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // 로딩 중일 때는 null 반환(로딩 UI는 레이아웃에서 처리)
  if (loading) return null;

  // 로그인 안 되어 있으면 로그인 페이지로 리다이렉트
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 로그인 되어 있으면 children 렌더링
  return children;
};

export default PrivateRoute;
