// src/pages/ArtistDetailPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaUserPlus, FaUserCheck, FaPlay, FaArrowLeft } from 'react-icons/fa';
import { MusicPlayerContext } from '../context/MusicPlayerContext';
import { AuthContext } from '../context/AuthContext';
import { artistApi } from '../api/artistApi';
import '../styles/ArtistDetailPage.css';

const ArtistDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playSong } = useContext(MusicPlayerContext);
  const { user } = useContext(AuthContext);

  const [artist, setArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    fetchArtistData();
  }, [id]);

  const fetchArtistData = async () => {
    try {
      setLoading(true);
      
      // 아티스트 기본 정보 조회
      const artistData = await artistApi.getArtistById(id);
      setArtist(artistData);
      
      // 아티스트의 곡 목록 조회 (임시 데이터)
      setSongs([
        {
          id: '1',
          title: '대표곡 1',
          duration: '3:45',
          albumCover: '/images/default_album.png',
          playCount: 1500000
        },
        {
          id: '2', 
          title: '대표곡 2',
          duration: '4:12',
          albumCover: '/images/default_album.png',
          playCount: 980000
        },
        {
          id: '3',
          title: '대표곡 3', 
          duration: '3:28',
          albumCover: '/images/default_album.png',
          playCount: 750000
        }
      ]);

      // 아티스트의 앨범 목록 조회 (임시 데이터)
      setAlbums([
        {
          id: '1',
          title: '최신 앨범',
          releaseDate: '2024-01-15',
          coverUrl: '/images/default_album.png',
          trackCount: 12
        },
        {
          id: '2',
          title: '이전 앨범',
          releaseDate: '2023-06-20',
          coverUrl: '/images/default_album.png', 
          trackCount: 10
        }
      ]);

      // 좋아요 및 팔로우 상태 조회
      if (user?.id) {
        const likeStatus = await artistApi.isLiked(id, user.id);
        setIsLiked(likeStatus);
        
        // 팔로우 상태는 임시로 false 설정 (API 구현 후 연동)
        setIsFollowed(false);
      }

      // 좋아요 수 조회
      const likes = await artistApi.getLikeCount(id);
      setLikeCount(likes);
      
      // 팔로워 수는 임시로 설정 (API 구현 후 연동)
      setFollowerCount(artistData.followerCount || 0);

    } catch (err) {
      console.error('아티스트 데이터 조회 실패:', err);
      setError('아티스트 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = async () => {
    if (!user?.id) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const newLikeStatus = await artistApi.toggleLike(id, user.id);
      setIsLiked(newLikeStatus);
      
      const newLikeCount = await artistApi.getLikeCount(id);
      setLikeCount(newLikeCount);
    } catch (err) {
      console.error('좋아요 토글 실패:', err);
      alert('좋아요 처리에 실패했습니다.');
    }
  };

  const handleFollowToggle = () => {
    if (!user?.id) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 팔로우 기능은 현재 개발 중
    setIsFollowed(!isFollowed);
    setFollowerCount(prev => isFollowed ? prev - 1 : prev + 1);
    alert('팔로우 기능은 현재 개발 중입니다.');
  };

  const handlePlaySong = (song) => {
    playSong({
      id: song.id,
      title: song.title,
      artist: artist?.name || '알 수 없는 아티스트',
      coverUrl: song.albumCover,
      url: song.audioUrl || ''
    });
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="artist-detail-loading">
        <div className="loading-spinner"></div>
        <p>아티스트 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="artist-detail-error">
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="back-button">
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="artist-detail-page">
      {/* 헤더 섹션 */}
      <div className="artist-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <FaArrowLeft /> 뒤로가기
        </button>
        
        <div className="artist-hero">
          <div className="artist-image-container">
            <img 
              src={artist?.profileImageUrl || '/images/default_artist.png'} 
              alt={artist?.name}
              className="artist-main-image"
            />
          </div>
          
          <div className="artist-info">
            <h1 className="artist-name">{artist?.name || '아티스트 이름'}</h1>
            <p className="artist-description">
              {artist?.description || '아티스트 소개가 없습니다.'}
            </p>
            
            <div className="artist-stats">
              <span className="stat-item">
                <FaHeart className="stat-icon" />
                좋아요 {formatNumber(likeCount)}
              </span>
              <span className="stat-item">
                <FaUserCheck className="stat-icon" />
                팔로워 {formatNumber(followerCount)}
              </span>
            </div>
            
            <div className="artist-actions">
              <button 
                onClick={handleLikeToggle}
                className={`action-button like-button ${isLiked ? 'liked' : ''}`}
              >
                {isLiked ? <FaHeart /> : <FaRegHeart />}
                {isLiked ? '좋아요 취소' : '좋아요'}
              </button>
              
              <button 
                onClick={handleFollowToggle}
                className={`action-button follow-button ${isFollowed ? 'followed' : ''}`}
              >
                {isFollowed ? <FaUserCheck /> : <FaUserPlus />}
                {isFollowed ? '팔로잉' : '팔로우'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 인기곡 섹션 */}
      <div className="artist-content">
        <section className="popular-songs">
          <h2>인기곡</h2>
          <div className="songs-list">
            {songs.map((song, index) => (
              <div key={song.id} className="song-item">
                <div className="song-rank">{index + 1}</div>
                <div className="song-cover">
                  <img src={song.albumCover} alt={song.title} />
                  <button 
                    className="play-overlay"
                    onClick={() => handlePlaySong(song)}
                  >
                    <FaPlay />
                  </button>
                </div>
                <div className="song-info">
                  <h4 className="song-title">{song.title}</h4>
                  <p className="song-artist">{artist?.name}</p>
                </div>
                <div className="song-stats">
                  <span className="play-count">{formatNumber(song.playCount)} 회 재생</span>
                  <span className="song-duration">{song.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 앨범 섹션 */}
        <section className="artist-albums">
          <h2>앨범</h2>
          <div className="albums-grid">
            {albums.map(album => (
              <div key={album.id} className="album-card">
                <div className="album-cover">
                  <img src={album.coverUrl} alt={album.title} />
                </div>
                <div className="album-info">
                  <h4 className="album-title">{album.title}</h4>
                  <p className="album-date">{album.releaseDate}</p>
                  <p className="album-tracks">{album.trackCount}곡</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ArtistDetailPage;
