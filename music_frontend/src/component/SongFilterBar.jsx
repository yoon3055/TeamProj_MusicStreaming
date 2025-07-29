import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { AuthContext } from '../context/AuthContext'; // 🌐 AuthContext에서 user와 구독 상태를 가져온다고 가정

import '../styles/SongFilterBar.css'; // ✨ CSS 파일 임포트

const SongFilterBar = ({ filterHighQuality, setFilterHighQuality }) => {
  // 🌐 AuthContext에서 사용자 정보를 가져옵니다.
  // user 객체에 isSubscribed 속성이 있다고 가정합니다.
  const { user } = useContext(AuthContext);
  // ⚠️ 실제 구독 상태를 user 객체에서 가져오세요.
  // 예: const isSubscribed = user?.subscription?.status === 'active';
  const isSubscribed = user ? user.isSubscribed : false; // 임시: 로그인 여부와 isSubscribed 상태를 조합

  return (
    <div className="song-filter-bar-container"> {/* ✨ 클래스 적용 */}
      <div className="song-filter-bar-label-wrapper"> {/* ✨ 클래스 적용 */}
        <label
          className={`
            song-filter-bar-label
            ${isSubscribed ? 'song-filter-bar-label-active' : 'song-filter-bar-label-disabled'} /* ✨ 클래스 적용 */
          `}
          htmlFor="highQualityToggle"
        >
          🎧 고음질만 보기
        </label>

        <button
          type="button"
          id="highQualityToggle"
          onClick={() => isSubscribed && setFilterHighQuality(!filterHighQuality)}
          className={`
            song-filter-toggle-button
            ${filterHighQuality ? 'song-filter-toggle-on' : 'song-filter-toggle-off'} /* ✨ 클래스 적용 */
            ${!isSubscribed ? 'song-filter-toggle-disabled' : ''} /* ✨ 클래스 적용 */
          `}
          title={isSubscribed ? "고음질 필터 토글" : "고음질은 구독 시 이용 가능합니다."}
          aria-pressed={filterHighQuality}
          disabled={!isSubscribed}
        >
          <span
            className={`
              song-filter-toggle-handle
              ${filterHighQuality ? 'song-filter-toggle-handle-on' : 'song-filter-toggle-handle-off'} /* ✨ 클래스 적용 */
            `}
          />
        </button>
      </div>

      {/* 비구독 회원에게만 안내 메시지 표시 */}
      {!isSubscribed && (
        <p className="song-filter-bar-message"> {/* ✨ 클래스 적용 */}
          {/* ✅ 이 부분을 <span>으로 감싸서 파싱 오류를 해결합니다. */}
          <span>* 고음질은 <Link to="/subscription" className="song-filter-bar-link">구독 시 이용 가능</Link>합니다.</span>
        </p>
      )}
    </div>
  );
};

SongFilterBar.propTypes = {
  filterHighQuality: PropTypes.bool.isRequired,
  setFilterHighQuality: PropTypes.func.isRequired,
};

export default SongFilterBar;