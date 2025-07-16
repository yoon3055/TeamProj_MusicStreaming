// src/component/PlaylistDrawer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import '../styles/PlaylistDrawer.css'; // ✨ CSS 파일 임포트

// --- PlaylistThemeCard 컴포넌트: 각 테마별 플레이리스트를 나타내는 카드 ---
const PlaylistThemeCard = ({ playlist, onPlayTheme }) => {
  return (
    <div className="playlist-theme-card">
      {/* 1. 플레이리스트 상세 페이지로 이동하는 링크 영역 */}
      <Link to={`/playlist/${playlist.id}`} className="playlist-theme-card-link">
        <img
          src={playlist.coverUrl || 'https://via.placeholder.com/160/333333/FFFFFF?text=Playlist'}
          alt={playlist.title}
          className="playlist-theme-card-image"
        />
        <div className="playlist-theme-card-info">
          <h4 className="playlist-theme-card-title">{playlist.title}</h4>
          {/* 필요시 플레이리스트에 대한 추가 정보 (예: 생성자, 곡 수) */}
          {/* <p className="playlist-theme-card-creator">{playlist.creator}</p> */}
        </div>
      </Link>

      {/* 2. 재생 버튼 (호버 시 나타남) */}
      <button
        onClick={() => onPlayTheme(playlist.id)} // 🌐 재생 버튼 클릭 시 해당 플레이리스트 ID 전달
        className="playlist-theme-card-play-button"
        aria-label={`Play ${playlist.title}`}
      >
        <svg className="playlist-theme-card-play-icon" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
        </svg>
      </button>
    </div>
  );
};

PlaylistThemeCard.propTypes = {
  playlist: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    coverUrl: PropTypes.string,
  }).isRequired,
  onPlayTheme: PropTypes.func.isRequired,
};


// --- PlaylistDrawer 컴포넌트: 테마별 플레이리스트 섹션 (메인 콘텐츠) ---
const PlaylistDrawer = ({ title, playlists }) => {
  // 🌐 백엔드에서 플레이리스트 데이터를 가져오는 로직은 이 컴포넌트의 역할이 아닙니다.
  // 이 컴포넌트에서는 `playlists` prop으로 데이터를 받는다고 가정합니다.
  // MusicPlayerContext를 사용하여 가져온 노래들을 재생 목록에 추가하고 재생을 시작하는 로직
  // ⚠️ 이 함수는 실제 MusicPlayerContext의 함수와 연동되어야 합니다.
  const handlePlayTheme = (playlistId) => {
    // 🌐 이 부분에서 백엔드 API를 호출하여 playlistId에 해당하는 곡 목록을 가져온 후
    // MusicPlayerContext의 addSongsToQueue, playSong 등을 호출해야 합니다.
    console.log(`🌐 플레이리스트 ID: ${playlistId} 의 노래들을 재생합니다! (실제 로직 필요)`);
    alert(`플레이리스트 ID: ${playlistId} 의 노래들을 재생합니다!`);
  };

  return (
    <section className="playlist-drawer-section">
      <h3 className="playlist-drawer-title">{title}</h3>
      <div className="playlist-drawer-cards-container scrollbar-hide">
        {playlists.map((playlist) => (
          <PlaylistThemeCard
            key={playlist.id}
            playlist={playlist}
            onPlayTheme={handlePlayTheme}
          />
        ))}
      </div>
    </section>
  );
};

PlaylistDrawer.propTypes = {
  title: PropTypes.string.isRequired,
  playlists: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    coverUrl: PropTypes.string,
  })).isRequired,
};

export default PlaylistDrawer;