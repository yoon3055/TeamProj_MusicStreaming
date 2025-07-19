// src/component/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim() !== '') {
      // 검색어가 있을 때 검색 결과 페이지로 이동 (예: /search?q=검색어)
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <nav className="app-navbar">
      {/* 주요 네비게이션 링크 */}
      <Link to="/explore" className="navbar-link">둘러보기</Link>
      <Link to="/library" className="navbar-link">보관함</Link>
      <Link to="/subscription" className="navbar-link">이용권</Link>

      {/* 검색 폼 */}
      <form className="navbar-search-container" onSubmit={handleSearch} role="search" aria-label="음악 검색">
        <input
          type="text"
          placeholder="자유롭게 검색해보세요."
          className="navbar-search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="음악 검색 입력"
        />
        <button type="submit" className="navbar-search-button" aria-label="검색 버튼">
          <svg className="navbar-search-icon" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
          </svg>
        </button>
      </form>

      {/* 고급 검색 버튼 */}
      <Link to="/advanced-search" className="navbar-advanced-search-button">
        여러 곡 한 번에 찾기
      </Link>
    </nav>
  );
};

export default Navbar;