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
import AdminPrivateRoute from './component/AdminPrivateRoute';

// Page Components
import MainPage from './pages/MainPage';
import RecommendPage from './pages/RecommendPage';
import AlbumDetailPage  from './pages/AlbumDetailPage';
import ArtistInfoPage from './pages/ArtistInfoPage';
import UserProfilePage from './pages/UserProfilePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AlbumArtPage from './pages/AlbumIconPage';
import CommentsPage from './pages/CommentsPage';
import HistoryPage from './pages/PlaybackHistoryPage';
import LikesFollowsPage from './pages/LikesFollowsPage';
import PaymentFailPage from './pages/PaymentFailPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import SubscriptionPlansPage from './pages/SubscriptionPlansPage';
import { PurchasePage } from './pages/PurchasePage';
import MyPage from './pages/MyPage';
import ArtistLikes from './pages/ArtistLikes';
import AdvancedSearchPage from './pages/AdvancedSearchPage';
import SearchResultPage from './pages/SearchResultPage';
import RankingPage from './pages/RankingPage';
import SongDetailPage from './pages/SongDetailPage';
import PlaylistDrawer from './component/PlaylistDrawer';
import PlaylistPage from './pages/PlaylistPage';
import CreatePlaylistPage from './pages/CreatePlaylistPage';
import FindPasswordPage from './pages/FindPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PaymentPage from './pages/PaymentPage';
import SubscriptionStatusPage from './pages/SubscriptionStatusPage';
import SimpleSubscriptionPage from './pages/SimpleSubscriptionPage';
// import ArtistCreatePage from './pages/ArtistCreatePage';
import AdminDashboard from './component/AdminDashboard';
import UserManagement from './component/UserManagement';
import CommentManagement from './component/CommentManagement';
import FileManagement from './component/FileManagement';
import ArtistManagement from './component/ArtistManagement';  

// CSS Files
import './styles/index.css';
import ContentManagement from './component/ContentManagement';
import AdminSubscriptionPlansPage from './pages/AdminSubscriptionPlansPage';

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <MainLayout />,
      children: [
        { index: true, element: <MainPage /> },
        { path: 'explore', element: <RankingPage /> },
        { path: 'search', element: <SearchResultPage /> },
        { path: 'advanced-search', element: <AdvancedSearchPage /> },
        { path: 'playlists/featured', element: <PlaylistDrawer title="추천 테마 플레이리스트" /> },
        { path: 'recommend', element: <RecommendPage /> },
        // { path: 'artist/create', element: <ArtistCreatePage /> },
        { path: 'album/:id', element: <AlbumDetailPage /> },
        { path: 'artist/:id', element: <ArtistInfoPage /> },
        { path: 'song/:songId', element: <SongDetailPage /> },
        { path: 'art', element: <AlbumArtPage /> },
        { path: 'likes', element: <LikesFollowsPage /> },
        { path: 'artist-likes', element: <ArtistLikes /> },
        { path: 'comments', element: <CommentsPage /> },
        { path: 'payment/success', element: <PaymentSuccessPage /> },
        { path: 'payment/fail', element: <PaymentFailPage /> },
        {
          element: <PrivateRoute />,
          children: [
            { path: 'myPage', element: <MyPage /> },
            { path: 'my-playlists', element: <PlaylistPage /> },
            { path: 'create-playlist', element: <CreatePlaylistPage /> },
            { path: 'subscription-plans', element: <SubscriptionPlansPage /> },
            { path: 'subscription-status', element: <SubscriptionStatusPage /> },
            { path: 'simple-subscription', element: <SimpleSubscriptionPage /> },
            { path: 'payment', element: <PaymentPage /> },
            { path: 'profile', element: <UserProfilePage /> },
            { path: 'history', element: <HistoryPage /> },
            { path: 'purchase', element: <PurchasePage /> },
          ],
        },
        {
          element: <AdminPrivateRoute />,
          children: [
            { path: 'admin', element: <AdminDashboard /> },
            { path: 'admin/users', element: <UserManagement /> },
            { path: 'admin/artists', element: <ArtistManagement /> },
            { path: 'admin/comments', element: <CommentManagement /> },
            { path: 'admin/contents', element: <ContentManagement /> },
            { path: 'admin/files', element: <FileManagement /> },
            { path: 'admin/subscription-plans', element: <AdminSubscriptionPlansPage /> },
          ],
        },
        { path: '*', element: <Navigate to="/" replace /> },
      ],
    },
    { path: '/login', element: <LoginPage /> },
    { path: '/signup', element: <SignupPage /> },
    { path: '/find-password', element: <FindPasswordPage /> },
    { path: '/reset-password', element: <ResetPasswordPage /> },
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