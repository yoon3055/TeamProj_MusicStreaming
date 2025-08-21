import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MusicPlayerContext } from '../context/MusicPlayerContext';
import { loadMusicListFromDB, loadPlaylistsFromDB, getAllSongsFromDB } from '../services/indexDB';
import '../styles/AlbumArtPage.css';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaVolumeUp, FaVolumeDown, FaRepeat, FaInfoCircle, FaMusic } from 'react-icons/fa';
import { MdErrorOutline } from 'react-icons/md';

const AlbumArtPage = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    playPause,
    nextSong,
    previousSong,
    setVolume,
    seekTo,
    repeatMode,
    setRepeatMode,
  } = useContext(MusicPlayerContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [albumInfo, setAlbumInfo] = useState(null);
  const [lyrics, setLyrics] = useState(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [relatedSongs, setRelatedSongs] = useState([]);

  const fetchAlbumInfoFromDB = useCallback(async () => {
    if (!currentSong) return;

    setLoading(true);
    setError(null);

    try {
      const playlists = await loadPlaylistsFromDB();
      const musicList = await loadMusicListFromDB();

      const relatedPlaylist = playlists.find(playlist =>
        playlist.songs && playlist.songs.some(song => song.id === currentSong.id)
      );

      const relatedMusic = musicList.find(music =>
        music.id === currentSong.id ||
        music.artist === currentSong.artist ||
        music.albumTitle === currentSong.albumTitle
      );

      if (relatedPlaylist || relatedMusic) {
        setAlbumInfo({
          title: relatedPlaylist?.title || relatedMusic?.albumTitle || currentSong.albumTitle || currentSong.title,
          artist: currentSong.artist || 'Unknown Artist',
          releaseDate: relatedMusic?.updatedAt || new Date().toISOString(),
          genre: relatedMusic?.genre || 'Unknown',
          coverUrl: currentSong.coverUrl || currentSong.albumArt || '/default-album.jpg',
          songCount: relatedPlaylist?.songs?.length || 1,
          description: relatedPlaylist?.description || relatedMusic?.description
        });
      } else {
        setAlbumInfo({
          title: currentSong.albumTitle || currentSong.title || 'Unknown Album',
          artist: currentSong.artist || 'Unknown Artist',
          releaseDate: new Date().toISOString(),
          genre: 'Unknown',
          coverUrl: currentSong.coverUrl || currentSong.albumArt || '/default-album.jpg',
          songCount: 1
        });
      }
    } catch (err) {
      console.error('IndexedDB에서 앨범 정보 가져오기 실패:', err);
      setError('앨범 정보를 불러오는 데 실패했습니다.');

      setAlbumInfo({
        title: currentSong.albumTitle || currentSong.title || 'Unknown Album',
        artist: currentSong.artist || 'Unknown Artist',
        releaseDate: new Date().toISOString(),
        genre: 'Unknown',
        coverUrl: currentSong.coverUrl || currentSong.albumArt || '/default-album.jpg',
        songCount: 1
      });
    } finally {
      setLoading(false);
    }
  }, [currentSong]);

  const fetchRelatedSongsFromDB = useCallback(async () => {
    if (!currentSong) return;

    try {
      const allSongs = await getAllSongsFromDB();

      const related = allSongs.filter(song =>
        song.id !== currentSong.id &&
        (song.artist === currentSong.artist ||
          song.genre === currentSong.genre)
      ).slice(0, 5);

      setRelatedSongs(related);
    } catch (err) {
      console.error('관련 곡 불러오기 실패:', err);
    }
  }, [currentSong]);

  const fetchLyricsFromDB = useCallback(async () => {
    if (!currentSong?.id) return;

    try {
      const musicList = await loadMusicListFromDB();
      const currentMusicItem = musicList.find(item => item.id === currentSong.id);

      if (currentMusicItem?.lyrics) {
        setLyrics(currentMusicItem.lyrics);
      } else {
        setLyrics('가사 정보가 없습니다.');
      }
    } catch (err) {
      console.error('IndexedDB에서 가사 가져오기 실패:', err);
      setLyrics(null);
    }
  }, [currentSong]);

  useEffect(() => {
    if (currentSong) {
      fetchAlbumInfoFromDB();
      fetchRelatedSongsFromDB();
      fetchLyricsFromDB();
    }
  }, [currentSong, fetchAlbumInfoFromDB, fetchRelatedSongsFromDB, fetchLyricsFromDB]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    if (currentSong) {
      fetchAlbumInfoFromDB();
      fetchRelatedSongsFromDB();
      fetchLyricsFromDB();
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    seekTo(newTime);
  };

  const toggleRepeat = () => {
    setRepeatMode(prev => prev === 'none' ? 'all' : prev === 'all' ? 'one' : 'none');
  };

  const defaultAlbumArt = '/default-album.jpg';
  let albumArtUrl = defaultAlbumArt;
  if (!loading && currentSong) {
    albumArtUrl = currentSong.albumArt || currentSong.coverUrl || albumInfo?.coverUrl || defaultAlbumArt;
  }

  if (!currentSong) {
    return (
      <div className="album-art-page-container">
        <div className="no-song-message">
          <FaMusic size={48} />
          <p>현재 재생 중인 곡이 없습니다.</p>
          <p>플레이리스트에서 곡을 선택해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="album-art-page-container full-screen-player">
      <div className="hide-bar" onClick={() => navigate('/miniplayer')}>
        Hide Full Screen
      </div>

      <img
        src={albumArtUrl}
        alt={currentSong.title || '앨범 아트'}
        className="album-art large"
        onError={(e) => {
          e.target.src = defaultAlbumArt;
        }}
      />

      <div className="song-info">
        <h2 className="song-title">{currentSong.title || '제목 없음'}</h2>
        <p className="song-artist">{currentSong.artist || '아티스트 없음'}</p>
        {albumInfo?.genre && <p className="song-genre">{albumInfo.genre}</p>}
      </div>

      <div className="playback-timeline" onClick={handleSeek}>
        <div className="progress-fill" style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }} />
      </div>
      <div className="time-display">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      <div className="player-controls">
        <button className="control-btn" onClick={previousSong}><FaStepBackward /></button>
        <button className="control-btn large" onClick={playPause}>
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
        <button className="control-btn" onClick={nextSong}><FaStepForward /></button>
        <button className="control-btn" onClick={toggleRepeat} style={{ color: repeatMode !== 'none' ? 'blue' : 'gray' }}>
          <FaRepeat />
        </button>
      </div>

      <div className="volume-control">
        <FaVolumeDown />
        <input
          type="range"
          min="0"
          max="100"
          value={volume * 100}
          onChange={(e) => setVolume(e.target.value / 100)}
        />
        <FaVolumeUp />
      </div>

      <button className="info-btn" onClick={() => setShowInfo(!showInfo)}><FaInfoCircle /></button>
      {showInfo && albumInfo && (
        <div className="album-details">
          <p>앨범: {albumInfo.title}</p>
          <p>발매: {albumInfo.releaseDate ? new Date(albumInfo.releaseDate).getFullYear() : 'N/A'}</p>
          <p>장르: {albumInfo.genre || 'N/A'}</p>
          <p>수록곡: {albumInfo.songCount || 1}곡</p>
          {albumInfo.description && <p>설명: {albumInfo.description}</p>}

          {/* 관련 곡들 표시 */}
          {relatedSongs.length > 0 && (
            <div className="related-songs">
              <h4>같은 아티스트의 다른 곡</h4>
              {relatedSongs.map(song => (
                <div key={song.id} className="related-song-item">
                  <span>{song.title}</span>
                  <span>{song.artist}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <button className="lyrics-btn" onClick={() => setShowLyrics(!showLyrics)}>
        Lyrics {lyrics ? '📄' : '❌'}
      </button>
      {showLyrics && (
        <div className="lyrics-scroll">
          <p>{lyrics || '가사 정보가 없습니다.'}</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <MdErrorOutline />
          <p>{error}</p>
          <button onClick={handleRetry}>Retry ({retryCount})</button>
        </div>
      )}

      {loading && (
        <div className="loading-indicator">
          <p>앨범 정보 로딩 중...</p>
        </div>
      )}
    </div>
  );
};

export default AlbumArtPage;
