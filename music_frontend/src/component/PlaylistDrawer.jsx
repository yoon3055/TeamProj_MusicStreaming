import React, { useState, useCallback, useContext, useRef } from 'react';
import PropTypes from 'prop-types';
import { MusicPlayerContext } from '../context/MusicPlayerContext';
import CategoryCard from './CategoryCard';
import Albumcard from './Albumcard';

// React Icons 임포트
import { FaHeart, FaRegHeart, FaUserPlus, FaUserCheck } from 'react-icons/fa';

import '../styles/PlaylistDrawer.css';

const PlaylistDrawer = ({
  title,
  initialData,
  filterButtons,
  onPlayTheme,
  cardType = 'album',
  gridLayout = false,
  cardsPerPage = 6,
  className,
  containerClassName,
  onPageChange,
  onToggleLike,
  onToggleFollow,
}) => {
  const { playSong } = useContext(MusicPlayerContext);

  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef(null);

  const items = initialData || [];
  const totalPages = Math.ceil(items.length / cardsPerPage) || 1;
  const startIndex = currentPage * cardsPerPage;
  const visibleItems = items.slice(startIndex, startIndex + cardsPerPage);

  const handlePlay = useCallback(    
    (item) => {
      console.log(item);
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
      if (newPage !== currentPage) {
        setCurrentPage(newPage);
        if (onPageChange) onPageChange();
      }
    },
    [currentPage, totalPages, onPageChange]
  );

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) handlePageChange(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 0) handlePageChange(currentPage - 1);
  };

  const renderCard = (item) => {
    switch (cardType) {
      case 'artist':
        return (
          <div key={item.id} className="artist-card">
            <img src={item.profileImageUrl} alt={item.name} className="artist-card-profile-image" />
            <div className="artist-card-name">{item.name}</div>
            <div className="artist-card-interactions">
              <div className="interaction-item">
                <button
                  onClick={() => onToggleLike && onToggleLike(item.id)}
                  className={`interaction-toggle-btn ${item.isLiked ? 'liked' : ''}`}
                >
                  {item.isLiked ? <FaHeart /> : <FaRegHeart />}
                </button>
                <span className="interaction-count">{item.likeCount}</span>
              </div>
              <div className="interaction-item">
                <button
                  onClick={() => onToggleFollow && onToggleFollow(item.id)}
                  className={`interaction-toggle-btn ${item.isFollowed ? 'followed' : ''}`}
                >
                  {item.isFollowed ? <FaUserCheck /> : <FaUserPlus />}
                </button>
                <span className="interaction-count">{item.followerCount}</span>
              </div>
            </div>
          </div>
        );
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
            onToggleLike={onToggleLike}
            className="album-card"
          />
        );
    }
  };

  return (
    <section className={`recommend-section ${className || ''} ${containerClassName || ''}`}>
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
          <div
            className={`card-grid ${visibleItems.length === 1 ? 'single' : ''}`}
            style={{ height: 'auto' }}
          >
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
  sectionType: PropTypes.oneOf([
    'todayAlbums',
    'hotNewSongs',
    'genres',
    'popularArtists',
    'featuredPlaylists',
  ]).isRequired,
  initialData: PropTypes.arrayOf(PropTypes.object),
  filterButtons: PropTypes.node,
  onPlayTheme: PropTypes.func,
  cardType: PropTypes.oneOf(['album', 'artist', 'genre']),
  gridLayout: PropTypes.bool,
  cardsPerPage: PropTypes.number,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
  onPageChange: PropTypes.func,
  onToggleLike: PropTypes.func,
  onToggleFollow: PropTypes.func,
};

PlaylistDrawer.defaultProps = {
  cardType: 'album',
  gridLayout: false,
  cardsPerPage: 6,
  className: '',
};

export default PlaylistDrawer;
