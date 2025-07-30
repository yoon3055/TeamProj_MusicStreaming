// src/pages/AlbumDetailPage.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios'; // 🌐 백엔드 통신을 위한 axios 임포트
import { MusicPlayerContext } from '../context/MusicPlayerContext';
import { AuthContext } from '../context/AuthContext'; // 🌐 AuthContext 임포트
import Albumcard from '../component/Albumcard.jsx';
import AlbumIcon from '../pages/AlbumIconPage.jsx';

import '../styles/AlbumDetailPage.css'; // ✨ CSS 파일 임포트

export const AlbumDetailPage = () => {
  const { id } = useParams();
  const { playSong, addToQueue } = useContext(MusicPlayerContext);
  const { user } = useContext(AuthContext); // 🌐 사용자 정보 가져오기
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false); // 🌐 좋아요 상태 관리

  // 🌐 앨범 상세 정보 및 좋아요 상태 가져오기
  useEffect(() => {
    const fetchAlbumData = async () => {
      try {
        // 🌐 API 호출: /api/albums/{id} 엔드포인트에서 앨범 데이터를 가져옵니다.
        const albumRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/albums/${id}`);
        setAlbum(albumRes.data);

        // 🌐 로그인된 사용자라면 좋아요 상태도 함께 확인
        if (user && user.id) {
          const likeRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/${user.id}/liked-albums/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          setIsLiked(likeRes.data.isLiked); // 🌐 백엔드 응답에 따라 상태 설정
        }
      } catch (error) {
        console.error('🌐 앨범 상세 정보 또는 좋아요 상태 가져오기 실패:', error);
        setAlbum(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbumData();
  }, [id, user]); // 🌐 user가 변경될 때도 다시 로드 (로그인/로그아웃 시)

  // 🌐 좋아요 버튼 클릭 핸들러
  const handleLikeToggle = async () => {
    if (!user) {
      alert('로그인 후 이용할 수 있는 기능입니다.');
      return;
    }
    try {
      if (isLiked) {
        // 🌐 좋아요 취소 API 호출
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/users/${user.id}/liked-albums/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setIsLiked(false);
        alert('앨범 좋아요를 취소했습니다.');
      } else {
        // 🌐 좋아요 설정 API 호출
        await axios.post(`${process.env.REACT_APP_API_URL}/api/users/${user.id}/liked-albums`, { albumId: id }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setIsLiked(true);
        alert('앨범을 좋아요 했습니다!');
      }
    } catch (error) {
      console.error('🌐 좋아요 상태 변경 실패:', error);
      alert('좋아요 상태 변경에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="album-detail-loading">
        앨범 정보를 불러오는 중입니다...
      </div>
    );
  }
  if (!album) {
    return (
      <div className="album-detail-loading">
        앨범을 찾을 수 없습니다.
      </div>
    );
  }

  // 🌐 전체 재생 버튼 클릭 핸들러
  const handlePlayAll = () => {
    if (album.songs && album.songs.length > 0) {
      // 🌐 MusicPlayerContext를 통해 모든 곡을 재생 목록에 추가하고 첫 곡을 재생합니다.
      addToQueue(album.songs);
      playSong(album.songs[0]);
      console.log(`🌐 앨범 [${album.title}] 전체 재생 시작`);
    } else {
      alert('재생할 곡이 없습니다.');
    }
  };

  // 🌐 개별 곡 클릭 핸들러
  const handleSongClick = (song) => {
    // 🌐 MusicPlayerContext를 통해 앨범의 모든 곡을 재생 목록에 추가하고 클릭한 곡을 재생합니다.
    addToQueue(album.songs);
    playSong(song);
    console.log(`🌐 [${song.title}] 재생 시작`);
  };

  return (
    <div className="album-detail-page-container">
      {/* 앨범 상세 정보 상단 섹션 */}
      <div className="album-detail-header-section">
        {/* 앨범 커버 및 기본 정보 (Albumcard 컴포넌트 활용) */}
        <Albumcard album={album} size="lg" />

        <div className="album-detail-info-area">
          <div className="album-detail-text-info">
            <h2 className="album-detail-title">{album.title}</h2>
            <p className="album-detail-artist">{album.artist}</p>
            {/* 🌐 앨범 추가 정보 (예: 발매일, 장르 등) */}
            {album.releaseDate && (
              <p className="album-detail-meta">발매일: {album.releaseDate}</p>
            )}
            {album.genre && (
              <p className="album-detail-meta">장르: {album.genre}</p>
            )}
          </div>

          {/* '전체 재생' 버튼과 '좋아요' 버튼 그룹 */}
          <div className="album-detail-actions">
            <button
              onClick={handlePlayAll}
              className="album-detail-play-button"
            >
              전체 재생 ▶
            </button>
            <button
              onClick={handleLikeToggle}
              className={`album-detail-like-button ${isLiked ? 'album-detail-liked' : ''}`}
            >
              {isLiked ? (
                <svg className="album-detail-like-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
                </svg>
              ) : (
                <svg className="album-detail-like-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
              )}
              <span>{isLiked ? '좋아요 취소' : '좋아요'}</span>
            </button>
          </div>
        </div>
      </div>

      <h3 className="album-detail-songs-title">수록곡</h3>
      <ul className="album-detail-songs-list">
        {album.songs && album.songs.length > 0 ? (
          album.songs.map((song, idx) => (
            <li
              key={song.id}
              className="album-detail-song-item"
              onClick={() => handleSongClick(song)}
            >
              <div className="album-detail-song-meta">
                {/* 🌐 앨범에 속한 노래들에 맞춰서 아이콘처럼 이미지 표시 (AlbumIcon 활용) */}
                <AlbumIcon album={album} size="sm" />
                <span className="album-detail-song-number">{idx + 1}.</span>
                <span className="album-detail-song-title">{song.title}</span>
              </div>
              {/* 🌐 곡 길이 표시 (duration은 초 단위라고 가정) */}
              {song.duration && (
                <span className="album-detail-song-duration">
                  {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                </span>
              )}
            </li>
          ))
        ) : (
          <li className="album-detail-no-songs">수록곡이 없습니다.</li>
        )}
      </ul>
    </div>
  );
};