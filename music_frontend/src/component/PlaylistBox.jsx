// src/component/PlaylistBox.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import '../styles/PlaylistBox.css';

const PlaylistBox = ({ songs = [], currentPage, itemsPerPage = 2 }) => {
  if (!Array.isArray(songs) || songs.length === 0) {
    return <p className="playlist-box-empty">표시할 노래가 없습니다.</p>;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleSongs = songs.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="playlist-song-list">
      {visibleSongs.map((song) => {
        if (!song) return null; // null, undefined 방지

        const { id, title, artist, coverUrl } = song;

        return (
          <div key={id} className="playlist-song-card">
            <Link to={`/album/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <img src={coverUrl} alt={title} className="playlist-song-cover" />
              <div className="playlist-song-info">
                <h4 className="playlist-song-title">{title || '제목 없음'}</h4>
                <p className="playlist-song-artist">{artist || '아티스트 미상'}</p>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

PlaylistBox.propTypes = {
  songs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
      artist: PropTypes.string,
      coverUrl: PropTypes.string,
    })
  ),
  currentPage: PropTypes.number,
  itemsPerPage: PropTypes.number,
};

PlaylistBox.defaultProps = {
  currentPage: 1,
  itemsPerPage: 2,
};

export default PlaylistBox;