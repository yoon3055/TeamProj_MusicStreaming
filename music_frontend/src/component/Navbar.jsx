// src/component/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

import '../styles/Navbar.css'; // ✨ CSS 파일 임포트

const Navbar = () => {
  return (
    <nav className="app-navbar">
      {/* 1. 주요 네비게이션 링크 */}
      <Link to="/explore" className="navbar-link">둘러보기</Link>
      <Link to="/library" className="navbar-link">보관함</Link>

      {/* 2. 음악 검색 입력 필드 */}
      {/* 🌐 검색 기능은 백엔드 API와의 연동이 필요합니다. */}
      <div className="navbar-search-container">
        <input
          type="text"
          placeholder="1억 곡 FLO에서 검색해보세요."
          className="navbar-search-input"
        />
        {/* 검색 아이콘 (선택 사항) */}
        <button className="navbar-search-button" aria-label="검색">
          <svg className="navbar-search-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
          </svg>
        </button>
      </div>

      {/* 3. 추가적인 검색 기능 버튼 (예: 여러 곡 한 번에 찾기) */}
      {/* 🌐 이 버튼 클릭 시 백엔드 연동 또는 모달 팝업 등의 기능이 필요합니다. */}
      <Link
        to="/advanced-search"
        className="navbar-advanced-search-button"
      >
        여러 곡 한 번에 찾기
      </Link>
    </nav>
  );
};

export default Navbar;