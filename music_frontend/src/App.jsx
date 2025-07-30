import React, { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import AppRoutes from './AppRoutes';

function App() {
  const { loading } = useContext(AuthContext);

  // AuthProvider가 로딩 중일 땐 아무것도 렌더링하지 않음
  if (loading) return <div>로딩 중...</div>;

  return <AppRoutes />;
}

export default App;