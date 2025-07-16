// src/component/LoadingToast.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import '../styles/LoadingToast.css'; // ✨ CSS 파일 임포트

const LoadingToast = ({ isLoading, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(isLoading);
  }, [isLoading]);

  if (!isVisible) return null;

  return (
    <div className="loading-toast-container"> {/* ✨ 클래스 적용 */}
      {/* 로딩 스피너 */}
      <svg className="loading-toast-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> {/* ✨ 클래스 적용 */}
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>

      <span className="loading-toast-message">데이터를 불러오는 중입니다...</span> {/* ✨ 클래스 적용 */}

      {/* 닫기 버튼 */}
      {onDismiss && (
        <button onClick={onDismiss} className="loading-toast-dismiss-button" aria-label="알림 닫기"> {/* ✨ 클래스 적용 */}
          <svg className="loading-toast-dismiss-icon" fill="currentColor" viewBox="0 0 20 20"> {/* ✨ 클래스 적용 */}
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
          </svg>
        </button>
      )}
    </div>
  );
};

LoadingToast.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  onDismiss: PropTypes.func,
};

export default LoadingToast;