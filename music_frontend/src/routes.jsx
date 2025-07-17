// src/routes.jsx
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

import MainLayout from './component/MainLayout';
import PrivateRoute from './component/PrivateRoute';

import MainPage from './pages/MainPage';
import LibraryPage from './pages/LibraryPage';
import LoginPage from './pages/LoginPage';

// 라우터 설정 정의
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,   // 기본 레이아웃 컴포넌트
    children: [
      { index: true, element: <MainPage /> },  // '/' 경로, 기본 페이지

      // PrivateRoute를 래핑하여 로그인한 사용자만 접근 가능하도록
      {
        path: 'library',
        element: (
          <PrivateRoute>
            <LibraryPage />
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
]);

export default router;
