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

// ✨ containerClassName과 onPageChange props를 받도록 정의 ✨
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
  containerClassName, // ✨ 추가된 prop
  onPageChange,       // ✨ 추가된 prop
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

  // ✨ 페이지 변경 처리 함수: onPageChange 호출 추가 ✨
  const handlePageChange = useCallback(
    (pageIndex) => {
      const newPage = Math.max(0, Math.min(pageIndex, totalPages - 1));
      if (newPage !== currentPage) { // 실제로 페이지가 변경될 때만
        setCurrentPage(newPage);
        if (onPageChange) { // ✨ prop으로 전달된 onPageChange 함수 호출 ✨
          onPageChange();
        }
      }
    },
    [currentPage, totalPages, onPageChange] // 의존성 배열에 onPageChange 추가
  );

  // ✨ 다음 페이지 버튼 핸들러: handlePageChange 호출 ✨
  const handleNextPage = () => {
    if (currentPage < totalPages - 1) handlePageChange(currentPage + 1);
  };

  // ✨ 이전 페이지 버튼 핸들러: handlePageChange 호출 ✨
  const handlePrevPage = () => {
    if (currentPage > 0) handlePageChange(currentPage - 1);
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
            size="md" // RecommendPage.jsx에서 album CardType은 "album" 이고 PlaylistDrawer는 size="md"로 Albumcard를 렌더링하고 있습니다.
            onPlay={() => (onPlayTheme || handlePlay)(item)}
            className="album-card"
          />
        );
    }
  };

  if (loading) return <div className="playlist-drawer-loading">불러오는 중...</div>;
  if (error) console.warn(error);

  return (
    // ✨ PlaylistDrawer의 가장 바깥 컨테이너에 recommend-section과 동적 클래스 (containerClassName) 적용 ✨
    <section className={`recommend-section ${className || ''} ${containerClassName || ''}`}>
      <div className="section-title">
        <h3>{title || ''}</h3>
        <div className="controls-container">
          {filterButtons}
          <button
            className="carousel-nav-button"
            onClick={handlePrevPage} // 수정된 핸들러 호출
            disabled={currentPage === 0}
            aria-label="이전 페이지"
          >
            ◀
          </button>
          <button
            className="carousel-nav-button"
            onClick={handleNextPage} // 수정된 핸들러 호출
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
              onClick={() => handlePageChange(idx)} // 수정된 핸들러 호출
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
  containerClassName: PropTypes.string, // ✨ 새로운 propTypes 추가 ✨
  onPageChange: PropTypes.func,        // ✨ 새로운 propTypes 추가 ✨
};

PlaylistDrawer.defaultProps = {
  cardType: 'album',
  gridLayout: false,
  cardsPerPage: 6,
  className: '',
};

export default PlaylistDrawer;