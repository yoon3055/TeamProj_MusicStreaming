import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import '../styles/Header.css';

const Header = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('jwt');
  const handleLogout = () => {
    localStorage.removeItem('jwt');
    navigate('/');
  };

  return (
    <>
      <header className="app-header">
        <div className="header-left">
          <Link to="/" className="header-logo-link">
            <div className="header-logo-container">
              <div className="music-icon">🎵</div>
              <h2 className="header-app-title">Fruitify</h2>
              <div className="streaming-badge">STREAMING</div>
            </div>
          </Link>
        </div>

        <div className="header-center">
          <Navbar />
        </div>

        <div className="header-right">
          {isLoggedIn ? (
            <button onClick={handleLogout} className="header-button header-button-login">
              로그아웃
            </button>
          ) : (
            <Link to="/login" className="header-button header-button-login">로그인</Link>
          )}

          {!isLoggedIn && (
            <Link to="/signup" className="header-button header-button-signup signup-adjust">
              회원가입
            </Link>
          )}

        </div>
      </header>

    </>
  );
};

export default Header;
