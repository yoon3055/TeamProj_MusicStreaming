// src/component/MainLayout.jsx
import React, { useContext, useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom'; // Outlet 임포트

import Header from './Header';
import MusicPlayer from './MusicPlayer';
import Footer from './Footer';
import LoadingToast from './LoadingToast';

import PlaylistPage from '../pages/PlaylistPage'; // 로그인 사용자용 사이드바
import GuestSidebarContent from './GuestSidebarContent'; // 비로그인 사용자용 사이드바

import { AuthContext } from '../context/AuthContext';

import '../styles/MainLayout.css';

export default function MainLayout() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [showToastManually, setShowToastManually] = useState(true);

  useEffect(() => {
    if (authLoading) {
      setShowToastManually(true);
    } else {
      setShowToastManually(false);
    }
  }, [authLoading]);

  const handleDismissToast = () => {
    setShowToastManually(false);
  };

  return (
    <div className="main-layout-container">
      <Header />

      <div className="main-layout-content-wrapper">
        <main className="main-content-area">
          {/* Outlet이 현재 매칭된 하위 라우트 컴포넌트 렌더링 담당 */}
          <Outlet />
        </main>

        <aside className="main-sidebar-area">
          {user ? <PlaylistPage /> : <GuestSidebarContent />}
        </aside>
      </div>

      <MusicPlayer />
      <Footer />

      {authLoading && showToastManually && (
        <LoadingToast isLoading={authLoading} onDismiss={handleDismissToast} />
      )}
    </div>
  );
}
