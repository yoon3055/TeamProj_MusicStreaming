// src/components/PlaylistDrawer.jsx
import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import PropTypes from 'prop-types';
import { MusicPlayerContext } from '../context/MusicPlayerContext';
import CategoryCard from '../component/CategoryCard'; // 통합된 카드 컴포넌트
import Albumcard from '../component/Albumcard';
import '../styles/PlaylistDrawer.css';

// ✅ 백엔드 실패 시 기본 더미 데이터
const DUMMY_ALBUMS = [
  { id: 'da1', title: '봄날의 멜로디', artist: '플로이', coverUrl: '/images/K-052.jpg', songCount: 10, updatedAt: '2024.07.10', genre: '발라드' },
  { id: 'da2', title: '어느 맑은 날', artist: '클로버', coverUrl: '/images/K-053.jpg', songCount: 12, updatedAt: '2024.07.08', genre: '댄스' },
];
const DUMMY_SONGS = [
  { id: 'ds1', title: '환상속의 그대', artist: '플로아', coverUrl: '/images/K-054.jpg', isHighQuality: true, songCount: 1, updatedAt: '2024.07.10', genre: '발라드' },
];
const DUMMY_GENRES = [
  { id: 'dg1', name: '발라드', imageUrl: '/images/K-055.jpg' },
];
const DUMMY_ARTISTS = [
  { id: 'da_a1', name: '별빛가수', profileImageUrl: '/images/K-056.jpg', genre: '발라드' },
];
const DUMMY_FEATURED_PLAYLISTS = [
  { id: 'fp1', title: 'FLO 추천! 힐링 음악', artist: 'Various Artists', coverUrl: '/images/K-057.jpg', songCount: 20, updatedAt: '2024.07.10', genre: '발라드' },
];

const PlaylistDrawer = ({ title, sectionType, initialData, filterButtons, onPlayTheme, cardType = 'album', gridLayout = false, cardsPerPage = 6, className }) => {
  const { playSong } = useContext(MusicPlayerContext);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(items.length / cardsPerPage) || 1;
  const startIndex = currentPage * cardsPerPage;
  const visibleItems = items.slice(startIndex, startIndex + cardsPerPage);

  const containerRef = useRef(null);

  // 🎯 섹션별 데이터 페칭 (더미 데이터 사용)
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // 시뮬레이션
      let data = initialData || [];
      if (!data.length) {
        data = sectionType === 'genres' ? DUMMY_GENRES :
               sectionType === 'popularArtists' ? DUMMY_ARTISTS :
               sectionType === 'featuredPlaylists' ? DUMMY_FEATURED_PLAYLISTS : [];
      }
      setItems(data);
    } catch (err) {
      console.error('⚠️ 데이터 가져오기 실패:', err);
      setError('데이터를 불러오지 못했습니다. 기본 목록을 표시합니다.');
      setItems(initialData || (sectionType === 'featuredPlaylists' ? DUMMY_FEATURED_PLAYLISTS : []));
    } finally {
      setLoading(false);
    }
  }, [sectionType, initialData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePlay = useCallback((item) => {
    if (playSong && cardType === 'album') {
      playSong({
        id: item.id,
        title: item.title,
        artist: item.artist || 'Various Artists',
        coverUrl: item.coverUrl,
      });
      alert(`${item.title} - ${item.artist || 'Various Artists'} 재생 시작!`);
    }
  }, [playSong, cardType]);

  const handlePageChange = useCallback((pageIndex) => {
    const newPage = Math.max(0, Math.min(pageIndex, totalPages - 1));
    setCurrentPage(newPage);
  }, [totalPages]);

  const handlePrevPage = () => {
    if (currentPage > 0) handlePageChange(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) handlePageChange(currentPage + 1);
  };

  // cardType에 따른 카드 렌더링 함수
  const renderCard = (item) => {
    switch (cardType) {
      case 'artist':
      case 'genre':
        return <CategoryCard key={item.id} item={item} type={cardType} />;
      case 'album':
      default:
        return (
          <Albumcard
            key={item.id}
            album={item}
            size="md"
            onPlay={() => (onPlayTheme || handlePlay)(item)}
            className="album-card"
          />
        );
    }
  };

  if (loading) return <div className="playlist-drawer-loading">불러오는 중...</div>;
  if (error) console.warn(error);

  return (
    <section className={`recommend-section ${className || ''}`}>
      <div className="section-title">
        <h3>{title || ""}</h3>
        <div className="controls-container">
          {filterButtons}
          <button
            className="carousel-nav-button"
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            aria-label="이전 페이지"
          >
            ◀
          </button>
          <button
            className="carousel-nav-button"
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            aria-label="다음 페이지"
          >
            ▶
          </button>
        </div>
      </div>

      <div className="carousel-viewport-mask" ref={containerRef}>
        {gridLayout ? (
          <div className="card-grid" style={{ height: 'auto' }}>
            {visibleItems.map(renderCard)}
          </div>
        ) : (
          <div className="card-carousel">
            {visibleItems.map(renderCard)}
          </div>
        )}

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
  sectionType: PropTypes.oneOf(['todayAlbums', 'hotNewSongs', 'genres', 'popularArtists', 'featuredPlaylists']).isRequired,
  initialData: PropTypes.arrayOf(PropTypes.object),
  filterButtons: PropTypes.node,
  onPlayTheme: PropTypes.func,
  cardType: PropTypes.oneOf(['album', 'artist', 'genre']),
  gridLayout: PropTypes.bool,
  cardsPerPage: PropTypes.number,
  className: PropTypes.string,
};

PlaylistDrawer.defaultProps = {
  cardType: 'album',
  gridLayout: false,
  cardsPerPage: 6, // 3x2 그리드에 맞게 6으로 설정
  className: '',
};

export default PlaylistDrawer;