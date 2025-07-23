// src/components/SidebarMiniCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import '../styles/SidebarMiniCard.css'; // ✨ 새로 생성할 CSS 파일

const SidebarMiniCard = ({ item, type, onPlay }) => {
  // type에 따라 Link 경로 결정 (노래 상세 or 플레이리스트 상세)
  const linkPath = type === 'song' ? `/song/${item.id}` : `/playlist/${item.id}`;

  return (
    <div className="sidebar-mini-card">
      <Link to={linkPath} className="sidebar-mini-card-link">
        <img src={item.coverUrl || item.profileImageUrl || '/images/default_cover.jpg'} alt={item.title || item.name} className="sidebar-mini-card-image" />
        <div className="sidebar-mini-card-info">
          <h4 className="sidebar-mini-card-title">{item.title || item.name}</h4>
          {item.artist && <p className="sidebar-mini-card-artist">{item.artist}</p>}
        </div>
      </Link>
      {/* 재생 버튼 (옵션: 필요 시 추가) */}
      {type === 'song' && onPlay && ( // 노래일 경우에만 재생 버튼 표시
        <button
          onClick={(e) => { e.preventDefault(); onPlay(item); }}
          className="sidebar-mini-card-play-button"
          aria-label={`${item.title} 재생`}
        >
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
          </svg>
        </button>
      )}
    </div>
  );
};

SidebarMiniCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string, // 노래/플레이리스트 제목
    name: PropTypes.string,  // 아티스트 이름 등 (타이틀 대체 가능)
    artist: PropTypes.string,
    coverUrl: PropTypes.string,
    profileImageUrl: PropTypes.string,
  }).isRequired,
  type: PropTypes.oneOf(['song', 'playlist', 'artist']).isRequired, // 아이템 타입 (경로 및 내용 조절)
  onPlay: PropTypes.func, // 재생 콜백 함수
};

export default SidebarMiniCard;