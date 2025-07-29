import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

import '../styles/Header.css';

const Header = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('jwt'); // Check if JWT exists in local storage

  const handleLogout = () => {
    localStorage.removeItem('jwt'); // Clear JWT from local storage
    navigate('/'); // Redirect to home page
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <Link to="/" className="header-logo-link">
          <svg className="header-logo-icon" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
          </svg>
          <h2 className="header-app-title">Music App</h2>
        </Link>
      </div>

      <Navbar />

      <div className="header-right">
        <Link to="/subscription-plans" className="header-link">이용권 구매</Link>
        <Link to="/my-subscription" className="header-link">내 구독 관리</Link>
        
        {isLoggedIn ? (
          <button onClick={handleLogout} className="header-button header-button-login">
            로그아웃
          </button>
        ) : (
          <>
            <Link to="/login" className="header-button header-button-login">로그인</Link>
            <Link to="/signup" className="header-button header-button-signup">회원가입</Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;