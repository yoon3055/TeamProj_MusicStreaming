// src/component/Artistcard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FaUserPlus, FaUserCheck } from 'react-icons/fa';
import '../styles/LikesFollowsPage.css';

const Artistcard = ({ artist, onToggleFollow }) => {
  const { id, name, profileImageUrl, isFollowed } = artist;

  const handleFollowToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFollow(id);
  };

  return (
    <div className="playlist-card artist-card-custom">
      <Link to={`/artist/${id}`} className="playlist-link">
        <div className="playlist-image-wrapper">
          <img
            src={profileImageUrl || '/images/default_artist.png'}
            alt={name}
            className="playlist-image artist-image"
          />
        </div>
        <div className="playlist-info">
          <h4 className="playlist-title">{name || '아티스트 이름'}</h4>
        </div>
      </Link>
      <div className="playlist-actions artist-actions">
        <button
          onClick={handleFollowToggle}
          className={`artist-follow-btn ${isFollowed ? 'followed' : ''}`}
        >
          {isFollowed ? <FaUserCheck /> : <FaUserPlus />}
          <span className="artist-follow-text">
            {isFollowed ? '팔로잉' : '팔로우'}
          </span>
        </button>
      </div>
    </div>
  );
};

Artistcard.propTypes = {
  artist: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    profileImageUrl: PropTypes.string,
    isFollowed: PropTypes.bool.isRequired,
  }).isRequired,
  onToggleFollow: PropTypes.func.isRequired,
};

export default Artistcard;