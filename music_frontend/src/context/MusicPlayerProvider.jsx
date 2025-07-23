import React, { useState, useRef } from 'react';
import { MusicPlayerContext } from './MusicPlayerContext';

export const MusicPlayerProvider = ({ children }) => {
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef(null);

  const playSong = (index) => {
    setCurrentIndex(index);
    if (audioRef.current) {
      audioRef.current.load();
      audioRef.current.play();
    }
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        playlist,
        setPlaylist,
        currentIndex,
        setCurrentIndex,
        playSong,
        audioRef,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};
