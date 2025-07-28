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
    <header className="app-header">
    <div className="header-left">
  <Link to="/" className="header-logo-link">
  
    
    <img src="/images/logo.png" alt="Logo" className="header-logo-image" />
    <h2 className="header-app-title">Music App</h2>
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