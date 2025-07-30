import React, { useContext } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = () => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();


  if (loading) return null;

  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;  // Outlet으로 자식 라우트 렌더링
};

export default PrivateRoute;
