import React, { useState, useEffect } from 'react';
import { fetchLikedSongs } from '../api/likesApi';
import '../styles/LikesCard.css';

const LikesCard = ({ onBack }) => {
  const [likedSongs, setLikedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const songsResponse = await fetchLikedSongs();

      if (songsResponse.success) {
        setLikedSongs(songsResponse.data || []);
      }
    } catch (err) {
      console.error('데이터 로딩 실패:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const renderLoadingState = () => (
    <div className="content-state">
      <div className="state-icon loading-spinner"></div>
      <h3>로딩 중...</h3>
      <p>데이터를 불러오고 있습니다.</p>
    </div>
  );

  const renderErrorState = () => (
    <div className="content-state error">
      <div className="state-icon">⚠️</div>
      <h3>오류가 발생했습니다</h3>
      <p>{error}</p>
      <button className="retry-button" onClick={loadData}>
        다시 시도
      </button>
    </div>
  );

  const renderEmptyState = () => (
    <div className="content-state empty">
      <div className="state-icon">🎵</div>
      <h3>좋아요한 노래가 없습니다</h3>
      <p>마음에 드는 노래에 좋아요를 눌러보세요!</p>
    </div>
  );

  const renderSongCard = (song) => (
    <div key={song.id} className="music-card">
      <div className="card-header">
        <div className="music-icon">🎵</div>
      </div>
      <div className="card-content">
        <h4 className="music-title">{song.title}</h4>
        <p className="music-artist">{song.artist}</p>
        <p className="music-genre">{song.genre}</p>
      </div>
    </div>
  );


  const renderContent = () => {
    if (loading) return renderLoadingState();
    if (error) return renderErrorState();
    
    if (likedSongs.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="music-grid">
        {likedSongs.map(renderSongCard)}
      </div>
    );
  };

  return (
    <div className="likes-card-container">
      <div className="likes-card-header">
        <h2>내가 좋아하는 음악</h2>
        <p>좋아요를 누른 노래를 확인해보세요</p>
      </div>

      <div className="likes-card-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default LikesCard;
