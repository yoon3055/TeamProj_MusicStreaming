// src/component/MusicPlayer.jsx
import React, { useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MusicPlayerContext } from '../context/MusicPlayerContext';

import '../styles/MusicPlayer.css'; // ✨ CSS 파일 임포트

const MusicPlayer = () => {
  const navigate = useNavigate();

  const {
    currentSong, // 🌐 현재 재생 중인 곡 정보
    isPlaying,   // 🌐 재생 상태
    volume,      // 🌐 현재 볼륨
    progress,    // 🌐 재생 진행률
    playSong,    // 🌐 곡 재생 함수
    pauseSong,   // 🌐 곡 일시정지 함수
    prevSong,    // 🌐 이전 곡 재생 함수
    nextSong,    // 🌐 다음 곡 재생 함수
    setVolume,   // 🌐 볼륨 설정 함수
    seekTo,      // 🌐 특정 시간으로 이동 함수
  } = useContext(MusicPlayerContext);

  // 이퀄라이저 캔버스 참조
  const canvasRef = useRef(null);

  // ⚠️ currentSong이 없을 경우를 대비한 기본값 설정
  const displaySong = currentSong || {
    title: '재생 중인 곡 없음',
    artist: '선택해주세요',
    albumId: null, // 구매 버튼을 위해 albumId 추가
    coverUrl: 'https://via.placeholder.com/60/333333/FFFFFF?text=No+Song',
  };

  // ✅ 이퀄라이저 효과 로직
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;

    const drawEqualizer = () => {
      // 캔버스 크기 조정 (부모 요소에 맞춰)
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--flo-accent-emerald'); // ✨ CSS 변수 사용
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = 8;
      const barGap = 4;
      const maxHeight = canvas.height;
      const numBars = Math.floor(canvas.width / (barWidth + barGap));

      for (let i = 0; i < numBars; i++) {
        const barHeight = isPlaying ? Math.random() * 40 + 10 : 10;
        ctx.fillRect(i * (barWidth + barGap), maxHeight - barHeight, barWidth, barHeight);
      }

      animationFrameId = requestAnimationFrame(drawEqualizer);
    };

    // 초기 렌더링 시 이퀄라이저 바를 바닥에 고정
    const initialDraw = () => {
      const initialHeight = 10;
      const initialY = canvas.height - initialHeight;
      const barWidth = 8;
      const barGap = 4;
      const numBars = Math.floor(canvas.width / (barWidth + barGap));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--flo-accent-emerald'); // ✨ CSS 변수 사용
      for (let i = 0; i < numBars; i++) {
        ctx.fillRect(i * (barWidth + barGap), initialY, barWidth, initialHeight);
      }
    };

    if (isPlaying) {
      drawEqualizer();
    } else {
      initialDraw();
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying]);

  // ✅ 구매 버튼 클릭 시 핸들러
  const handlePurchase = () => {
    if (displaySong.albumId) {
      navigate(`/purchase?albumId=${displaySong.albumId}`);
    } else {
      alert('구매할 앨범을 선택하려면 곡을 재생해주세요.');
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      pauseSong();
    } else {
      playSong(currentSong);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value, 10);
    setVolume(newVolume);
  };

  const handleProgressChange = (e) => {
    const newProgress = parseInt(e.target.value, 10);
    seekTo(newProgress);
  };

  return (
    <div className="music-player-bar">
      {/* 1. 현재 재생 중인 곡 정보 */}
      <div className="music-player-song-info">
        {displaySong.albumId ? (
          <div className="music-player-song-details">
            <img
              src={displaySong.coverUrl}
              alt="Album Cover"
              className="music-player-album-cover"
            />
            <div className="music-player-text-details">
              <p className="music-player-song-title">{displaySong.title}</p>
              <p className="music-player-song-artist">{displaySong.artist}</p>
            </div>
          </div>
        ) : (
          <div className="music-player-no-song">
            <div className="music-player-no-song-cover">No</div>
            <span>선택된 곡 없음</span>
          </div>
        )}
      </div>

      {/* 2. 재생 컨트롤 및 진행 바 */}
      <div className="music-player-controls-area">
        <div className="music-player-buttons">
          <button onClick={prevSong} className="music-player-control-button" aria-label="이전 곡">
            <svg className="music-player-icon" fill="currentColor" viewBox="0 0 20 20">
              <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" fillRule="evenodd"></path>
              <path d="M5 4a1 1 0 011-1h1a1 1 0 011 1v12a1 1 0 01-1 1H6a1 1 0 01-1-1V4z" clipRule="evenodd" fillRule="evenodd"></path>
            </svg>
          </button>
          <button onClick={handleTogglePlay} className="music-player-play-button" aria-label={isPlaying ? "일시정지" : "재생"}>
            {isPlaying ? (
              <svg className="music-player-play-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path>
              </svg>
            ) : (
              <svg className="music-player-play-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
              </svg>
            )}
          </button>
          <button onClick={nextSong} className="music-player-control-button" aria-label="다음 곡">
            <svg className="music-player-icon" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" fillRule="evenodd"></path>
              <path d="M15 4a1 1 0 011-1h1a1 1 0 011 1v12a1 1 0 01-1 1h-1a1 1 0 01-1-1V4z" clipRule="evenodd" fillRule="evenodd"></path>
            </svg>
          </button>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleProgressChange}
          className="music-player-progress-bar"
          aria-label="재생 진행률"
        />
      </div>

      {/* 3. 볼륨 및 추가 컨트롤 + 이퀄라이저 캔버스 + 구매 버튼 */}
      <div className="music-player-extra-controls">
        <button
          className="music-player-control-button"
          aria-label="볼륨 조절"
        >
          <svg className="music-player-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.036A1 1 0 008.5 3H4a1 1 0 00-1 1v12a1 1 0 001 1h4.5a1 1 0 00.883-.536l5-7a1 1 0 000-.928l-5-7zM16.5 10a.5.5 0 00-.5-.5h-1a.5.5 0 00-.5.5v1a.5.5 0 00.5.5h1a.5.5 0 00.5-.5V10z" clipRule="evenodd"></path>
          </svg>
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          className="music-player-volume-bar"
          aria-label="볼륨"
        />
        <button
          className="music-player-control-button"
          aria-label="재생 목록"
        >
          <svg className="music-player-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
          </svg>
        </button>

        {displaySong.albumId && (
          <div className="music-player-equalizer-buy">
            <div className="music-player-equalizer-canvas-wrapper">
              <canvas ref={canvasRef} className="music-player-equalizer-canvas" />
            </div>
            <button onClick={handlePurchase} className="music-player-buy-button">
              💽 구매
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicPlayer;