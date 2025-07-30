// src/component/SongFilterBar.jsx
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import {AuthContext} from '../context/AuthContext';
import '../styles/SongFilterBar.css';

const SongFilterBar = ({ filterHighQuality, setFilterHighQuality }) => {
  const { user } = useContext(AuthContext);
  const isSubscribed = user?.isSubscribed ?? false;

  return (
    <div className="song-filter-bar-container">
      {/*  항상 작동하는 동적 이퀄라이저 (좌측) */}
      <div className="static-equalizer">
        <div className="equalizer-bar">
          {[...Array(20)].map((_, idx) => (
            <div key={idx} className="bar" style={{ '--i': idx }}></div>
          ))}
        </div>
      </div>

      {/*  우측 영역: 안내 메시지 + 토글 버튼 + 연동 이퀄라이저 */}
      <div className="song-filter-bar-options">
        {/* 2. 고음질 안내 메시지 */}
        <p className="song-filter-bar-message">
          <span>
            * 고음질은{' '}
            <Link to="/subscription" className="song-filter-bar-link">
              구독 시 이용 가능
            </Link>
            합니다.
          </span>
        </p>

        {/* 3. 고음질 필터 토글 */}
        <div className="song-filter-bar-label-wrapper">
          <label
            htmlFor="highQualityToggle"
            className={`song-filter-bar-label ${
              isSubscribed
                ? 'song-filter-bar-label-active'
                : 'song-filter-bar-label-disabled'
            }`}
          >
            고음질 보기
          </label>

          <button
            type="button"
            id="highQualityToggle"
            onClick={() => isSubscribed && setFilterHighQuality(!filterHighQuality)}
            className={`
              song-filter-toggle-button
              ${filterHighQuality ? 'song-filter-toggle-on' : 'song-filter-toggle-off'}
              ${!isSubscribed ? 'song-filter-toggle-disabled' : ''}
            `}
            title={
              isSubscribed
                ? '고음질 필터 토글'
                : '고음질은 구독 시 이용 가능합니다.'
            }
            aria-pressed={filterHighQuality}
            disabled={!isSubscribed}
          >
            <span
              className={`
                song-filter-toggle-handle
                ${filterHighQuality ? 'song-filter-toggle-handle-on' : 'song-filter-toggle-handle-off'}
              `}
            />
          </button>
        </div>
 
       
      </div>
    </div>
  );
};

SongFilterBar.propTypes = {
  filterHighQuality: PropTypes.bool.isRequired,
  setFilterHighQuality: PropTypes.func.isRequired,
};

export default SongFilterBar;
