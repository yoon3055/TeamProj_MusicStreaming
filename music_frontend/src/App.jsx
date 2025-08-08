import React, { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { RouterProvider } from 'react-router-dom';
import router from './main';
import ToastNotification from './component/ToastNotification'; // ✅ import 추가

function App() {
  const { loading } = useContext(AuthContext);

  if (loading) return <div className="admin-loading">로딩 중...</div>;

  return (
    <>
      <ToastNotification /> {/* ✅ 반드시 렌더링 */}
      <RouterProvider router={router} />
    </>
  );
}

export default App;