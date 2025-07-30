// src/pages/LikesFollowsPage.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios'; // 🌐 백엔드 통신을 위한 axios 임포트
import { Link } from 'react-router-dom'; // 아티스트 링크를 위한 Link 임포트
import Songcard from '../component/Songcard.jsx'; // Songcard 컴포넌트 임포트
import { MusicPlayerContext } from '../context/MusicPlayerContext';

import '../styles/LikesFollowsPage.css'; // ✨ CSS 파일 임포트

const LikesFollowsPage = () => {
  // 🌐 MusicPlayerContext에서 음악 재생 함수를 가져옵니다.
  const { playSong } = useContext(MusicPlayerContext);
  const [likes, setLikes] = useState([]); // 좋아요한 곡 목록
  const [follows, setFollows] = useState([]); // 팔로우한 아티스트 목록
  const [loading, setLoading] = useState(true); // 🌐 로딩 상태 추가
  const [error, setError] = useState(null); // 🌐 에러 상태 추가

  // 🌐 localStorage에서 토큰 값을 가져옵니다.
  const token = localStorage.getItem('token');

  // 🌐 좋아요 및 팔로우 데이터 가져오기
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 🌐 좋아요한 곡 목록 API 호출
      const likesRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/likes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLikes(likesRes.data);
      console.log("🌐 좋아요한 곡 로드 성공:", likesRes.data);

      // 🌐 팔로우한 아티스트 목록 API 호출
      const followsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/follows`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFollows(followsRes.data);
      console.log("🌐 팔로우한 아티스트 로드 성공:", followsRes.data);

    } catch (err) {
      console.error('🌐 좋아요/팔로우 목록 가져오기 실패:', err);
      setError('좋아요 및 팔로우 목록을 불러오는 데 실패했습니다.');
      setLikes([]);
      setFollows([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 🌐 로딩 중일 때 표시되는 UI
  if (loading) {
    return (
      <div className="likes-follows-page-loading">
        좋아요 및 팔로우 목록을 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div className="likes-follows-page-container"> {/* ✨ 클래스 적용 */}
      <h2 className="likes-follows-page-title">내 좋아요 & 팔로우</h2> {/* ✨ 클래스 적용 */}

      {/* 좋아요한 곡 섹션 */}
      <h3 className="likes-follows-section-title">좋아요한 곡</h3> {/* ✨ 클래스 적용 */}
      <div className="likes-follows-songs-grid"> {/* ✨ 클래스 적용 */}
        {error ? (
          <p className="likes-follows-message likes-follows-error-message">{error}</p>
        ) : likes.length === 0 ? (
          <p className="likes-follows-message likes-follows-empty-message">
            좋아요한 곡이 없습니다.
          </p>
        ) : (
          likes.map((song) => (
            <Songcard key={song.id} song={song} onPlay={playSong} />
          ))
        )}
      </div>

      {/* 팔로우한 아티스트 섹션 */}
      <h3 className="likes-follows-section-title">팔로우한 아티스트</h3> {/* ✨ 클래스 적용 */}
      <div className="likes-follows-artists-list"> {/* ✨ 클래스 적용 */}
        {error ? (
          <p className="likes-follows-message likes-follows-error-message">{error}</p>
        ) : follows.length === 0 ? (
          <p className="likes-follows-message likes-follows-empty-message">
            팔로우한 아티스트가 없습니다.
          </p>
        ) : (
          follows.map((artist) => (
            <div
              key={artist.id}
              className="artist-item" /* ✨ 클래스 적용 */
            >
              {/* 🌐 아티스트 프로필 이미지 (있다면) */}
              {artist.profileImageUrl && (
                <img
                  src={artist.profileImageUrl}
                  alt={artist.name}
                  className="artist-item-profile-image" /* ✨ 클래스 적용 */
                />
              )}
              <Link
                to={`/artist/${artist.id}`}
                className="artist-item-link" /* ✨ 클래스 적용 */
              >
                {artist.name}
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LikesFollowsPage;