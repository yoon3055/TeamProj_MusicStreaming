import React from 'react';
import '../styles/RankingPage.css';

const RankingChart = ({ songs, toggleLike, toggleFollow, toggleAdd }) => {
  // 곡 길이 포맷 함수 (초 -> mm:ss)
  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="ranking-list">
      {songs.map(song => (
        <div key={song.id} className="ranking-item">
          <img src={song.thumbnail} alt={song.album} className="album-thumbnail" />

          <div className="album-artist-box">
            <div className="album-name">{song.album}</div>
            <div className="artist-name">{song.artist}</div>
          </div>

          <div className="song-info">
            {song.title} <span>({formatDuration(song.duration)})</span>
          </div>

          <div className="action-buttons">
            <button
              className={`action-button ${song.liked ? 'active' : ''}`}
              onClick={() => toggleLike(song.id)}
              aria-label="좋아요"
              type="button"
            >
              ❤️ <span className="count">{song.likes}</span>
            </button>

            <button
              className={`action-button ${song.following ? 'active' : ''}`}
              onClick={() => toggleFollow(song.id)}
              aria-label="팔로우"
              type="button"
            >
              👤 <span className="count">{song.followers}</span>
            </button>

            <button
              className={`action-button ${song.added ? 'active' : ''}`}
              onClick={() => toggleAdd(song.id)}
              aria-label="플레이리스트 담기"
              type="button"
            >
              ➕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RankingChart;
