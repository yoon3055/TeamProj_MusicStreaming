// src/component/MainLayout.jsx
import React, { useContext, useState, useEffect } from 'react';
import Header from './Header';
import Navbar from './Navbar';
import MusicPlayer from './MusicPlayer';
import Footer from './Footer';
import LoadingToast from './LoadingToast';

import PlaylistPage from '../pages/PlaylistPage'; // 로그인 사용자용 사이드바 (개인 플레이리스트 목록)
import GuestSidebarContent from './GuestSidebarContent'; // 비로그인 사용자용 사이드바 (추천 앨범/광고)

import { AuthContext } from '../context/AuthContext'; // 🌐 AuthContext 임포트

import '../styles/MainLayout.css'; // ✨ CSS 파일 임포트

export default function MainLayout({ children }) {
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
    <div className="main-layout-container"> {/* ✨ 클래스 적용 */}
      <Header />
      <Navbar />

      <div className="main-layout-content-wrapper"> {/* ✨ 클래스 적용 */}
        <main className="main-content-area"> {/* ✨ 클래스 적용 */}
          {children}
        </main>

        <aside className="main-sidebar-area"> {/* ✨ 클래스 적용 */}
          {user ? (
            <PlaylistPage />
          ) : (
            <GuestSidebarContent />
          )}
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