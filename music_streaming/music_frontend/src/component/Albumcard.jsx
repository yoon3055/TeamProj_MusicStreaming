// src/component/Albumcard.jsx
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaPlay } from 'react-icons/fa';
import { MusicPlayerContext } from '../context/MusicPlayerContext';
import '../styles/LikesFollowsPage.css';

const Albumcard = ({ album, onToggleLike }) => {
  const { id, title, artist, coverUrl, isLiked, likeCount, songs } = album;
  const { playSong } = useContext(MusicPlayerContext);

  const handleCardClick = () => {
    // 노래 재생 기능 제거 - 상세 페이지 이동만 수행
  };

  const handleLikeToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleLike) {
      onToggleLike(id);
    }
  };

  return (
    <div className="playlist-card album-card-custom" onClick={handleCardClick}>
      {/* 기존 앨범 페이지 연결 주석 처리 */}
      {/* <Link to={`/album/${id}`} className="playlist-link"> */}
      <Link to={`/song/${id}`} className="playlist-link">
        <div className="playlist-info">
          <h4 className="playlist-title">{title}</h4>
          <p className="playlist-artist">{typeof artist === 'object' ? artist?.name : artist}</p>
        </div>
      </Link>
      <div className="playlist-actions">
        <button onClick={handleLikeToggle} className="playlist-like-btn" aria-label="좋아요 토글">
          {isLiked ? <FaHeart className="liked" /> : <FaRegHeart />}
          {likeCount !== undefined && <span className="like-count">{likeCount}</span>}
        </button>
      </div>
    </div>
  );
};

Albumcard.propTypes = {
  album: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    artist: PropTypes.string.isRequired,
    likeCount: PropTypes.number,
    coverUrl: PropTypes.string.isRequired,
    isLiked: PropTypes.bool.isRequired,
    songs: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string,
        url: PropTypes.string,
      })
    ),
  }).isRequired,
  onToggleLike: PropTypes.func.isRequired,
};

export default Albumcard;
