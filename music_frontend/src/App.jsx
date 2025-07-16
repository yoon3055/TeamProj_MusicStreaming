import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MusicPlayerProvider } from './context/MusicPlayerContext';
import MainLayout from './component/MainLayout';
import PrivateRoute from './component/PrivateRoute';

// 메인 페이지 (RecommendPage를 포함하는 래퍼 역할)
import MainPage from './pages/MainPage';

// 상세 정보 페이지들
import AlbumDetailPage from './pages/AlbumDetailPage';
import ArtistPage from './pages/ArtistPage';

// 사용자 관련 페이지들
import UserProfilePage from './pages/UserProfilePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// 기능성 페이지들
import AlbumArtPage from './pages/AlbumIconPage'; // AlbumIconPage.jsx 파일에 정의된 AlbumArtPage
import CommentsPage from './pages/CommentsPage';
import HistoryPage from './pages/HistoryPage';
import LikesFollowsPage from './pages/LikesFollowsPage';

// 결제 및 구독 관련 페이지들
import PaymentFailPage from './pages/PaymentFailPage';

import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PurchasePage from './pages/PurchasePage';
import SubscriptionPage from './pages/SubscriptionPage';
import UserSubscriptionHistory from './pages/UserSubscriptionHistory';

// ✨ 새로 추가된 페이지들 ✨
import LibraryPage from './pages/LibraryPage'; // 보관함 페이지
import AdvancedSearchPage from './pages/AdvancedSearchPage'; // 고급 검색 페이지
import RecommendPage from './pages/RecommendPage'; // `MainPage` 내에서 렌더링되지만, 명시적 임포트 유지


// 전역 CSS 임포트
import './styles/index.css';

export default function App() {
  return (
    <AuthProvider>
      <MusicPlayerProvider>
        <Router>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<MainPage />} />
              
              {/* ✨ 새로 연결된/추가된 라우트들 ✨ */}
              <Route path="/explore" element={<RecommendPage />} /> {/* '둘러보기'를 RecommendPage로 연결 */}
              <Route path="/library" element={<PrivateRoute element={<LibraryPage />} />} /> {/* '보관함' 페이지 */}
              <Route path="/advanced-search" element={<AdvancedSearchPage />} /> {/* '여러 곡 한 번에 찾기' 페이지 */}
              <Route path="/subscription-plans" element={<PrivateRoute element={<SubscriptionPage />} />} /> {/* '이용권 구매' (SubscriptionPage와 연결) */}
              <Route path="/my-subscription" element={<PrivateRoute element={<UserSubscriptionHistory />} />} /> {/* '내 구독 관리' (UserSubscriptionHistory와 연결) */}
              {/* /playlist /playlist/:id 라우트는 PlaylistPage가 사이드바로 이동했으므로 제거 */}
              {/* <Route path="/recommend" element={<RecommendPage />} /> // MainPage가 RecommendPage를 포함하므로 이 라우트는 이제 불필요 */}

              {/* 기존 라우트들 */}
              <Route path="/profile" element={<PrivateRoute element={<UserProfilePage />} />} />
              <Route path="/album/:id" element={<AlbumDetailPage />} />
              <Route path="/artist/:id" element={<ArtistPage />} />
              <Route path="/history" element={<PrivateRoute element={<HistoryPage />} />} />
              <Route path="/purchase" element={<PrivateRoute element={<PurchasePage />} />} />
              <Route path="/subscription" element={<PrivateRoute element={<SubscriptionPage />} />} />
              <Route path="/art" element={<AlbumArtPage />} />
              <Route path="/likes" element={<LikesFollowsPage />} />
              <Route path="/comments" element={<CommentsPage />} />

              {/* 결제 성공/실패 페이지 라우트는 * 라우트보다 위에 위치해야 함 */}
              <Route path="/payment-success" element={<PaymentSuccessPage />} />
              <Route path="/payment-fail" element={<PaymentFailPage />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>

            {/* MainLayout을 사용하지 않는 라우트들 */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Routes>
        </Router>
      </MusicPlayerProvider>
    </AuthProvider>
  );
}