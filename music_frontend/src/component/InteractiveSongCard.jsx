// src/component/InteractiveSongCard.jsx
import React from 'react';
import { motion } from 'framer-motion'; // framer-motion 임포트
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
          whileHover={{ rotate: 1 }}
        />
        <div className="interactive-song-card-text-content">
          <span className="interactive-song-card-title">{song.title}</span>
          <span className="interactive-song-card-artist">{song.artist}</span>
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

InteractiveSongCard.propTypes = {
  song: PropTypes.shape({
    title: PropTypes.string.isRequired,
    artist: PropTypes.string.isRequired,
    coverUrl: PropTypes.string,
    isHighQuality: PropTypes.bool
  }).isRequired,
  onPlay: PropTypes.func
};

export default InteractiveSongCard;
