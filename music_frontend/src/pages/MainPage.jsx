// src/pages/MainPage.jsx
import React from 'react';
import RecommendPage from './RecommendPage';

import '../styles/MainPage.css'; // ✨ CSS 파일 임포트

const MainPage = () => {
  return (
    <div className="main-page-container"> {/* ✨ 클래스 적용 */}
      {/* 중앙 - 추천 영역 (RecommendPage의 내용이 여기에 들어갈 예정) */}
      <main className="main-page-content-area"> {/* ✨ 클래스 적용 */}
        {/* RecommendPage가 페이지 전체 너비와 패딩을 가지므로 여기서는 추가 스타일 불필요 */}
        <RecommendPage />
      </main>
    </div>
  );
};

export default MainPage;