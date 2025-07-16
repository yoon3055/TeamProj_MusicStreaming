// src/pages/LibraryPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

import '../styles/LibraryPage.css'; // ✨ CSS 파일 임포트

const LibraryPage = () => {
  return (
    <div className="library-page-container">
      <h2 className="library-page-title">보관함</h2>

      <div className="library-sections-grid">
        <Link to="/likes" className="library-section-card">
          <div className="library-section-icon">❤️</div>
          <h3 className="library-section-title-small">좋아요한 곡</h3>
          <p className="library-section-description">내 취향의 음악을 다시 들어보세요.</p>
        </Link>

        <Link to="/artists" className="library-section-card"> {/* 🌐 /artists 라우트는 ArtistPage를 표시할 수 있습니다. */}
          <div className="library-section-icon">🎤</div>
          <h3 className="library-section-title-small">팔로우 아티스트</h3>
          <p className="library-section-description">좋아하는 아티스트의 새 소식을 확인하세요.</p>
        </Link>

        <Link to="/playlists" className="library-section-card"> {/* 🌐 /playlists 라우트는 사용자 플레이리스트 전체 목록 페이지를 표시할 수 있습니다. */}
          <div className="library-section-icon">📝</div>
          <h3 className="library-section-title-small">내 플레이리스트</h3>
          <p className="library-section-description">나만의 특별한 플레이리스트를 관리하세요.</p>
        </Link>

        <Link to="/history" className="library-section-card">
          <div className="library-section-icon">🕰️</div>
          <h3 className="library-section-title-small">재생 기록</h3>
          <p className="library-section-description">최근 감상한 곡들을 다시 찾아보세요.</p>
        </Link>
        
        <Link to="/subscription-history" className="library-section-card"> {/* 🌐 /subscription-history는 UserSubscriptionHistory 페이지로 연결될 수 있습니다. */}
          <div className="library-section-icon">🎫</div>
          <h3 className="library-section-title-small">이용권/구독 이력</h3>
          <p className="library-section-description">내 이용권 구매 내역을 확인하세요.</p>
        </Link>
        
        {/* 필요에 따라 더 많은 섹션 추가 */}
        {/* <Link to="/purchases" className="library-section-card">
          <div className="library-section-icon">🛍️</div>
          <h3 className="library-section-title-small">구매 앨범</h3>
          <p className="library-section-description">구매한 앨범들을 모아보세요.</p>
        </Link> */}
      </div>
    </div>
  );
};

export default LibraryPage;