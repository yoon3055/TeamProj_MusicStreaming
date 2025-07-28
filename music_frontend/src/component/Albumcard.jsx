// src/components/Albumcard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import '../styles/AlbumCardPage.css';

const Albumcard = ({ album, size = 'md', className }) => {
  return (
    <div className={`album-card ${size === 'sm' ? 'album-card-sm' : size === 'lg' ? 'album-card-lg' : 'album-card-md'} ${className || ''}`}>
      <Link to={`/album/${album.id}`} className="album-card-link">
        <img
          src={album.coverUrl}
          alt={album.title}
          className="album-card-image"
        />
        <div className="album-card-info">
          <h4 className="album-card-title">{album.title}</h4>
          <p className="album-card-artist">{album.artist}</p>
          {/* ✨ size="sm"일 때는 메타 정보 표시 안 함 */}
          {size !== 'sm' && (album.songCount !== undefined || album.updatedAt) && (
            <div className="album-card-meta">
              {album.songCount !== undefined && (
                <span className="album-card-song-count">{album.songCount}곡</span>
              )}
              {album.updatedAt && (
                <span className="album-card-updated-at">{album.updatedAt} </span>
              )}
            </div>
          )}
        </div>
      </Link>
      <div className="album-card-wrapper"> 
  <div className="album-hover-overlay">
    <button className="play-button">▶</button>
  </div>
</div>
    </div>
  );
};

Albumcard.propTypes = {
  album: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    artist: PropTypes.string.isRequired,
    coverUrl: PropTypes.string,
    songCount: PropTypes.number,
    updatedAt: PropTypes.string,
  }).isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default Albumcard;