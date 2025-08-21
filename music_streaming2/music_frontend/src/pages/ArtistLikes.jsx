import React from 'react';
import { useNavigate } from 'react-router-dom';
import ArtistLikesCard from '../component/ArtistLikesCard';
import '../styles/MyPage.css';

export default function ArtistLikes() {
  const navigate = useNavigate();

  const handleBackToMain = () => {
    navigate('/myPage');
  };

  return (
    <div className="mypage-container">
      {/* 돌아가기 버튼 */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleBackToMain}
          className="back-button"
        >
          ← 마이페이지로 돌아가기
        </button>
      </div>

      {/* 아티스트 좋아요 카드 영역 */}
      <div className="mypage-content" style={{ justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '1200px' }}>
          <ArtistLikesCard />
        </div>
      </div>
    </div>
  );
}
