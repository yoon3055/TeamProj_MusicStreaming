// src/pages/AlbumIconPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // 🌐 백엔드 통신을 위한 axios 임포트
import Albumcard from '../component/Albumcard'; // Albumcard 컴포넌트 임포트

import '../styles/AlbumiconPage.css'; // ✨ CSS 파일 임포트

const AlbumArtPage = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAlbums = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/albums`);
      setAlbums(res.data);
      console.log("🌐 앨범 데이터 로드 성공:", res.data);
    } catch (err) {
      console.error('🌐 앨범 가져오기 실패:', err);
      setError('앨범을 불러오는 데 실패했습니다.');
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  if (loading) {
    return (
      <div className="album-art-loading">
        앨범을 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div className="album-art-page-container">
      <h2 className="album-art-page-title">
        앨범 아트 갤러리
      </h2>

      <div className="album-art-grid">
        {error ? (
          <p className="album-art-message album-art-error-message">{error}</p>
        ) : albums.length === 0 ? (
          <p className="album-art-message album-art-empty-message">
            표시할 앨범이 없습니다.
          </p>
        ) : (
          albums.map((album) => (
            <Albumcard key={album.id} album={album} />
          ))
        )}
      </div>
    </div>
  );
};

export default AlbumArtPage;