
// src/components/PlaylistDrawer.jsx
import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { MusicPlayerContext } from '../context/MusicPlayerContext';

import '../styles/PlaylistDrawer.css';
import playlistPlaceholder from '../assets/K-054.jpg';

const LOCAL_IMAGE_PATHS = [
  '/images/K-052.jpg', '/images/K-053.jpg', '/images/K-054.jpg', '/images/K-055.jpg',
  '/images/K-056.jpg', '/images/K-057.jpg', '/images/K-058.jpg', '/images/K-059.jpg',
];
let imageIndex = 0;
const getNextLocalImage = () => {
  const path = LOCAL_IMAGE_PATHS[imageIndex % LOCAL_IMAGE_PATHS.length];
  imageIndex++;
  return path;
};

const DUMMY_PLAYLISTS = [
  { id: '1', title: '힐링 재즈', artist: 'Jazz Moods', coverUrl: getNextLocalImage(), songCount: 25, updatedAt: '2024.07.10' },
  { id: '2', title: '집중력 향상 LOFI', artist: 'Study Beats', coverUrl: getNextLocalImage(), songCount: 30, updatedAt: '2024.07.01' },
  { id: '3', title: '드라이브 필수 OST', artist: 'Movie Soundtracks', coverUrl: getNextLocalImage(), songCount: 18, updatedAt: '2024.06.28' },
  { id: '4', title: '감성 발라드', artist: 'Ballad Divas', coverUrl: getNextLocalImage(), songCount: 40, updatedAt: '2024.07.12' },
  { id: '5', title: '스트레스 해소 록', artist: 'Rock Anthems', coverUrl: getNextLocalImage(), songCount: 22, updatedAt: '2024.07.05' },
  { id: '6', title: '아침 클래식', artist: 'Classical Gems', coverUrl: getNextLocalImage(), songCount: 15, updatedAt: '2024.06.15' },
  { id: '7', title: '여름 바캉스', artist: 'Summer Hits', coverUrl: getNextLocalImage(), songCount: 35, updatedAt: '2024.07.08' },
  { id: '8', title: '힙합 플렉스', artist: 'HipHop Masters', coverUrl: getNextLocalImage(), songCount: 28, updatedAt: '2024.07.11' },
  { id: '9', title: '재즈 카페 무드', artist: 'Smooth Jazz', coverUrl: getNextLocalImage(), songCount: 20, updatedAt: '2024.07.03' },
  { id: '10', title: '장마철 감성 팝', artist: 'Rainy Day Singers', coverUrl: getNextLocalImage(), songCount: 17, updatedAt: '2024.07.09' },
  { id: '11', title: '코딩 집중 플레이리스트', artist: 'Code Beats', coverUrl: getNextLocalImage(), songCount: 30, updatedAt: '2024.07.14' },
  { id: '12', title: '마지막 남은 하나', artist: 'Test Artist', coverUrl: getNextLocalImage(), songCount: 1, updatedAt: '2024.07.15' },
];

const PlaylistThemeCard = ({ playlist, onPlayTheme }) => {
  return (
    <div className="interactive-album-card">
      <Link to={`/playlist/${playlist.id}`} className="interactive-album-card-link">
        <img
          src={playlist.coverUrl || playlistPlaceholder}
          alt={playlist.title}
          className="interactive-album-card-image"
        />
        <div className="interactive-album-card-info">
          <h4 className="interactive-album-card-title" title={playlist.title}>{playlist.title}</h4>
          <p className="interactive-album-card-artist">{playlist.artist}</p>
          <div className="album-card-meta">
            {playlist.songCount !== undefined && (
              <span className="album-card-song-count">{playlist.songCount}곡</span>
            )}
            {playlist.updatedAt && (
              <span className="album-card-updated-at">{playlist.updatedAt} 업데이트</span>
            )}
          </div>
        </div>
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          onPlayTheme(playlist);
        }}
        className="interactive-album-card-play-button"
        aria-label={`플레이리스트 ${playlist.title} 전체 재생`}
      >
        <svg className="interactive-album-card-play-icon" fill="currentColor" viewBox="0 0 20 20">
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
    artist: PropTypes.string,
    songCount: PropTypes.number,
    updatedAt: PropTypes.string,
  }).isRequired,
  onPlayTheme: PropTypes.func.isRequired,
};

const interpolateColor = (pageIndex, totalPages) => {
  const startColor = { r: 0, g: 123, b: 255 }; // #007bff
  const endColor = { r: 255, g: 64, b: 129 }; // #ff4081
  const ratio = totalPages > 1 ? pageIndex / (totalPages - 1) : 0;
  const r = Math.round(startColor.r + (endColor.r - startColor.r) * ratio);
  const g = Math.round(startColor.g + (endColor.g - startColor.g) * ratio);
  const b = Math.round(startColor.b + (endColor.b - startColor.b) * ratio);
  return `linear-gradient(90deg, rgba(${r}, ${g}, ${b}, 0.7), rgba(${r}, ${g}, ${b}, 0.3))`;
};

const PlaylistDrawer = ({ title, initialPlaylists, onPlayTheme: onPlayThemeFromProp, filterButtons }) => {
  const { playSong: playSongFromContext } = useContext(MusicPlayerContext);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const CARDS_PER_PAGE = 5;
  const totalPages = Math.ceil(playlists.length / CARDS_PER_PAGE) || 1;
  const startIndex = currentPage * CARDS_PER_PAGE;
  const visiblePlaylists = playlists.slice(startIndex, startIndex + CARDS_PER_PAGE);

  const fetchPlaylists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setPlaylists(initialPlaylists || DUMMY_PLAYLISTS);
    } catch (err) {
      console.error("플레이리스트 데이터 로딩 실패:", err);
      setError("플레이리스트를 불러오는데 실패했습니다.");
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  }, [initialPlaylists]);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  const handlePlayTheme = useCallback((playlistObj) => {
    if (playSongFromContext) {
      playSongFromContext({
        id: playlistObj.id,
        title: `(플레이리스트) ${playlistObj.title} - 첫 곡`,
        artist: playlistObj.artist || 'Various Artists',
        coverUrl: playlistObj.coverUrl,
      });
    }
    alert(`'${playlistObj.title}' 플레이리스트 전체 재생 시작!`);
  }, [playSongFromContext]);

  const handlePlayAllInSection = useCallback(() => {
    if (playlists.length === 0) {
      alert('재생할 플레이리스트가 없습니다.');
      return;
    }
    const allSongsInDrawer = playlists.flatMap(p => ({
      id: `section_song_${p.id}`,
      title: p.title,
      artist: p.artist || 'Various Artists',
      coverUrl: p.coverUrl,
    }));
    if (playSongFromContext && allSongsInDrawer.length > 0) {
      playSongFromContext(allSongsInDrawer[0]);
    }
    alert(`이 섹션의 ${playlists.length}개 플레이리스트의 대표곡들을 재생 목록에 담습니다!`);
  }, [playlists, playSongFromContext]);

  const handlePageChange = useCallback((pageIndex) => {
    const newPage = Math.max(0, Math.min(pageIndex, totalPages - 1));
    setCurrentPage(newPage);
    console.log(`handlePageChange: Moving to page ${newPage}`);
  }, [totalPages]);

  const handlePrevPage = () => {
    if (currentPage > 0) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      handlePageChange(currentPage + 1);
    }
  };

  const handleMouseDown = (e) => {
    if (containerRef.current) {
      setIsDragging(true);
      setStartX(e.pageX - containerRef.current.offsetLeft);
      setScrollLeft(containerRef.current.scrollLeft);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (!isDragging || !containerRef.current) return;
    setIsDragging(false);
    const cardWidth = 140; // 120px + 20px
    const scrollPosition = containerRef.current.scrollLeft;
    const closestPage = Math.round(scrollPosition / (cardWidth * CARDS_PER_PAGE));
    handlePageChange(closestPage);
  };

  useEffect(() => {
    if (containerRef.current) {
      const cardWidth = 140;
      const scrollPosition = currentPage * CARDS_PER_PAGE * cardWidth;
      containerRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      });
    }
  }, [currentPage]);

  if (loading) return <div className="playlist-drawer-loading">플레이리스트를 불러오는 중...</div>;
  if (error) return <div className="playlist-drawer-error">{error}</div>;
  if (playlists.length === 0) return <div className="playlist-drawer-empty">표시할 플레이리스트가 없습니다.</div>;

  const backgroundColor = interpolateColor(currentPage, totalPages);

  return (
    <section className="recommend-section carousel-section-wrapper" style={{ background: backgroundColor }}>
      <div className="section-title">
        <h3>{title || "FLO 테마 플레이리스트"}</h3>
        <div className="controls-container">
          {filterButtons}
          <div className="pagination-nav-container">
            <button
              className="carousel-nav-button prev-button"
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              aria-label="이전 페이지"
            >
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"></path>
              </svg>
            </button>
            <button
              className="carousel-nav-button next-button"
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
              aria-label="다음 페이지"
            >
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
            </button>
          </div>
          <button
            className="play-all-button"
            onClick={handlePlayAllInSection}
            aria-label="이 섹션 전체 재생"
          >
            <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
            </svg>
            전체 재생
          </button>
        </div>
      </div>

      <div className="carousel-viewport-mask">
        <div
          className="card-carousel"
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
        >
          {visiblePlaylists.map((playlist) => (
            <PlaylistThemeCard
              key={playlist.id}
              playlist={playlist}
              onPlayTheme={onPlayThemeFromProp || handlePlayTheme}
            />
          ))}
        </div>
        <div className="pagination-dots-container">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              className={`pagination-dot ${currentPage === idx ? 'active' : ''}`}
              onClick={() => handlePageChange(idx)}
              aria-label={`페이지 ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

PlaylistDrawer.propTypes = {
  title: PropTypes.string,
  initialPlaylists: PropTypes.array,
  onPlayTheme: PropTypes.func,
  filterButtons: PropTypes.node,
};

export default PlaylistDrawer;
