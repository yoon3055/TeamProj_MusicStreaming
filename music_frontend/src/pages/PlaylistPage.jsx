// src/pages/PlaylistPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // 🌐 백엔드 통신을 위한 axios 임포트

import '../styles/PlaylistPage.css'; // ✨ CSS 파일 임포트

const PlaylistPage = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true); // 🌐 로딩 상태 추가

  // 🌐 localStorage에서 토큰 값을 가져옵니다.
  const token = localStorage.getItem('token');

  // 🌐 사용자 플레이리스트 목록 가져오기
  const fetchPlaylists = useCallback(async () => {
    setLoading(true);
    try {
      // 🌐 API 호출: /api/playlists 엔드포인트에서 모든 사용자 플레이리스트를 가져옵니다.
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/playlists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlaylists(res.data);
      console.log("🌐 사용자 플레이리스트 목록 로드 성공 (사이드바):", res.data);
    } catch (err) {
      console.error('🌐 사용자 플레이리스트 목록 가져오기 실패 (사이드바):', err);
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  // 🌐 로딩 중일 때 표시되는 UI
  if (loading) {
    return (
      <div className="playlist-page-loading">플레이리스트를 불러오는 중...</div>
    );
  }

  return (
    <div className="playlist-page-container">
      <h2 className="playlist-page-title">내 플레이리스트</h2>
      <div className="playlist-page-list-wrapper">
        {playlists.length === 0 ? (
          <p className="playlist-page-empty-message">생성된 플레이리스트가 없습니다.</p>
        ) : (
          playlists.map((pl) => (
            <div
              key={pl.id}
              className="playlist-page-item"
            >
              {/* 플레이리스트 커버 이미지 (있다면) */}
              {pl.coverUrl && (
                <img
                  src={pl.coverUrl}
                  alt={pl.name}
                  className="playlist-page-item-cover"
                />
              )}
              <Link
                to={`/playlist/${pl.id}`} // 🌐 클릭 시 전체 페이지 플레이리스트 상세로 이동
                className="playlist-page-item-link"
              >
                {pl.name}
              </Link>
              {pl.songCount !== undefined && (
                <span className="playlist-page-item-song-count">
                  {pl.songCount}곡
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PlaylistPage;