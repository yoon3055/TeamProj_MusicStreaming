import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LikesCard from '../component/LikesCard';
import SubscriptionStatusCard from '../component/SubscriptionStatusCard';
import '../styles/MyPage.css';

const cardData = [
  {
    id: 1,
    title: '프로필 편집',
    description: '닉네임, 이미지, 비밀번호 수정',
    image: '/images/K-045.jpg',
    icon: '/icons/profile.png',
    link: '/profile',
  },
  {
    id: 2,
    title: '구독 조회',
    description: '데이터베이스 구독 정보',
    image: '/images/K-022.jpg',
    icon: '/icons/database.png',
    link: '/simple-subscription',
  },
  {
    id: 3,
    title: '플레이리스트 생성',
    description: '새로운 플레이리스트 만들기',
    image: '/images/K-025.jpg',
    icon: '/icons/create-playlist.png',
    link: '/create-playlist',
  },
  {
    id: 4,
    title: '좋아요',
    description: 'SONG',
    image: '/images/K-019.jpg',
    icon: '/icons/like.png',
    link: '/likes',
  },
  {
    id: 5,
    title: '좋아요',
    description: 'ARTIST',
    image: '/images/K-020.jpg',
    icon: '/icons/artist-like.png',
    link: '/artist-likes',
  },
  {
    id: 6,
    title: '커뮤니티',
    description: '작성한 댓글 보기',
    image: '/images/K-018.jpg',
    icon: '/icons/comments.png',
    link: '/comments',
  },
  {
    id: 7,
    title: '나만의 플레이리스트',
    description: '보관한 노래 목록',
    image: '/images/K-037.jpg',
    icon: '/icons/playlist.png',
    link: '/my-playlists',
  },
  {
    id: 8,
    title: '재생 기록',
    description: '최근 들은 곡 보기',
    image: '/images/K-021.jpg',
    icon: '/icons/history.png',
    link: '/history',
  },
];

export default function MyPage() {
  const [showLikes, setShowLikes] = useState(false);

  const handleLikesClick = (e) => {
    e.preventDefault();
    setShowLikes(true);
  };

  const handleBackToMain = () => {
    setShowLikes(false);
  };

  if (showLikes) {
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

        {/* 좋아요 카드 영역 */}
        <div className="mypage-content" style={{ justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '1200px' }}>
            <LikesCard />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="content-wrapper" style={{ textAlign: 'center' }}>
        <h1>마이 페이지</h1>
      </div>

      {/* 카드 영역 */}
      <div className="mypage-grid">
          {cardData.map((card) => {
            if (card.id === 6) { // 즐겨찾기 음악 카드
              return (
                <div key={card.id} className="mypage-card" onClick={handleLikesClick} style={{ cursor: 'pointer' }}>
                  <div
                    className="mypage-card-content"
                    style={{
                      backgroundImage: `url(${card.image})`,
                    }}
                  >
                    <div className="overlay">
                      <h3>{card.title}</h3>
                      <p>{card.description}</p>
                    </div>
                    <div className="card-icon-overlay">
                      <img src={card.icon} alt={card.title} />
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <Link to={card.link} key={card.id} className="mypage-card">
                <div
                  className="mypage-card-content"
                  style={{
                    backgroundImage: `url(${card.image})`,
                  }}
                >
                  <div className="overlay">
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                  </div>
                  <div className="card-icon-overlay">
                    <img src={card.icon} alt={card.title} />
                  </div>
                </div>
              </Link>
            );
          })}
      </div>
    </>
  );
}