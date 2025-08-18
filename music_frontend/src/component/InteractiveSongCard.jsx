import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import defaultCover from '../assets/default-cover.jpg';

import '../styles/InteractiveSongCard.css'; // ✨ CSS 파일 임포트

const InteractiveSongCard = ({ song, onPlay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="interactive-song-card-container"
      onClick={() => onPlay(song)}
    >
      <div className="interactive-song-card-details">
        <motion.img
          src={song.coverUrl || defaultCover}
          alt={song.title}
          className="interactive-song-card-cover"
          whileHover={{ rotate: '10deg' }} // 회전 각도를 숫자나 각도로 수정
        />
        <div className="interactive-song-card-text-content">
          <span className="interactive-song-card-title">{song.title}</span>
          <span className="interactive-song-card-artist">{typeof song.artist === 'object' ? song.artist?.name || '아티스트' : song.artist || '아티스트'}</span>
          {song.isHighQuality && (
            <motion.span
              className="interactive-song-card-quality-badge" 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              고음질
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// 기본 값 설정 (coverUrl이 없다면 defaultCover 사용)
InteractiveSongCard.defaultProps = {
  song: {
    coverUrl: defaultCover,
    isHighQuality: false,
  },
  onPlay: () => {},
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
