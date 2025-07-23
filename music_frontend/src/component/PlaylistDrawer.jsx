// src/component/PlaylistDrawer.jsx
import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import PropTypes from 'prop-types';
import { MusicPlayerContext } from '../context/MusicPlayerContext';
import CategoryCard from '../component/CategoryCard';
import Albumcard from '../component/Albumcard';
import '../styles/PlaylistDrawer.css';

const DUMMY_ALBUMS = [
  { id: 'da1', title: '봄날의 멜로디', artist: '플로이', coverUrl: '/images/K-052.jpg', songCount: 10, updatedAt: '2024.07.10', genre: '발라드' },
  { id: 'da2', title: '어느 맑은 날', artist: '클로버', coverUrl: '/images/K-053.jpg', songCount: 12, updatedAt: '2024.07.08', genre: '댄스' },
];
// ... 필요시 다른 더미 데이터 추가

const PlaylistDrawer = ({
  title,
  sectionType,
  initialData,
  filterButtons,
  onPlayTheme,
  cardType = 'album',
  gridLayout = false,
  cardsPerPage = 6,
  className,
}) => {
  const { playSong } = useContext(MusicPlayerContext);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(items.length / cardsPerPage) || 1;
  const startIndex = currentPage * cardsPerPage;
  const visibleItems = items.slice(startIndex, startIndex + cardsPerPage);

  const containerRef = useRef(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300)); // 시뮬레이션 딜레이
      let data = initialData || [];
      if (!data.length) {
        data = sectionType === 'todayAlbums' ? DUMMY_ALBUMS : [];
      }
      setItems(data);
    } catch (err) {
      console.error('데이터 가져오기 실패:', err);
      setError('데이터를 불러오지 못했습니다.');
      setItems(initialData || []);
    } finally {
      setLoading(false);
    }
  }, [sectionType, initialData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePlay = useCallback(
    (item) => {
      if (playSong) {
        if (item.songs && item.songs.length > 0) {
          playSong(item.songs);
        } else {
          playSong(item);
        }
        alert(`${item.title} - ${item.artist || 'Various Artists'} 재생 시작!`);
      }
    },
    [playSong]
  );

  const handlePageChange = useCallback(
    (pageIndex) => {
      const newPage = Math.max(0, Math.min(pageIndex, totalPages - 1));
      setCurrentPage(newPage);
    },
    [totalPages]
  );

  const handlePrevPage = () => {
    if (currentPage > 0) handlePageChange(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) handlePageChange(currentPage + 1);
  };

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
        <h3>{title || ''}</h3>
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
          <div className="card-carousel">{visibleItems.map(renderCard)}</div>
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
  cardsPerPage: 6,
  className: '',
};

export default PlaylistDrawer;
