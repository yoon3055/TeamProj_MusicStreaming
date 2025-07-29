// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthProvider';
import { MusicPlayerProvider } from './context/MusicPlayerProvider';

// Core Layout & Routing Components
import MainLayout from './component/MainLayout';
import PrivateRoute from './component/PrivateRoute';
import SubscriptionRouter from './component/SubscriptionRouter';

// Page Components
import MainPage from './pages/MainPage';
import RecommendPage from './pages/RecommendPage';
import { AlbumDetailPage } from './pages/AlbumDetailPage';
import ArtistPage from './pages/ArtistPage';
import UserProfilePage from './pages/UserProfilePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AlbumArtPage from './pages/AlbumIconPage'; // AlbumIconPage로 파일명 확인
import CommentsPage from './pages/CommentsPage';
import HistoryPage from './pages/HistoryPage';
import LikesFollowsPage from './pages/LikesFollowsPage';
import PaymentFailPage from './pages/PaymentFailPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import { PurchasePage } from './pages/PurchasePage';
import { SubscriptionPage } from './pages/SubscriptionPage'; // 구독 플랜 페이지
import { UserSubscriptionHistory } from './pages/UserSubscriptionHistoryPage'; // 현재 사용되지 않는 것 같으나 임포트 유지
import MyPage from './pages/MyPage';
import AdvancedSearchPage from './pages/AdvancedSearchPage';
import RankingPage from './pages/RankingPage';
import PlaylistDrawer from './component/PlaylistDrawer';
import PlaylistPage from './pages/PlaylistPage'; // PlaylistPage 임포트 추가 (필요시)
import FindPasswordPage from './pages/FindPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PaymentPage from './pages/PaymentPage';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

// CSS Files
import './styles/MainLayout.css';
import './styles/AlbumCardPage.css';
import './styles/PlaylistDrawer.css';
import './styles/PlaylistPage.css';
import './styles/RecommendPage.css';
import './styles/SidebarContent.css';
import './styles/SubscriptionPage.css';
import './styles/UserSubscriptionHistory.css';


const router = createBrowserRouter(
  [
    {
      // 최상위 레이아웃을 MainLayout으로 설정
      path: '/',
      element: <MainLayout />,
      children: [
        { index: true, element: <MainPage /> }, // 메인 페이지
        { path: 'explore', element: <RankingPage /> }, // 탐색/랭킹 페이지
        { path: 'advanced-search', element: <AdvancedSearchPage /> }, // 고급 검색 페이지
        { path: 'playlists/featured', element: <PlaylistDrawer title="추천 테마 플레이리스트" /> }, // 추천 플레이리스트 드로어
        { path: 'recommend', element: <RecommendPage /> }, // 추천 페이지
        { path: 'album/:id', element: <AlbumDetailPage /> }, // 앨범 상세 페이지
        { path: 'artist/:id', element: <ArtistPage /> }, // 아티스트 상세 페이지
        { path: 'art', element: <AlbumArtPage /> }, // 앨범 아트 페이지
        { path: 'likes', element: <LikesFollowsPage /> }, // 좋아요/팔로우 페이지 (공개 가능)
        { path: 'comments', element: <CommentsPage /> }, // 댓글 페이지 (공개 가능)
        { path: 'payment/success', element: <PaymentSuccessPage /> }, // 결제 성공 페이지
        { path: 'payment/fail', element: <PaymentFailPage /> }, // 결제 실패 페이지

        // 인증이 필요한 라우트들을 PrivateRoute 아래의 children으로 이동
        {
          element: <PrivateRoute />, // 여기에 PrivateRoute를 부모 엘리먼트로 설정
          children: [
            { path: 'myPage', element: <MyPage /> }, // 라이브러리 페이지
            { path: 'my-playlists', element: <PlaylistPage /> }, // 내 플레이리스트 페이지
            { path: 'subscription-plans', element: <SubscriptionPage /> }, // 구독 플랜 페이지
            { path: 'subscription', element: <SubscriptionRouter /> }, // 구독 진행 페이지 (구독 라우터 사용)
            { path: 'my-subscription', element: <SubscriptionRouter /> }, // 내 구독 관리 페이지 (구독 라우터 사용)
            { path: 'profile', element: <UserProfilePage /> }, // 사용자 프로필 페이지
            { path: 'history', element: <HistoryPage /> }, // 시청 기록 페이지
            { path: 'purchase', element: <PurchasePage /> }, // 구매 페이지
            { path: '/payment/:planId', element:<PaymentPage  /> }, //구독 구매 페이지 
            
            
          ],
        },
        { path: '*', element: <Navigate to="/" replace /> }, // 존재하지 않는 경로 처리 (메인으로 리다이렉트)
      ],
    },
    // 로그인 및 회원가입 경로는 인증 없이 접근 가능해야 하므로 MainLayout 바깥에 정의
    { path: '/login', element: <LoginPage /> },
    { path: '/signup', element: <SignupPage /> },
    { path: '/find-password', element: <FindPasswordPage /> }, // 비밀번호 찾기 페이지
    { path: '/reset-password', element: <ResetPasswordPage /> }, // 비밀번호 재설정 페이지  
    
  ],
  {
    // React Router v7 버전 대비 future 옵션
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

// 애플리케이션 렌더링
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* AuthProvider로 앱 전체를 감싸서 로그인 정보를 모든 하위 컴포넌트에 전달 */}
    <AuthProvider>
      <MusicPlayerProvider>
        <RouterProvider router={router} />
        <ToastContainer /> {/* 토스트 알림 컴포넌트 추가 */}
      </MusicPlayerProvider>
    </AuthProvider>
  </React.StrictMode>
);