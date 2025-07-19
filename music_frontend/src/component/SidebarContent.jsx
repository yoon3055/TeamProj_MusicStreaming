// src/components/SidebarContent.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Albumcard from './Albumcard';
import PropTypes from 'prop-types';
// import PlaylistDrawer from './PlaylistDrawer'; // ✨ PlaylistDrawer 임포트 제거
import PlaylistPage from '../pages/PlaylistPage'; // PlaylistPage (나의 플레이리스트 - 텍스트 목록)

import { MusicPlayerContext } from '../context/MusicPlayerContext';

// 더미 이미지 및 데이터 (RecommendPage.jsx와 중복되므로 필요시 유틸리티 파일로 분리)
const K52 = '/images/K-052.jpg';
const K53 = '/images/K-053.jpg';
const K54 = '/images/K-054.jpg';
const K55 = '/images/K-055.jpg';
const K56 = '/images/K-056.jpg';

let sidebarImageIndex = 0;
const getNextLocalImageSidebar = () => {
  const paths = [K52, K53, K54, K55, K56];
  const path = paths[sidebarImageIndex % paths.length];
  sidebarImageIndex++;
  return path;
};

// 🌐 1. 추천 앨범 섹션 더미 데이터 (Albumcard 사용)
const DUMMY_MOCK_ALBUMS = Array.from({ length: 6 }, (_, i) => ({
  id: `mock_album${i + 1}`,
  title: `추천앨범 ${i + 1}`,
  artist: `사이드 아티스트 ${i + 1}`,
  coverUrl: getNextLocalImageSidebar(),
  songCount: Math.floor(Math.random() * 10) + 3,
  updatedAt: `2024.0${(i % 6) + 1}.0${(i % 15) + 1}`,
}));

// 🌐 2. 광고 섹션 더미 데이터
const DUMMY_MOCK_ADS = [
  { id: 1, text: 'FLO 프리미엄 구독, 지금 바로!', url: '/subscription-plans' },
  { id: 2, text: '최신 앨범 30% 할인!', url: '/promotion/new-album' },
  { id: 3, text: 'FLO 앱 다운로드!', url: '/download-app' },
];

// ✨ 3. FLO 추천 플레이리스트 더미 데이터 (텍스트 목록용)
const DUMMY_FLO_RECOMMEND_PLAYLISTS_TEXT = Array.from({ length: 4 }, (_, i) => ({
  id: `flo_text_rec_pl${i + 1}`,
  name: `FLO 추천 ${i + 1}`,
  songs: [ // 내부 곡 더미
    { id: `rec_song_${i+1}_1`, title: `추천곡 ${i+1}-1`, artist: `추천가수 A` },
    { id: `rec_song_${i+1}_2`, title: `추천곡 ${i+1}-2`, artist: `추천가수 B` },
  ]
}));


// SidebarContent 전용 CSS 임포트
import '../styles/SidebarContent.css';

// ✨ PlaylistSongItem 컴포넌트 (PlaylistPage와 동일한 역할)
const PlaylistSongItem = ({ song, onPlaySong }) => {
  return (
    <li className="playlist-song-item">
      <div className="song-info-wrapper">
        <Link to={`/song/${song.id}`}>
          <span className="song-title">{song.title}</span> - <span className="song-artist">{song.artist}</span>
        </Link>
        <button
          onClick={() => onPlaySong(song)}
          className="play-song-item-button"
          aria-label={`${song.title} 재생`}
        >
          <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
        </button>
      </div>
    </li>
  );
};
PlaylistSongItem.propTypes = {
  song: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    artist: PropTypes.string.isRequired,
  }).isRequired,
  onPlaySong: PropTypes.func.isRequired,
};


export default function SidebarContent() {
  const { user } = useContext(AuthContext);
  const { playSong } = useContext(MusicPlayerContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FLO 추천 플레이리스트 섹션용 확장 상태
  const [expandedFloPlaylistId, setExpandedFloPlaylistId] = useState(null);
  const handleFloPlaylistToggle = (id) => {
    setExpandedFloPlaylistId(prevId => (prevId === id ? null : id));
  };


  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setLoading(false);
      } catch (err) {
        setError("사이드바 데이터를 불러오는 데 실패했습니다.");
        setLoading(false);
        console.error("Sidebar data fetch error:", err);
      }
    };
    fetchSidebarData();
  }, []);


  const handlePlaySongInContext = useCallback((songItem) => {
    if (!user) { // 비로그인 시
      alert('로그인 후 사용 가능합니다.');
      return;
    }
    if (playSong) {
      playSong({
        id: songItem.id,
        title: songItem.title,
        artist: songItem.artist || songItem.name || 'Various Artists',
        coverUrl: songItem.coverUrl || songItem.profileImageUrl,
      });
      alert(`곡 재생: '${songItem.title || songItem.name}'`);
    }
  }, [user, playSong]);


  const handlePlayAllPlaylistInContext = useCallback((playlistAlbumItem) => {
    if (!user) { // 비로그인 시
      alert('로그인 후 사용 가능합니다.');
      return;
    }
    if (playSong) {
      // 플레이리스트가 DUMMY_FLO_RECOMMEND_PLAYLISTS_TEXT 형태라면, 해당 songs 배열 참조
      let songsToPlay = [];
      const foundPlaylist = DUMMY_FLO_RECOMMEND_PLAYLISTS_TEXT.find(pl => pl.id === playlistAlbumItem.id);
      if (foundPlaylist && foundPlaylist.songs) {
        songsToPlay = foundPlaylist.songs;
      } else {
        // PlaylistPage (나의 플레이리스트)에서 오는 경우를 대비
        // 실제로는 playlistAlbumItem.id를 통해 수록곡 목록을 API에서 불러와야 함
        songsToPlay = [{
            id: `dummy_${playlistAlbumItem.id}_1`,
            title: `(대표곡) ${playlistAlbumItem.name || playlistAlbumItem.title}`,
            artist: `알 수 없는 아티스트`,
            coverUrl: playlistAlbumItem.coverUrl || playlistAlbumItem.profileImageUrl,
        }];
      }

      if (songsToPlay.length > 0) {
          playSong(songsToPlay[0]);
      }

      alert(`플레이리스트 '${playlistAlbumItem.title || playlistAlbumItem.name}' 전체 재생! (첫 곡부터)`);
    }
  }, [user, playSong]);


  if (loading) {
    return (
      <div className="sidebar-container loading">
        <p>사이드바를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sidebar-container error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="sidebar-container">
      {/* 1. 로그인 유도 섹션 (비회원에게만 표시) */}
      {!user && (
        <div className="sidebar-section auth-prompt" style={{ order: 1 }}>
          <h3 className="sidebar-title">FLO, 맘껏 즐기려면</h3>
          <p className="sidebar-text">로그인하고 FLO의 모든 기능을 경험해보세요.</p>
          <Link to="/login" className="sidebar-button primary">로그인</Link>
          <Link to="/signup" className="sidebar-button secondary">회원가입</Link>
        </div>
      )}

      {/* 2. FLO 추천 플레이리스트 섹션 (텍스트 목록) */}
      <div className="sidebar-section featured-playlists-section" style={{ order: 2 }}>
        <h3 className="sidebar-title">FLO 추천 플레이리스트</h3>
        <ul className="playlist-text-list"> {/* ✨ 텍스트 기반 리스트 컨테이너 (PlaylistPage와 동일) */}
          {DUMMY_FLO_RECOMMEND_PLAYLISTS_TEXT.map((pl) => (
            <li key={pl.id} className="playlist-list-item">
              <div className="playlist-list-item-header">
                <span className="playlist-name" onClick={() => handleFloPlaylistToggle(pl.id)}>{pl.name}</span>
                <span className="toggle-icon" onClick={() => handleFloPlaylistToggle(pl.id)}>{expandedFloPlaylistId === pl.id ? '▼' : '▶'}</span>
                <button
                  onClick={() => handlePlayAllPlaylistInContext(pl)} // ✨ 플레이리스트 전체 재생 버튼 연결
                  className="play-album-button" // PlaylistPage와 동일한 클래스
                  aria-label={`${pl.name} 전체 재생`}
                >
                  <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                </button>
              </div>
              {expandedFloPlaylistId === pl.id && (
                <ul className="playlist-song-list">
                  {pl.songs && pl.songs.length > 0 ? (
                    pl.songs.map(song => (
                      <PlaylistSongItem key={song.id} song={song} onPlaySong={handlePlaySongInContext} />
                    ))
                  ) : (
                    <li className="playlist-song-item empty-song-list">수록곡이 없습니다.</li>
                  )}
                </ul>
              )}
            </li>
          ))}
        </ul>
        {/* 모든 추천 플레이리스트를 볼 수 있는 더보기 링크 */}
        <Link to="/playlists/featured" className="playlist-create-button"> {/* ✨ PlaylistPage의 클래스 재활용 */}
          더 많은 추천 플레이리스트
        </Link>
      </div>

      {/* 3. 나의 플레이리스트 섹션 (로그인 시에만 표시, 텍스트 기반 드롭다운) */}
      {user && (
        <div className="sidebar-section user-specific-section" style={{ order: 3 }}>
          <div className="sidebar-section-header">
            <h3 className="sidebar-title">라이브러리</h3>
            <button
              onClick={() => handlePlayAllPlaylistInContext({ id: 'current_user_library', name: '내 라이브러리 전체' })}
              className="play-all-library-button"
              aria-label="라이브러리 전체 재생"
            >
              <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
              <span>전체 재생</span>
            </button>
          </div>
          {/* PlaylistPage 컴포넌트를 렌더링. 이제 PlaylistPage는 텍스트 기반 목록 */}
          <PlaylistPage
            onPlaySong={handlePlaySongInContext}
            onPlayAllPlaylist={handlePlayAllPlaylistInContext}
          />
        </div>
      )}

      {/* 4. 추천 앨범 섹션 (이미지 기반 유지, 로그인 시 순서 4, 비로그인 시 순서 3) */}
      <div className="sidebar-section album-recommendation-section" style={{ order: user ? 4 : 3 }}>
        <h3 className="sidebar-title">놓치지 마세요</h3>
        <div className="sidebar-album-list">
          {DUMMY_MOCK_ALBUMS.map(album => (
            <Albumcard key={album.id} album={album} size="sm" />
          ))}
        </div>
      </div>

      {/* 5. 광고 섹션 (항상 표시, 로그인 시 순서 5, 비로그인 시 순서 4) */}
      <div className="sidebar-section ad-section" style={{ order: 5 }}>
        <h3 className="sidebar-title">FLO 이벤트</h3>
        <div className="sidebar-ad-list">
          {DUMMY_MOCK_ADS.map(ad => (
            <Link key={ad.id} to={ad.url} className="sidebar-ad-item">
              {ad.text}
            </Link>
          ))}
        </div>
      </div>

      {/* 6. 하단 통합 서비스/바로가기 섹션 (항상 마지막 순서 6) */}
      <div className="sidebar-section bottom-links-section" style={{ order: 6 }}>
        <h3 className="sidebar-title">FLO 주요 안내</h3>
        <div className="sidebar-shortcut-list">
          <Link to="/explore" className="sidebar-shortcut-item">둘러보기</Link>
          <Link to="/ranking" className="sidebar-shortcut-item">차트</Link>
          <Link to="/advanced-search" className="sidebar-shortcut-item">고급 검색</Link>
          <Link to="/my-subscription" className="sidebar-shortcut-item">나의 이용권</Link>
          <Link to="/profile" className="sidebar-shortcut-item">내 프로필</Link>
          <Link to="/notice" className="sidebar-shortcut-item">공지사항</Link>
          <Link to="/help" className="sidebar-shortcut-item">고객센터</Link>
        </div>
      </div>
    </div>
  );
}