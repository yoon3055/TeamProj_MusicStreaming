// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { MusicPlayerProvider } from './context/MusicPlayerContext';

import MainLayout from './component/MainLayout';
import PrivateRoute from './component/PrivateRoute';

// 페이지 임포트
import MainPage from './pages/MainPage';
import RecommendPage from './pages/RecommendPage';
import { AlbumDetailPage } from './pages/AlbumDetailPage';
import ArtistPage from './pages/ArtistPage';
import UserProfilePage from './pages/UserProfilePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AlbumArtPage from './pages/AlbumIconPage';
import CommentsPage from './pages/CommentsPage';
import HistoryPage from './pages/HistoryPage';
import LikesFollowsPage from './pages/LikesFollowsPage';
import PaymentFailPage from './pages/PaymentFailPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import { PurchasePage } from './pages/PurchasePage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { UserSubscriptionHistory } from './pages/UserSubscriptionHistoryPage';
import LibraryPage from './pages/LibraryPage';
import AdvancedSearchPage from './pages/AdvancedSearchPage';
import RankingPage from './pages/RankingPage';

// PlaylistDrawer 컴포넌트 임포트 (라우팅 가능한 페이지로 사용)
import PlaylistDrawer from './component/PlaylistDrawer';

// ✨✨✨✨✨ CSS 파일 임포트 추가 ✨✨✨✨✨
// 가장 전역적이고 공통적인 스타일부터 먼저 로드합니다.
import './styles/MainLayout.css';        // 전역 CSS 변수 (var(--flo-...) 등) 및 메인 레이아웃 스타일
import './styles/AlbumCardPage.css';        // Albumcard 컴포넌트의 스타일
import './styles/PlaylistDrawer.css';   // PlaylistDrawer 컴포넌트의 스타일 (캐러셀용)
import './styles/PlaylistPage.css';     // PlaylistPage 컴포넌트의 스타일 (텍스트 목록용)
import './styles/RecommendPage.css';    // RecommendPage 컴포넌트의 스타일 (캐러셀, 그리드 등)
import './styles/SidebarContent.css';   // SidebarContent 컴포넌트의 스타일 (사이드바 전체 구조)


const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <MainLayout />,
      children: [
        { index: true, element: <MainPage /> },
        { path: 'explore', element: <RankingPage /> },
        { path: 'library', element: <PrivateRoute element={<LibraryPage />} /> },
        { path: 'advanced-search', element: <AdvancedSearchPage /> },
        // ✨ 중복된 라우트 정의 제거 (아래 줄은 유지, 위에 중복된 줄을 삭제해야 함)
        { path: 'playlists/featured', element: <PlaylistDrawer title="추천 테마 플레이리스트" /> },
        { path: 'subscription-plans', element: <PrivateRoute element={<SubscriptionPage />} /> },
        { path: 'my-subscription', element: <PrivateRoute element={<UserSubscriptionHistory />} /> },
        { path: 'recommend', element: <RecommendPage /> },
        { path: 'profile', element: <PrivateRoute element={<UserProfilePage />} /> },
        { path: 'album/:id', element: <AlbumDetailPage /> },
        { path: 'artist/:id', element: <ArtistPage /> },
        { path: 'history', element: <PrivateRoute element={<HistoryPage />} /> },
        { path: 'purchase', element: <PrivateRoute element={<PurchasePage />} /> },
        { path: 'subscription', element: <PrivateRoute element={<SubscriptionPage />} /> },
        { path: 'art', element: <AlbumArtPage /> },
        { path: 'likes', element: <LikesFollowsPage /> },
        { path: 'comments', element: <CommentsPage /> },
        { path: 'payment-success', element: <PaymentSuccessPage /> },
        { path: 'payment-fail', element: <PaymentFailPage /> },

        { path: '*', element: <Navigate to="/" replace /> },
      ],
    },
    { path: '/login', element: <LoginPage /> },
    { path: '/signup', element: <SignupPage /> },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <MusicPlayerProvider>
        <RouterProvider router={router} />
      </MusicPlayerProvider>
    </AuthProvider>
  </React.StrictMode>
);  