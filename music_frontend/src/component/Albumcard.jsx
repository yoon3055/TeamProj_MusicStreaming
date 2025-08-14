// src/component/Albumcard.jsx
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaPlay } from 'react-icons/fa';
import { MusicPlayerContext } from '../context/MusicPlayerContext';
import '../styles/LikesFollowsPage.css';

const Albumcard = ({ album, onToggleLike }) => {
  const { id, title, artist, coverUrl, isLiked, songs } = album;
  const { playSong } = useContext(MusicPlayerContext);

  const handleCardClick = () => {
    if (playSong) {
      playSong(songs);
    }
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
      <Link to={`/album/${id}`} className="playlist-link">
        <div className="playlist-image-wrapper">
          <img src={coverUrl} alt={title} className="playlist-image" />
          <div className="play-overlay">
            <button
              className="play-button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCardClick();
              }}
              aria-label="재생"
            >
              <FaPlay />
            </button>
          </div>
        </div>
        <div className="playlist-info">
          <h4 className="playlist-title">{title}</h4>
          <p className="playlist-artist">{typeof artist === 'object' ? artist?.name : artist}</p>
        </div>
      </Link>
      <div className="playlist-actions">
        <button onClick={handleLikeToggle} className="playlist-like-btn" aria-label="좋아요 토글">
          {isLiked ? <FaHeart className="liked" /> : <FaRegHeart />}
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
