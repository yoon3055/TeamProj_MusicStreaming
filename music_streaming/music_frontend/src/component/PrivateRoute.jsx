import React, { useContext } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = () => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  console.log('[PRIVATE_ROUTE] loading:', loading, 'user:', user);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (!user) {
    console.log('[PRIVATE_ROUTE] No user, redirecting to /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;