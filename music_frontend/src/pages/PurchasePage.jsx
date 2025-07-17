// src/pages/PurchasePage.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; // 🌐 백엔드 통신을 위한 axios 임포트

import '../styles/PurchasePage.css'; // ✨ CSS 파일 임포트

export const PurchasePage = () => {
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [params] = useSearchParams();
  const albumId = params.get('albumId');
  const navigate = useNavigate();

  // 🌐 앨범 정보 가져오기
  useEffect(() => {
    if (albumId) {
      axios.get(`${process.env.REACT_APP_API_URL}/api/albums/${albumId}`)
        .then(res => {
          setAlbum(res.data);
          console.log("🌐 앨범 구매 페이지 - 앨범 정보 로드 성공:", res.data);
        })
        .catch(err => {
          console.error('🌐 앨범 조회 실패', err);
          setAlbum(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
      setAlbum(null);
    }
  }, [albumId]);

  // 🌐 구매 처리 핸들러
  const handlePurchase = async () => {
    if (!albumId) {
      alert('구매할 앨범 정보가 없습니다.');
      return;
    }
    try {
      // 🌐 백엔드 API 호출: 앨범 구매
      await axios.post(`${process.env.REACT_APP_API_URL}/api/purchases`, { albumId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, // 🌐 인증 토큰
      });
      alert('앨범이 성공적으로 구매되었습니다.');
      console.log(`🌐 앨범 ID ${albumId} 구매 성공`);
      // 🌐 구매 성공 후 사용자 프로필 페이지 또는 구매 내역 페이지로 이동
      navigate('/profile');
    } catch (err) {
      alert('구매 실패: ' + (err.response?.data?.message || err.message));
      console.error('🌐 앨범 구매 실패:', err);
    }
  };

  // 🌐 로딩 중일 때 표시되는 UI
  if (loading) {
    return (
      <div className="purchase-page-loading">
        앨범 정보를 불러오는 중입니다...
      </div>
    );
  }

  // 앨범을 찾을 수 없을 때 표시되는 UI
  if (!album) {
    return (
      <div className="purchase-page-loading">
        앨범을 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="purchase-page-container">
      <div className="purchase-card">
        <h2 className="purchase-title">앨범 구매</h2>

        {/* 앨범 커버 이미지 */}
        <img
          src={album.coverUrl}
          alt={album.title}
          className="purchase-album-cover"
        />

        {/* 앨범 정보 */}
        <h3 className="purchase-album-title">{album.title}</h3>
        <p className="purchase-album-artist">{album.artist}</p>
        <p className="purchase-album-price">
          ₩ {album.price?.toLocaleString()}
        </p>

        {/* 구매하기 버튼 */}
        <button onClick={handlePurchase} className="purchase-button">
          구매하기
        </button>
      </div>
    </div>
  );
};