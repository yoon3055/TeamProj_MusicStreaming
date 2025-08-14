import React, { useEffect, useRef, useState, useCallback, useContext } from 'react';
import { MusicPlayerContext } from '../context/MusicPlayerContext';
import { AuthContext } from '../context/AuthContext';
import '../styles/MusicPlayer.css';
import noSongImage from '../assets/default-cover.jpg';
import Equalizer from './Equalizer';
import {
    FaPlay, FaPause, FaStepBackward, FaStepForward, FaRandom,
    FaVolumeUp, FaVolumeMute, FaListUl, FaPlus, FaTimes, FaPen, FaTrash
} from 'react-icons/fa';
import { MdRepeat, MdRepeatOne } from 'react-icons/md';
import axios from 'axios';

const dbName = 'musicPlayerDB';
const fileStoreName = 'uploadedFiles';
const lyricsStoreName = 'lyrics';

const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 3);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(fileStoreName)) {
                db.createObjectStore(fileStoreName, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(lyricsStoreName)) {
                db.createObjectStore(lyricsStoreName, { keyPath: 'id' });
            }
        };
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

const saveFileToDB = async (fileObj) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(fileStoreName, 'readwrite');
        const store = transaction.objectStore(fileStoreName);
        const request = store.put(fileObj);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
};

const _saveLyricsToDB = async (lyricsObj) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(lyricsStoreName, 'readwrite');
        const store = transaction.objectStore(lyricsStoreName);
        const request = store.put(lyricsObj);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
};

const getLyricsFromDB = async (songId, language) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(lyricsStoreName, 'readonly');
        const store = transaction.objectStore(lyricsStoreName);
        const id = `${songId}-${language}`;
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

const getAllLyricsFromDB = async () => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(lyricsStoreName, 'readonly');
        const store = transaction.objectStore(lyricsStoreName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

const deleteLyricsFromDB = async (id) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(lyricsStoreName, 'readwrite');
        const store = transaction.objectStore(lyricsStoreName);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
};

const _syncLyricsToServer = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const lyrics = await getAllLyricsFromDB();
    for (const lyric of lyrics) {
        try {
            await axios.post('http://localhost:8080/api/lyrics/admin', {
                songId: lyric.songId,
                language: lyric.language,
                lyrics: lyric.lyrics
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('가사 동기화 실패:', error);
        }
    }
};

const LOCAL_STORAGE_KEY_USER_PLAYLISTS = 'myMusicApp_userPlaylists';
const LOCAL_STORAGE_KEY_SHARED_PLAYLISTS = 'myMusicApp_sharedPlaylists';

const getPlaylistsFromLocalStorage = (key) => {
    try {
        const storedPlaylists = localStorage.getItem(key);
        if (storedPlaylists) {
            const parsedPlaylists = JSON.parse(storedPlaylists);
            if (Array.isArray(parsedPlaylists)) {
                return parsedPlaylists;
            }
        }
    } catch (error) {
        console.error('플레이리스트 로드 실패:', error);
    }
    return [];
};

const savePlaylistsToLocalStorage = (key, playlists) => {
    try {
        if (Array.isArray(playlists)) {
            localStorage.setItem(key, JSON.stringify(playlists));
        } else {
            console.error('플레이리스트가 배열이 아닙니다:', playlists);
        }
    } catch (error) {
        console.error('플레이리스트 저장 실패:', error);
    }
};

const searchLyrics = async (songId, language = 'ko') => {
    try {
        const localLyrics = await getLyricsFromDB(songId, language);
        if (localLyrics) {
            return localLyrics.lyrics;
        }
        const response = await axios.get(`http://localhost:8080/api/lyrics/${songId}?language=${language}`);
        if (response.data && response.data.lyrics) {
            await _saveLyricsToDB({
                id: `${songId}-${language}`,
                songId,
                language,
                lyrics: response.data.lyrics
            });
            return response.data.lyrics;
        }
    } catch (error) {
        console.error('가사 검색 실패:', error);
    }
    return null;
};

const getLyricsFromMetadata = (song) => {
    if (song?.metadata?.lyrics) {
        return song.metadata.lyrics;
    }
    if (song?.lyrics) {
        return song.lyrics;
    }
    return null;
};

const MusicPlayer = () => {
    const {
        currentSong, isPlaying, playlist, playSong, togglePlayPause, nextSong, prevSong,
        addSongToPlaylist, removeSongFromPlaylist, volume, setVolume, isMuted, setIsMuted
    } = useContext(MusicPlayerContext);
    const { user } = useContext(AuthContext);

    const audioRef = useRef(null);
    const fileInputRef = useRef(null);
    const popupRef = useRef(null);
    const [progress, setProgress] = useState(0);
    const [shuffleMode, setShuffleMode] = useState('none');
    const [repeatMode, setRepeatMode] = useState('none');
    const [playedSongs, setPlayedSongs] = useState([]);
    const [showPlaylistPopup, setShowPlaylistPopup] = useState(false);
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [sharedPlaylists, setSharedPlaylists] = useState([]);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isEditingName, setIsEditingName] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [lyricsData, setLyricsData] = useState({ lyrics: [], isError: false, text: '' });
    const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
    const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);

    const handleClickOutside = useCallback((event) => {
        if (popupRef.current && !popupRef.current.contains(event.target)) {
            setShowPlaylistPopup(false);
        }
    }, []);

    useEffect(() => {
        if (showPlaylistPopup) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPlaylistPopup, handleClickOutside]);

    useEffect(() => {
        const storedUserPlaylists = getPlaylistsFromLocalStorage(LOCAL_STORAGE_KEY_USER_PLAYLISTS);
        const storedSharedPlaylists = getPlaylistsFromLocalStorage(LOCAL_STORAGE_KEY_SHARED_PLAYLISTS);
        setUserPlaylists(storedUserPlaylists);
        setSharedPlaylists(storedSharedPlaylists);
    }, []);

    const updateLyrics = useCallback(async () => {
        if (!currentSong) {
            setLyricsData({ lyrics: [], isError: false, text: '' });
            return;
        }
        setIsLoadingLyrics(true);
        try {
            let lyrics = getLyricsFromMetadata(currentSong);
            if (!lyrics) {
                lyrics = await searchLyrics(currentSong.id);
            }
            if (lyrics && Array.isArray(lyrics) && lyrics.length > 0) {
                setLyricsData({ lyrics, isError: false, text: '' });
            } else {
                setLyricsData({ lyrics: [], isError: true, text: '가사를 찾을 수 없습니다.' });
            }
        } catch (error) {
            setLyricsData({ lyrics: [], isError: true, text: '가사 로드 중 오류가 발생했습니다.' });
        }
        setIsLoadingLyrics(false);
    }, [currentSong]);

    const updateLyricIndex = useCallback(() => {
        if (!audioRef.current || !lyricsData.lyrics.length) return;
        const currentTime = audioRef.current.currentTime;
        let newIndex = -1;
        for (let i = 0; i < lyricsData.lyrics.length; i++) {
            const lyric = lyricsData.lyrics[i];
            if (lyric.time && currentTime >= lyric.time) {
                newIndex = i;
            } else {
                break;
            }
        }
        if (newIndex !== currentLyricIndex) {
            setCurrentLyricIndex(newIndex);
        }
    }, [lyricsData.lyrics, currentLyricIndex]);

    useEffect(() => {
        updateLyrics();
    }, [updateLyrics]);

    useEffect(() => {
        const interval = setInterval(updateLyricIndex, 100);
        return () => clearInterval(interval);
    }, [updateLyricIndex]);

    const updateProgress = useCallback(() => {
        if (audioRef.current) {
            const currentTime = audioRef.current.currentTime;
            const duration = audioRef.current.duration;
            if (duration) {
                setProgress((currentTime / duration) * 100);
            }
        }
    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.addEventListener('timeupdate', updateProgress);
            audio.addEventListener('ended', handleEnded);
            return () => {
                audio.removeEventListener('timeupdate', updateProgress);
                audio.removeEventListener('ended', handleEnded);
            };
        }
    }, [updateProgress]);

    const handleEnded = useCallback(() => {
        if (repeatMode === 'one') {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
            return;
        }
        if (shuffleMode === 'random') {
            const availableSongs = playlist.filter(song => !playedSongs.includes(song.id));
            if (availableSongs.length === 0) {
                if (repeatMode === 'all') {
                    setPlayedSongs([]);
                    const randomIndex = Math.floor(Math.random() * playlist.length);
                    playSong(playlist[randomIndex]);
                    setPlayedSongs([playlist[randomIndex].id]);
                }
                return;
            }
            const randomIndex = Math.floor(Math.random() * availableSongs.length);
            const nextSong = availableSongs[randomIndex];
            playSong(nextSong);
            setPlayedSongs(prev => [...prev, nextSong.id]);
        } else if (shuffleMode === 'ordered') {
            const currentIndex = playlist.findIndex(song => song.id === currentSong?.id);
            const nextIndex = (currentIndex + 1) % playlist.length;
            if (nextIndex === 0 && repeatMode !== 'all') {
                return;
            }
            playSong(playlist[nextIndex]);
        } else {
            const currentIndex = playlist.findIndex(song => song.id === currentSong?.id);
            if (currentIndex < playlist.length - 1) {
                playSong(playlist[currentIndex + 1]);
            } else if (repeatMode === 'all') {
                playSong(playlist[0]);
            }
        }
    }, [repeatMode, shuffleMode, playlist, playedSongs, currentSong, playSong]);

    const formatTime = (time) => {
        if (!time || isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleProgressChange = (e) => {
        const newProgress = parseFloat(e.target.value);
        setProgress(newProgress);
        if (audioRef.current) {
            const newTime = (newProgress / 100) * audioRef.current.duration;
            audioRef.current.currentTime = newTime;
        }
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };

    const handleToggleMute = () => {
        setIsMuted(!isMuted);
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
        }
    };

    const handleLocalFileUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const songId = `local-${Date.now()}`;
            const newSong = {
                id: songId,
                name: file.name,
                artist: '로컬 파일',
                coverUrl: noSongImage,
                url: '',
                isLocal: true,
            };

            try {
                await saveFileToDB({ id: songId, fileData: file });
                const blobUrl = URL.createObjectURL(file);
                addSongToPlaylist({ ...newSong, url: blobUrl });
                window.showToast(`${file.name} (로컬 파일)이 재생목록에 추가되었습니다.`, 'success');
            } catch (error) {
                window.showToast("파일 저장에 실패했습니다.", 'error');
                console.error("IndexedDB 저장 실패:", error);
            }
        }
    };

    const handleCreatePlaylist = () => {
        if (!user) {
            window.showToast('로그인이 필요합니다.', 'error');
            return;
        }
        if (newPlaylistName.trim() === '') {
            window.showToast('플레이리스트 이름을 입력해주세요.', 'error');
            return;
        }
        if (playlist.length === 0) {
            window.showToast('플레이리스트에 담을 곡이 없습니다.', 'warning');
            return;
        }

        const newPlaylist = {
            id: `playlist-${Date.now()}`,
            name: newPlaylistName,
            isPublic: false,
            songs: playlist,
            ownerId: user.id,
        };
        const updatedPlaylists = [...userPlaylists, newPlaylist];
        setUserPlaylists(updatedPlaylists);
        setNewPlaylistName('');
        savePlaylistsToLocalStorage(LOCAL_STORAGE_KEY_USER_PLAYLISTS, updatedPlaylists);
        window.showToast('새 플레이리스트가 생성되었습니다!', 'success');
    };

    const handleTogglePublic = (playlistId) => {
        const updatedPlaylists = userPlaylists.map(pl =>
            pl.id === playlistId ? { ...pl, isPublic: !pl.isPublic } : pl
        );
        setUserPlaylists(updatedPlaylists);
        savePlaylistsToLocalStorage(LOCAL_STORAGE_KEY_USER_PLAYLISTS, updatedPlaylists);
        window.showToast('플레이리스트 공개 상태가 변경되었습니다.', 'info');
    };

    const handleSearch = () => {
        if (searchTerm.trim() === '') return;
        try {
            const allPublicPlaylists = userPlaylists.filter(pl => pl.isPublic);
            const results = allPublicPlaylists.filter(pl => pl.name.includes(searchTerm));
            setSearchResults(results);
            window.showToast('플레이리스트 검색 완료!', 'success');
        } catch (error) {
            window.showToast(error.message || '플레이리스트 검색에 실패했습니다.', 'error');
        }
    };

    const handleReceiveSharedPlaylist = async (sharedPlaylist) => {
        const updatedSharedPlaylists = [...sharedPlaylists, sharedPlaylist];
        setSharedPlaylists(updatedSharedPlaylists);
        savePlaylistsToLocalStorage(LOCAL_STORAGE_KEY_SHARED_PLAYLISTS, updatedSharedPlaylists);
        window.showToast(`'${sharedPlaylist.name}' 플레이리스트를 공유받았습니다.`, 'success');
    };

    const handleRenamePlaylist = (playlistId, newName) => {
        const updatedPlaylists = userPlaylists.map(pl =>
            pl.id === playlistId ? { ...pl, name: newName } : pl
        );
        setUserPlaylists(updatedPlaylists);
        savePlaylistsToLocalStorage(LOCAL_STORAGE_KEY_USER_PLAYLISTS, updatedPlaylists);
        setIsEditingName(null);
    };

    const handleDeletePlaylist = (playlistId) => {
        const updatedPlaylists = userPlaylists.filter(pl => pl.id !== playlistId);
        setUserPlaylists(updatedPlaylists);
        savePlaylistsToLocalStorage(LOCAL_STORAGE_KEY_USER_PLAYLISTS, updatedPlaylists);
    };

    const handleDeleteSharedPlaylist = (playlistId) => {
        const updatedPlaylists = sharedPlaylists.filter(pl => pl.id !== playlistId);
        setSharedPlaylists(updatedPlaylists);
        savePlaylistsToLocalStorage(LOCAL_STORAGE_KEY_SHARED_PLAYLISTS, updatedPlaylists);
    };

    return (
        <div className="music-player">
            <div className="music-player-bar">
                <div className="music-player-left">
                    <img src={currentSong?.coverUrl || noSongImage} alt="앨범 커버" className="music-player-album-cover" />
                    <div className="music-player-text-details">
                        <span className="music-player-song-title">{currentSong?.name || '재생 중인 곡 없음'}</span>
                        <span className="music-player-song-artist">{currentSong?.artist || '선택해주세요'}</span>
                    </div>
                </div>

                <div className="music-player-lyrics-box">
                    {isLoadingLyrics ? (
                        <span className="lyrics-loading">가사 로드 중...</span>
                    ) : lyricsData.isError ? (
                        <span className="lyrics-error">{lyricsData.text}</span>
                    ) : (
                        <span className={`lyrics-line ${currentLyricIndex >= 0 ? 'active' : ''}`}>
                            {currentLyricIndex >= 0 ? lyricsData.lyrics[currentLyricIndex]?.text : ''}
                        </span>
                    )}
                </div>

                <div className="music-player-controls-area">
                    <div className="music-player-buttons">
                        <button 
                            onClick={() => {
                                setShuffleMode(prev => 
                                    prev === 'none' ? 'ordered' : 
                                    prev === 'ordered' ? 'random' : 'none'
                                );
                                setPlayedSongs([]);
                            }} 
                            className={`control-button ${shuffleMode !== 'none' ? 'shuffle active' : ''}`}
                            title={shuffleMode === 'ordered' ? '순차 셔플' : shuffleMode === 'random' ? '랜덤 셔플' : '셔플 끄기'}
                        >
                            <FaRandom className="icon-style" />
                            {shuffleMode === 'ordered' && <span className="mode-indicator">순차</span>}
                            {shuffleMode === 'random' && <span className="mode-indicator">랜덤</span>}
                        </button>
                        <button onClick={prevSong} className="control-button">
                            <FaStepBackward className="icon-style" />
                        </button>
                        <button onClick={togglePlayPause} className={`control-button play-button`}>
                            {isPlaying ? <FaPause className="icon-style" /> : <FaPlay className="icon-style" />}
                        </button>
                        <button onClick={nextSong} className="control-button">
                            <FaStepForward className="icon-style" />
                        </button>
                        <button 
                            onClick={() => setRepeatMode(prev => 
                                prev === 'none' ? 'all' : 
                                prev === 'all' ? 'one' : 'none'
                            )} 
                            className={`control-button ${repeatMode !== 'none' ? 'repeat active' : ''}`}
                            title={repeatMode === 'one' ? '1곡 반복' : repeatMode === 'all' ? '전체 반복' : '반복 끄기'}
                        >
                            {repeatMode === 'one' ? 
                                <MdRepeatOne className="icon-style" /> : 
                                <MdRepeat className="icon-style" />
                            }
                            {repeatMode === 'one' && <span className="mode-indicator">1</span>}
                        </button>
                    </div>

                    <div className="music-player-progress">
                        <span className="time-current">{formatTime(audioRef.current?.currentTime || 0)}</span>
                        <input
                            type="range"
                            className="music-player-progress-bar"
                            value={progress}
                            onChange={handleProgressChange}
                        />
                        <span className="time-duration">{formatTime(audioRef.current?.duration || 0)}</span>
                    </div>
                </div>

                <div className="music-player-extra-controls">
                    <Equalizer isPlaying={isPlaying} type="linked" />
                    <div className="volume-control-wrapper">
                        <button onClick={handleToggleMute} className="volume-toggle-button">
                            {isMuted ? <FaVolumeMute className="icon-style" /> : <FaVolumeUp className="icon-style" />}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="volume-slider"
                        />
                    </div>
                    <button onClick={() => setShowPlaylistPopup(!showPlaylistPopup)} className="playlist-toggle-button">
                        <FaListUl className="icon-style" />
                    </button>
                </div>
            </div>

            {showPlaylistPopup && (
                <div className="playlist-popup" ref={popupRef}>
                    <div className="playlist-header">
                        <button onClick={() => setShowPlaylistPopup(false)} className="popup-button">
                            <FaTimes className="icon-style-popup" />
                        </button>
                    </div>

                    <div className="playlist-section">
                        <h5>내 플레이리스트</h5>
                        <ul>
                            {userPlaylists.map(pl => (
                                <li key={pl.id}>
                                    {isEditingName === pl.id ? (
                                        <input
                                            type="text"
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            onBlur={() => handleRenamePlaylist(pl.id, editingName)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleRenamePlaylist(pl.id, editingName);
                                            }}
                                        />
                                    ) : (
                                        <span onClick={() => { setIsEditingName(pl.id); setEditingName(pl.name); }}>{pl.name}</span>
                                    )}
                                    <div className="playlist-item-buttons">
                                        <button onClick={() => handleTogglePublic(pl.id)} className={`playlist-visibility-toggle ${pl.isPublic ? 'public' : ''}`}>
                                            {pl.isPublic ? '공개' : '비공개'}
                                        </button>
                                        <button onClick={() => handleDeletePlaylist(pl.id)} className="playlist-item-delete-button">
                                            <FaTrash />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            <audio
                ref={audioRef}
                src={currentSong?.url}
                volume={volume}
                muted={isMuted}
                onPlay={() => {}}
                onPause={() => {}}
            />
        </div>
    );
};

export default MusicPlayer;
