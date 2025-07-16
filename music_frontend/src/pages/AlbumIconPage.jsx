// src/component/AlbumIcon.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import '../styles/AlbumiconPage.css'; // ✨ CSS 파일 임포트

const AlbumIcon = ({ album, size = 'md' }) => {
  return (
    <Link
      to={`/album/${album.id}`} // 🌐 클릭 시 앨범 상세 페이지로 이동
      className={`album-icon-container album-icon-size-${size}`} // ✨ 클래스 적용
      title={album.title} // 툴팁으로 앨범 제목 표시 (텍스트가 없으므로)
    >
      <img
        src={album.coverUrl || 'https://via.placeholder.com/48/333333/FFFFFF?text=A'}
        alt={album.title}
        className="album-icon-image" // ✨ 클래스 적용
      />
    </Link>
  );
};

AlbumIcon.propTypes = {
  album: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    coverUrl: PropTypes.string,
  }).isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

export default AlbumIcon;