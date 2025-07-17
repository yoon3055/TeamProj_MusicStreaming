// src/component/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

import '../styles/Header.css'; // ✨ CSS 파일 임포트

const Header = () => {
  return (
    <header className="app-header"> {/* ✨ 클래스 적용 */}
      <div className="header-left"> {/* ✨ 클래스 적용 */}
        <Link to="/" className="header-logo-link"> {/* ✨ 클래스 적용 */}
          {/* 로고 아이콘 (예시: SVG 또는 이미지) */}
          <svg className="header-logo-icon" fill="currentColor" viewBox="0 0 24 24"> {/* ✨ 클래스 적용 */}
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
          </svg>
          <h2 className="header-app-title">Music App</h2> {/* ✨ 클래스 적용 */}
        </Link>
      </div>

      <Navbar /> {/* Navbar 컴포넌트 (음악 검색 및 기타 메뉴가 여기에 들어갈 것으로 예상) */}

      <div className="header-right"> {/* ✨ 클래스 적용 */}
        {/* 구독 요금 판매 메뉴 */}
        <Link to="/subscription-plans" className="header-link">이용권 구매</Link> {/* ✨ 클래스 적용 */}

        {/* 정기 구독 관리 메뉴 (로그인된 사용자에게만 보이도록 조건부 렌더링 고려) */}
        <Link to="/my-subscription" className="header-link">내 구독 관리</Link> {/* ✨ 클래스 적용 */}

        {/* 로그인/회원가입 버튼 */}
        <Link to="/login" className="header-button header-button-login">로그인</Link> {/* ✨ 클래스 적용 */}
        <Link to="/signup" className="header-button header-button-signup">회원가입</Link> {/* ✨ 클래스 적용 */}
      </div>
    </header>
  );
};

export default Header;