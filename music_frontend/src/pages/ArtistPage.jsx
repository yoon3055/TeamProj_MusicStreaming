// src/pages/ArtistPage.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios'; // 🌐 백엔드 통신을 위한 axios 임포트
import { AuthContext } from '../context/AuthContext'; // 🌐 AuthContext 임포트

import '../styles/ArtistPage.css'; // ✨ CSS 파일 임포트
import artistPlaceholder from '../assets/default-cover.jpg';

const ArtistPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext); // 🌐 사용자 정보 가져오기
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false); // 🌐 팔로우 상태 관리

  // 🌐 localStorage에서 토큰 값을 가져옵니다.
  const token = localStorage.getItem('token');

  // 🌐 아티스트 상세 정보 및 팔로우 상태 가져오기
  const fetchArtistData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const artistRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/artists/${id}`);
      setArtist(artistRes.data);

      // 🌐 로그인된 사용자라면 팔로우 상태도 함께 확인
      if (user && user.id) {
        const followRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/${user.id}/following-artists/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsFollowing(followRes.data.isFollowing); // 🌐 백엔드 응답에 따라 상태 설정
      }
    } catch (err) {
      console.error('🌐 아티스트 상세 정보 또는 팔로우 상태 가져오기 실패:', err);
      setError('아티스트 정보를 불러오는 데 실패했습니다.');
      setArtist(null);
    } finally {
      setLoading(false);
    }
  }, [id, user, token]); // 🌐 user와 token을 의존성에 추가

  useEffect(() => {
    fetchArtistData();
  }, [fetchArtistData]);

  // 🌐 팔로우 버튼 클릭 핸들러
  const handleFollowToggle = useCallback(async () => {
    if (!user) {
      alert('로그인 후 이용할 수 있는 기능입니다.');
      return;
    }
    try {
      if (isFollowing) {
        // 🌐 팔로우 취소 API 호출
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/users/${user.id}/following-artists/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsFollowing(false);
        alert('아티스트 팔로우를 취소했습니다.');
      } else {
        // 🌐 팔로우 설정 API 호출
        await axios.post(`${process.env.REACT_APP_API_URL}/api/users/${user.id}/following-artists`, { artistId: id }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsFollowing(true);
        alert('아티스트를 팔로우 했습니다!');
      }
    } catch (error) {
      console.error('🌐 팔로우 상태 변경 실패:', error);
      alert('팔로우 상태 변경에 실패했습니다.');
    }
  }, [id, isFollowing, user, token]); // 🌐 id, isFollowing, user, token을 의존성에 추가

  if (loading) {
    return (
      <div className="artist-page-loading">
        아티스트 정보를 불러오는 중입니다...
      </div>
    );
  }
  if (error || !artist) {
    return (
      <div className="artist-page-loading">
        {error || '아티스트를 찾을 수 없습니다.'}
      </div>
    );
  }

  return (
    <div className="artist-page-container">
      {/* 아티스트 프로필 섹션 */}
      <div className="artist-profile-section">
        <img
          src={artist.profileImageUrl || artistPlaceholder}
          alt={artist.name}
          className="artist-profile-image"
        />
        <div className="artist-profile-info">
          <div className="artist-profile-text-info">
            <h2 className="artist-profile-name">{artist.name}</h2>
            {artist.genre && (
              <p className="artist-profile-genre">장르: {artist.genre}</p>
            )}
            <p className="artist-profile-bio">
              {artist.bio || '아티스트 소개가 없습니다.'}
            </p>
          </div>

          {/* 팔로우 버튼 추가 */}
          <div className="artist-follow-action">
            <button
              onClick={handleFollowToggle}
              className={`artist-follow-button ${isFollowing ? 'artist-following' : ''}`}
            >
              {isFollowing ? (
                <svg className="artist-follow-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                </svg>
              ) : (
                <svg className="artist-follow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              )}
              <span>{isFollowing ? '팔로우 중' : '팔로우'}</span>
            </button>
          </div>

          {/* 🌐 소셜 미디어 링크 등 추가 정보 (선택 사항) */}
          {artist.socialLinks && (
            <div className="artist-social-links">
              {artist.socialLinks.facebook && (
                <a href={artist.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="artist-social-link">Facebook</a>
              )}
              {artist.socialLinks.twitter && (
                <a href={artist.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="artist-social-link">Twitter</a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 🌐 아티스트의 앨범 또는 인기곡 섹션 (선택 사항) */}
      {/*
      <div className="artist-albums-section">
        <h3 className="artist-section-title">주요 앨범</h3>
        <div className="artist-albums-grid">
          {artist.albums && artist.albums.map(album => (
            <Albumcard key={album.id} album={album} size="sm" />
          ))}
        </div>
      </div>

      <div className="artist-songs-section">
        <h3 className="artist-section-title">인기곡</h3>
        <ul className="artist-songs-list">
          {artist.topSongs && artist.topSongs.map((song, idx) => (
            <li key={song.id} className="artist-song-item">
              <span className="artist-song-title-text">{idx + 1}. {song.title}</span>
              <span className="artist-song-artist-text">{song.artist}</span>
            </li>
          ))}
        </ul>
      </div>
      */}
    </div>
  );
};

export default ArtistPage;