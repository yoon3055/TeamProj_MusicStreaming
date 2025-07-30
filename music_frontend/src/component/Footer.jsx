// src/component/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

import '../styles/Footer.css'; // ✨ CSS 파일 임포트

const Footer = () => {
  return (
    <footer className="app-footer"> {/* ✨ 클래스 적용 */}
      <p className="footer-copyright"> {/* ✨ 클래스 적용 */}
        &copy; 2025 Your Music App. All rights reserved.
      </p>
      <Link to="/MainPage" className="footer-app-link"> {/* ✨ 클래스 적용 */}
        <h4> 음악 스트리밍 사이트 </h4>
      </Link>
    </footer>
  );
};

export default Footer;