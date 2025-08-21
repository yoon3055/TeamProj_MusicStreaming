// src/component/PlaylistBox.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaUserPlus, FaUserCheck } from 'react-icons/fa'; // 아이콘 추가
import '../styles/PlaylistBox.css';

const PlaylistBox = ({ songs = [], currentPage, itemsPerPage = 2, onToggleLike, onToggleFollow }) => {
  if (!Array.isArray(songs) || songs.length === 0) {
    return <p className="playlist-box-empty">표시할 노래가 없습니다.</p>;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleSongs = songs.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="playlist-song-list">
      {visibleSongs.map((song) => {
        if (!song) return null;

        const { id, title, artist, coverUrl, isLiked, likeCount, isFollowed } = song;

        return (
          <div key={id} className="playlist-song-card">
            <Link to={`/album/${id}`} className="playlist-song-link">
              <img src={coverUrl} alt={title} className="playlist-song-cover" />
            </Link>
            <div className="playlist-song-info">
              <Link to={`/album/${id}`} className="playlist-song-text-link">
                <h4 className="playlist-song-title" title={title || '제목 없음'}>
                  {title || '제목 없음'}
                </h4>
                <p className="playlist-song-artist" title={artist || '아티스트 미상'}>
                  {artist || '아티스트 미상'}
                </p>
              </Link>
              <div className="playlist-song-actions">
                <div className="like-section">
                  <button onClick={() => onToggleLike(id)} className="like-btn">
                    {isLiked ? <FaHeart color="#ff5050" /> : <FaRegHeart color="#888" />}
                  </button>
                  <span className="like-count">{likeCount || 0}</span>
                </div>
                <div className="follow-section">
                  <button onClick={() => onToggleFollow(id)} className="follow-btn">
                    {isFollowed ? <FaUserCheck color="#007bff" /> : <FaUserPlus color="#888" />}
                  </button>
                  <span className="artist-name">{artist || '아티스트'}</span>
                </div>
              </div>
            </div>
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
      isLiked: PropTypes.bool,
      likeCount: PropTypes.number,
      isFollowed: PropTypes.bool,
    })
  ),
  currentPage: PropTypes.number,
  itemsPerPage: PropTypes.number,
  onToggleLike: PropTypes.func,
  onToggleFollow: PropTypes.func,
};

PlaylistBox.defaultProps = {
  currentPage: 1,
  itemsPerPage: 2,
};

export default PlaylistBox;