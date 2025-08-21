// src/pages/ArtistInfoPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlay, FaPause, FaMusic } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { MusicPlayerContext } from '../context/MusicPlayerContext';
import { artistApi } from '../api/artistApi';
import '../styles/ArtistInfoPage.css';

const ArtistInfoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { playSong, currentSong, isPlaying } = useContext(MusicPlayerContext);

  // 상태 관리 - DB 필드만 사용
  const [artistData, setArtistData] = useState(null);
  const [artistSongs, setArtistSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [songsLoading, setSongsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    loadArtistData();
  }, [id]);

  const loadArtistData = async () => {
    try {
      setIsLoading(true);
      
      // 아티스트 기본 정보 조회 (DB 필드만)
      const data = await artistApi.getArtistById(id);
      setArtistData(data);

      // 좋아요 상태 확인
      if (user?.id) {
        try {
          const liked = await artistApi.isLiked(id, user.id);
          setIsLiked(liked);
        } catch (likeError) {
          console.log('좋아요 상태 확인 실패:', likeError);
          setIsLiked(false);
        }
      }

      // 좋아요 수 조회
      try {
        const count = await artistApi.getLikeCount(id);
        setLikeCount(count);
      } catch (countError) {
        console.log('좋아요 수 조회 실패:', countError);
        setLikeCount(0);
      }

      // 아티스트의 노래 목록 조회
      loadArtistSongs();

    } catch (err) {
      console.error('아티스트 데이터 로드 실패:', err);
      setError('아티스트 정보를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadArtistSongs = async () => {
    try {
      setSongsLoading(true);
      const songs = await artistApi.getArtistSongs(id);
      setArtistSongs(songs || []);
      console.log(`아티스트 ${id}의 노래 ${songs?.length || 0}개 로드됨`);
    } catch (err) {
      console.error('아티스트 노래 목록 조회 실패:', err);
      setArtistSongs([]);
    } finally {
      setSongsLoading(false);
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
      
      const newCount = await artistApi.getLikeCount(id);
      setLikeCount(newCount);
    } catch (err) {
      console.error('좋아요 토글 실패:', err);
      // 임시로 로컬 상태만 변경
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR');
    } catch {
      return dateString;
    }
  };

  const handlePlaySong = (song) => {
    if (playSong) {
      playSong({
        id: song.id,
        title: song.title,
        artist: artistData?.name || '알 수 없는 아티스트',
        coverUrl: song.albumCover || '/images/default_album.png',
        url: song.audioUrl || ''
      });
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="artist-info-loading">
        <div className="loading-circle"></div>
        <p>아티스트 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="artist-info-error">
        <h2>오류 발생</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="error-back-btn">
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="artist-info-page">

      {/* 아티스트 설명 섹션 */}
      {artistData?.description && (
        <div className="artist-description-section">
          <h3>아티스트 소개</h3>
          <div className="description-content">
            <div className="artist-profile-image">
              <img 
                src={artistData?.profileImage || '/images/default_artist.png'} 
                alt={artistData?.name || '아티스트'}
                onError={(e) => {
                  e.target.src = '/images/default_artist.png';
                }}
              />
            </div>
            <p>{artistData.description}</p>
          </div>
        </div>
      )}

      {/* 아티스트 정보 요약 */}
      <div className="artist-info-summary">
        <h3>정보</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">이름</span>
            <span className="info-value">{artistData?.name || '정보 없음'}</span>
          </div>
          {artistData?.genre && (
            <div className="info-item">
              <span className="info-label">장르</span>
              <span className="info-value">{artistData.genre}</span>
            </div>
          )}
          <div className="info-item">
            <span className="info-label">좋아요 수</span>
            <span className="info-value">{formatNumber(likeCount)}</span>
          </div>
        </div>
      </div>

      {/* 아티스트 노래 목록 섹션 */}
      <div className="artist-songs-section">
        <h3>등록된 노래</h3>
        {songsLoading ? (
          <div className="songs-loading">
            <p>노래 목록을 불러오는 중...</p>
          </div>
        ) : artistSongs.length > 0 ? (
          <div className="songs-table">
            <div className="songs-header">
              <div className="header-artist">아티스트</div>
              <div className="header-title">제목</div>
              <div className="header-genre">장르</div>
            </div>
            <div className="songs-list">
              {artistSongs.map((song, index) => (
                <div key={song.id} className="song-row">
                  <div className="song-artist">{artistData?.name}</div>
                  <div className="song-title">{song.title}</div>
                  <div className="song-genre">{song.genre || '-'}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="no-songs">
            <FaMusic className="no-songs-icon" />
            <p>등록된 노래가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistInfoPage;
