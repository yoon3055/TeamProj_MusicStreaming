import React, { createContext, useState, useRef, useEffect } from 'react';

export const MusicPlayerContext = createContext();

export const MusicPlayerProvider = ({ children }) => {
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeat, setRepeat] = useState(() => {
    return JSON.parse(localStorage.getItem('repeat')) || false;
  });
  const [shuffle, setShuffle] = useState(() => {
    return JSON.parse(localStorage.getItem('shuffle')) || false;
  });
  const [loading, setLoading] = useState(false);
  const [volume, setVolume] = useState(1);

  const audioRef = useRef(null);

  const addToQueue = (songs) => {
  setQueue((prevQueue) => [...prevQueue, ...songs]);
};

  useEffect(() => {
    localStorage.setItem('repeat', JSON.stringify(repeat));
  }, [repeat]);

  useEffect(() => {
    localStorage.setItem('shuffle', JSON.stringify(shuffle));
  }, [shuffle]);

  const currentSong = playlist[currentIndex];

  const togglePlay = () => {
    if (!currentSong) return;
    setIsPlaying((prev) => !prev);
  };

  const playSong = (songOrList) => {
    if (Array.isArray(songOrList)) {
      setPlaylist(songOrList);
      setCurrentIndex(0);
      setIsPlaying(true);
    } else {
      const idx = playlist.findIndex((s) => s.id === songOrList.id);
      if (idx !== -1) {
        setCurrentIndex(idx);
        setIsPlaying(true);
      } else {
        setPlaylist([songOrList]);
        setCurrentIndex(0);
        setIsPlaying(true);
      }
    }
  };

  const next = () => {
    if (playlist.length === 0) return;
    if (shuffle) {
      const nextIndex = Math.floor(Math.random() * playlist.length);
      setCurrentIndex(nextIndex);
    } else {
      if (currentIndex === playlist.length - 1) {
        if (repeat) setCurrentIndex(0);
        else setIsPlaying(false);
      } else {
        setCurrentIndex(currentIndex + 1);
      }
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    if (isPlaying) audio.play();
    else audio.pause();
  }, [isPlaying, currentSong, volume]);

  return (
    <MusicPlayerContext.Provider
      value={{
        playlist,
        setPlaylist,
        currentIndex,
        setCurrentIndex,
        currentSong,
        isPlaying,
        togglePlay,
        playSong,
        next,
        repeat,
        setRepeat,
        shuffle,
        setShuffle,
        loading,
        setLoading,
        volume,
        setVolume,
        audioRef,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};
