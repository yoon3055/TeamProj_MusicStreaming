// src/pages/SongDetailPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { songApi } from '../api/songApi';
import { MusicPlayerContext } from '../context/MusicPlayerContext';
import { AuthContext } from '../context/AuthContext';
import '../styles/SongDetailPage.css';

const SongDetailPage = () => {
  const { songId } = useParams();
  const navigate = useNavigate();
  const { playSong } = useContext(MusicPlayerContext);
  const { user } = useContext(AuthContext);
  
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchSongDetail = async () => {
      try {
        setLoading(true);
        const songData = await songApi.getSongById(songId);
        setSong(songData);
        
        // 좋아요 수 조회
        const likeCountData = await songApi.getSongLikeCount(songId);
        setLikeCount(likeCountData);
        
        // 사용자 좋아요 여부 확인 (로그인한 경우만)
        if (user && user.id) {
          const likedStatus = await songApi.isLikedByUser(songId, user.id);
          setIsLiked(likedStatus);
        }
      } catch (error) {
        console.error('노래 상세 정보 조회 실패:', error);
        setError('노래 정보를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (songId) {
      fetchSongDetail();
    }
  }, [songId, user]);

  const handlePlaySong = () => {
    if (song) {
      playSong({
        id: song.id,
        title: song.title,
        artist: typeof song.artist === 'object' ? song.artist?.name : song.artist,
        albumCover: song.albumCover || '/images/default-album.png',
        audioUrl: song.audioUrl
      });
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleLikeToggle = async () => {
    if (!user || !user.id) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const liked = await songApi.toggleSongLike(songId, user.id);
      setIsLiked(liked);
      
      // 좋아요 수 다시 조회
      const newLikeCount = await songApi.getSongLikeCount(songId);
      setLikeCount(newLikeCount);
    } catch (error) {
      console.error('좋아요 토글 실패:', error);
      alert('좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="song-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>노래 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !song) {
    return (
      <div className="song-detail-page">
        <div className="error-container">
          <h2>오류 발생</h2>
          <p>{error || '노래를 찾을 수 없습니다.'}</p>
          <button onClick={handleGoBack} className="back-button">
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="song-detail-page">
      <div className="song-detail-header">
        <button onClick={handleGoBack} className="back-button">
          ← 돌아가기
        </button>
      </div>

      <div className="song-detail-content">
        <div className="song-main-info">
          <div className="song-info-grid">
            <div className="song-basic-info">
              <div className="artist-profile-section">
                <img 
                  src={
                    typeof song.artist === 'object' && song.artist.profileImage 
                      ? song.artist.profileImage 
                      : '/images/default-artist.jpg'
                  }
                  alt={typeof song.artist === 'object' ? song.artist.name : song.artist}
                  className="artist-profile-image"
                />
                <div className="song-text-info">
                  <h1 className="song-title">{song.title}</h1>
                  <p className="song-artist">
                    {typeof song.artist === 'object' ? song.artist.name : song.artist}
                  </p>
                </div>
              </div>
              
              <div className="song-actions">
                {user && (
                  <>
                    <button 
                      className={`action-button ${isLiked ? 'liked' : 'secondary'}`}
                      onClick={handleLikeToggle}
                    >
                      {isLiked ? '❤️' : '🤍'} 좋아요 {likeCount}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="song-details-table">
              <h3>노래 정보</h3>
              <table className="info-table">
                <tbody>
                  <tr>
                    <td className="table-label">가수</td>
                    <td className="table-value">
                      {typeof song.artist === 'object' ? song.artist.name : song.artist}
                    </td>
                  </tr>
                  <tr>
                    <td className="table-label">제목</td>
                    <td className="table-value">{song.title}</td>
                  </tr>
                  <tr>
                    <td className="table-label">장르</td>
                    <td className="table-value">{song.genre}</td>
                  </tr>
                  {song.album && (
                    <tr>
                      <td className="table-label">앨범</td>
                      <td className="table-value">{song.album}</td>
                    </tr>
                  )}
                  {song.releaseDate && (
                    <tr>
                      <td className="table-label">발매일</td>
                      <td className="table-value">
                        {new Date(song.releaseDate).toLocaleDateString('ko-KR')}
                      </td>
                    </tr>
                  )}
                  {song.uploadDate && (
                    <tr>
                      <td className="table-label">업로드 날짜</td>
                      <td className="table-value">
                        {new Date(song.uploadDate).toLocaleDateString('ko-KR')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {song.description && (
          <div className="song-description">
            <h3>설명</h3>
            <p>{song.description}</p>
          </div>
        )}

        <div className="technical-info">
          <h3>기술 정보</h3>
          <div className="technical-details">
            {song.bitrate && (
              <div className="tech-item">
                <span className="tech-label">비트레이트:</span>
                <span className="tech-value">{song.bitrate} kbps</span>
              </div>
            )}
            
            {song.sampleRate && (
              <div className="tech-item">
                <span className="tech-label">샘플 레이트:</span>
                <span className="tech-value">{song.sampleRate} Hz</span>
              </div>
            )}
            
            {song.format && (
              <div className="tech-item">
                <span className="tech-label">파일 형식:</span>
                <span className="tech-value">{song.format}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongDetailPage;
