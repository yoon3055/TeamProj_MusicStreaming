import React, { useContext, useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Admin.css';

// API_BASE_URL과 DEV_MODE는 더 이상 이 컴포넌트에서 사용되지 않으므로 제거합니다.
// const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080';
// const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

const AdminPrivateRoute = () => {
  // AuthContext에서 user와 loading 상태만 가져옵니다.
  // logout은 이 컴포넌트에서 직접 사용되지 않으므로 제거합니다.
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    // 1. AuthContext의 로딩이 끝난 후에만 로직을 실행합니다.
    if (loading) {
      console.log('[ADMIN_PRIVATE_ROUTE] AuthProvider is loading, skipping verification.');
      return;
    }

    console.log('[ADMIN_PRIVATE_ROUTE] Starting admin verification, user:', user);

    // 2. DEV_MODE일 경우 무조건 권한을 부여하고 함수를 종료합니다.
    const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';
    if (DEV_MODE) {
      console.log('[ADMIN_PRIVATE_ROUTE] DEV_MODE enabled, bypassing admin verification.');
      setIsAuthorized(true);
      return;
    }

    // 3. user 객체가 존재하고 역할이 'ADMIN'인지 확인합니다.
    if (user && user.role === 'ADMIN') {
      console.log('[ADMIN_PRIVATE_ROUTE] User is an admin. Access granted.');
      setIsAuthorized(true);
    } else {
      console.log('[ADMIN_PRIVATE_ROUTE] Unauthorized. Redirecting...');
      setIsAuthorized(false);
    }
  }, [loading, user]); // loading과 user 상태가 변경될 때만 useEffect를 재실행합니다.

  // 로딩 중이거나 권한 확인 전에는 로딩 UI를 렌더링합니다.
  if (loading || isAuthorized === null) {
    console.log('[ADMIN_PRIVATE_ROUTE] Loading or awaiting authorization...');
    return <div className="admin-loading">로딩 중...</div>;
  }

  // 권한이 없을 경우 로그인 페이지로 리다이렉트합니다.
  if (!isAuthorized) {
    console.log('[ADMIN_PRIVATE_ROUTE] Unauthorized, redirecting to /login.');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 권한이 있을 경우 자식 컴포넌트(관리자 페이지)를 렌더링합니다.
  return <Outlet />;
};

export default AdminPrivateRoute;