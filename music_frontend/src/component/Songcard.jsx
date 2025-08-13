// src/component/Songcard.jsx
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaPlay } from 'react-icons/fa';
import { MusicPlayerContext } from '../context/MusicPlayerContext';
import '../styles/LikesFollowsPage.css';

const Songcard = ({ song, onToggleLike }) => {
  const { id, title, artist, coverUrl, isLiked } = song;
  const { playSong } = useContext(MusicPlayerContext);

  const handleCardClick = () => {
    // 단일 곡을 재생 목록에 담고 재생합니다.
    playSong([song], song);
  };

  const handleLikeToggle = (e) => {
    e.stopPropagation();
    onToggleLike(id);
  };

  return (
    <div className="playlist-card song-card-custom" onClick={handleCardClick}>
      <Link to={`/album/${id}`} className="playlist-link">
        <div className="playlist-image-wrapper">
          <img src={coverUrl} alt={title} className="playlist-image" />
          <div className="play-overlay">
            <button className="play-button" onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCardClick();
            }}>
              <FaPlay />
            </button>
          </div>
        </div>
        <div className="playlist-info">
          <h4 className="playlist-title">{title}</h4>
          <p className="playlist-artist">{artist}</p>
        </div>
      </Link>
      <div className="playlist-actions">
        <button onClick={handleLikeToggle} className="playlist-like-btn">
          {isLiked ? <FaHeart className="liked" /> : <FaRegHeart />}
        </button>
      </div>
    </div>
  );
};

Songcard.propTypes = {
  song: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    artist: PropTypes.string.isRequired,
    coverUrl: PropTypes.string.isRequired,
    isLiked: PropTypes.bool.isRequired,
  }).isRequired,
  onToggleLike: PropTypes.func.isRequired,
};

export default Songcard;