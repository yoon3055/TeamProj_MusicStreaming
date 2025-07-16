// src/component/InteractiveSongCard.jsx
import React from 'react';
import { motion } from 'framer-motion'; // framer-motion 임포트
import PropTypes from 'prop-types';

import '../styles/InteractiveSongCard.css'; // ✨ CSS 파일 임포트

const InteractiveSongCard = ({ song, onPlay }) => {
  return (
    <motion.div
      // framer-motion을 통해 마우스 오버 시 확대, 클릭 시 축소 애니메이션 적용
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="interactive-song-card-container" /* ✨ 클래스 적용 */
      onClick={() => onPlay(song)}
    >
      <div className="interactive-song-card-details"> {/* ✨ 클래스 적용 */}
        <img
          src={song.coverUrl || 'https://via.placeholder.com/64/333333/FFFFFF?text=No+Cover'}
          alt={song.title}
          className="interactive-song-card-cover" /* ✨ 클래스 적용 */
        />
        <div className="interactive-song-card-text-content"> {/* ✨ 클래스 적용 */}
          <span className="interactive-song-card-title">{song.title}</span> {/* ✨ 클래스 적용 */}
          <span className="interactive-song-card-artist">{song.artist}</span> {/* ✨ 클래스 적용 */}
          {song.isHighQuality && (
            <span className="interactive-song-card-quality-badge">고음질</span> {/* ✨ 클래스 적용 */}
          )}
        </div>
      </div>
    </motion.div>
  );
};

InteractiveSongCard.propTypes = {
  song: PropTypes.shape({
    title: PropTypes.string.isRequired,
    artist: PropTypes.string.isRequired,
    coverUrl: PropTypes.string,
    isHighQuality: PropTypes.bool,
  }).isRequired,
  onPlay: PropTypes.func,
};

export default InteractiveSongCard;