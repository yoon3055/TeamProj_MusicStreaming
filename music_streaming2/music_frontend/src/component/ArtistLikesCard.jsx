import React, { useState, useEffect } from 'react';
import { fetchLikedArtists } from '../api/artistApi';
import '../styles/LikesCard.css';

const ArtistLikesCard = ({ onBack }) => {
  const [likedArtists, setLikedArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('아티스트 좋아요 데이터 로딩 시작');
      const artistsResponse = await fetchLikedArtists();
      console.log('API 응답:', artistsResponse);

      if (artistsResponse.success) {
        setLikedArtists(artistsResponse.data || []);
        console.log('좋아요한 아티스트:', artistsResponse.data);
      } else {
        console.error('API 응답 실패:', artistsResponse.message);
        setError(artistsResponse.message || '데이터를 불러오는데 실패했습니다.');
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
      <div className="state-icon">🎤</div>
      <h3>좋아요한 아티스트가 없습니다</h3>
      <p>마음에 드는 아티스트에 좋아요를 눌러보세요!</p>
    </div>
  );

  const renderArtistCard = (artist) => (
    <div key={artist.id} className="music-card">
      <div className="card-header">
        <div className="music-icon">🎤</div>
      </div>
      <div className="card-content">
        <h4 className="music-title">{artist.name}</h4>
        <p className="music-artist">{artist.genre || '장르 정보 없음'}</p>
        <p className="music-genre">{artist.description || '설명 없음'}</p>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) return renderLoadingState();
    if (error) return renderErrorState();
    
    if (likedArtists.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="music-grid">
        {likedArtists.map(renderArtistCard)}
      </div>
    );
  };

  return (
    <div className="likes-card-container">
      <div className="likes-card-header">
        <h2>내가 좋아하는 아티스트</h2>
        <p>좋아요를 누른 아티스트를 확인해보세요</p>
      </div>

      <div className="likes-card-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default ArtistLikesCard;
