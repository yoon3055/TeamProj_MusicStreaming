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
import { fetchMyPlaylists, deletePlaylist, updatePlaylist, fetchPlaylistTracks } from '../api/playlistApi';

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
    const token = localStorage.getItem('jwt');
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
    }
    return [];
};

const savePlaylistsToLocalStorage = (key, playlists) => {
    try {
        if (Array.isArray(playlists)) {
            localStorage.setItem(key, JSON.stringify(playlists));
        }
    } catch (error) {
    }
};

// const searchLyrics = async (songId, language = 'ko') => {
//     try {
//         const localLyrics = await getLyricsFromDB(songId, language);
//         if (localLyrics) {
//             return localLyrics.lyrics;
//         }
//         const response = await axios.get(`http://localhost:8080/api/lyrics/${songId}?language=${language}`);
//         if (response.data && response.data.lyrics) {
//             await _saveLyricsToDB({
//                 id: `${songId}-${language}`,
//                 songId,
//                 language,
//                 lyrics: response.data.lyrics
//             });
//             return response.data.lyrics;
//         }
//     } catch (error) {
//         console.error('가사 검색 실패:', error);
//     }
//     return null;
// };

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
        addSongToPlaylist, removeSongFromPlaylist, replacePlaylist, 
        // 새로운 볼륨 및 시간 탐색 기능들
        volume, setVolumeLevel, currentTime, duration, seekTo
    } = useContext(MusicPlayerContext);
    const { user } = useContext(AuthContext);

    const audioRef = useRef(null);
    const fileInputRef = useRef(null);
    const popupRef = useRef(null);

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
    const [progress, setProgress] = useState(0);

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
        const loadPlaylists = async () => {
            try {
                if (user) {
                    const playlists = await fetchMyPlaylists();
                    setUserPlaylists(playlists || []);
                } else {
                    // 로그인하지 않은 경우 로컬 스토리지에서 가져오기
                    const storedUserPlaylists = getPlaylistsFromLocalStorage(LOCAL_STORAGE_KEY_USER_PLAYLISTS);
                    setUserPlaylists(storedUserPlaylists);
                }
            } catch (error) {
                // 서버 요청 실패 시 로컬 스토리지에서 가져오기
                const storedUserPlaylists = getPlaylistsFromLocalStorage(LOCAL_STORAGE_KEY_USER_PLAYLISTS);
                setUserPlaylists(storedUserPlaylists);
            }
        };

        loadPlaylists();
    }, [user]);

    const updateLyrics = useCallback(async () => {
        if (!currentSong) {
            setLyricsData({ lyrics: [], isError: false, text: '' });
            return;
        }
        setIsLoadingLyrics(true);
        try {
            let lyrics = getLyricsFromMetadata(currentSong);
            // if (!lyrics) {
            //     lyrics = await searchLyrics(currentSong.id);
            // }
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
            return () => {
                audio.removeEventListener('timeupdate', updateProgress);
            };
        }
    }, [updateProgress]);

    const formatTime = (time) => {
        if (!time || isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleProgressChange = (e) => {
        const newProgress = parseFloat(e.target.value);
        if (duration > 0) {
            const newTime = (newProgress / 100) * duration;
            seekTo(newTime);
        }
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolumeLevel(newVolume);
    };

    const [isMuted, setIsMuted] = useState(false);
    const [previousVolume, setPreviousVolume] = useState(volume);

    const handleToggleMute = () => {
        if (isMuted) {
            // 음소거 해제
            setVolumeLevel(previousVolume);
            setIsMuted(false);
        } else {
            // 음소거
            setPreviousVolume(volume);
            setVolumeLevel(0);
            setIsMuted(true);
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

    const handleRenamePlaylist = async (playlistId, newName) => {
        try {
            if (user) {
                // 서버에서 플레이리스트 업데이트
                await updatePlaylist(playlistId, newName, []);
                // 플레이리스트 목록 다시 로드
                const playlists = await fetchMyPlaylists();
                setUserPlaylists(playlists || []);
                window.showToast('플레이리스트 이름이 변경되었습니다.', 'success');
            } else {
                // 로컬 스토리지 업데이트
                const updatedPlaylists = userPlaylists.map(pl =>
                    pl.id === playlistId ? { ...pl, name: newName } : pl
                );
                setUserPlaylists(updatedPlaylists);
                savePlaylistsToLocalStorage(LOCAL_STORAGE_KEY_USER_PLAYLISTS, updatedPlaylists);
            }
        } catch (error) {
            window.showToast('플레이리스트 이름 변경에 실패했습니다.', 'error');
        }
        setIsEditingName(null);
    };

    // 플레이리스트 클릭 시 해당 곡들을 재생바에 로드하는 함수
    const handlePlayPlaylist = async (playlistId, playlistTitle) => {
        try {
            // 플레이리스트의 트랙 목록을 가져오기
            const tracks = await fetchPlaylistTracks(playlistId);
            
            if (!tracks || tracks.length === 0) {
                window.showToast('플레이리스트에 곡이 없습니다.', 'warning');
                return;
            }
            
            // 트랙 데이터를 MusicPlayerProvider가 기대하는 형식으로 변환
            const songs = tracks.map(track => {
                
                return {
                    id: track.song?.id || track.songId,
                    name: track.song?.title || track.title || '제목 없음',
                    artist: track.song?.artist || track.artist || '아티스트 없음',
                    url: track.song?.audioUrl || track.song?.audio_url || track.audioUrl || track.audio_url,
                    coverUrl: track.song?.coverUrl || track.song?.cover_url || track.coverUrl || track.cover_url || noSongImage,
                    duration: track.song?.duration || track.duration || 0
                };
            });
            
            // 재생바의 플레이리스트를 새로운 곡들로 교체하고 첫 번째 곡 재생
            const success = await replacePlaylist(songs);
            
            if (success) {
                window.showToast(`"${playlistTitle}" 플레이리스트를 재생합니다.`, 'success');
                setShowPlaylistPopup(false); // 팝업 닫기
            }
            
        } catch (error) {
            window.showToast('플레이리스트 재생에 실패했습니다.', 'error');
        }
    };

    const handleDeletePlaylist = async (playlistId) => {
        try {
            if (user) {
                // 서버에서 플레이리스트 삭제
                await deletePlaylist(playlistId);
                // 플레이리스트 목록 다시 로드
                const playlists = await fetchMyPlaylists();
                setUserPlaylists(playlists || []);
                window.showToast('플레이리스트가 삭제되었습니다.', 'success');
            } else {
                // 로컬 스토리지에서 삭제
                const updatedPlaylists = userPlaylists.filter(pl => pl.id !== playlistId);
                setUserPlaylists(updatedPlaylists);
                savePlaylistsToLocalStorage(LOCAL_STORAGE_KEY_USER_PLAYLISTS, updatedPlaylists);
            }
        } catch (error) {
            window.showToast('플레이리스트 삭제에 실패했습니다.', 'error');
        }
    };

    const handleDeleteSharedPlaylist = (playlistId) => {
        const updatedPlaylists = sharedPlaylists.filter(pl => pl.id !== playlistId);
        setSharedPlaylists(updatedPlaylists);
        savePlaylistsToLocalStorage(LOCAL_STORAGE_KEY_SHARED_PLAYLISTS, updatedPlaylists);
    };

    // 플레이리스트 새로고침 함수
    const refreshPlaylists = async () => {
        try {
            if (user) {
                const playlists = await fetchMyPlaylists();
                setUserPlaylists(playlists || []);
            }
        } catch (error) {
        }
    };

    // 팝업이 열릴 때마다 플레이리스트 새로고침
    useEffect(() => {
        if (showPlaylistPopup && user) {
            refreshPlaylists();
        }
    }, [showPlaylistPopup, user]);

    return (
        <>
            <div className="music-player-bar">
                <div className="music-player-left">
                    <img src={currentSong?.coverUrl || noSongImage} alt="앨범 커버" className="music-player-album-cover" />
                    <div className="music-player-text-details">
                        <span className="music-player-song-title">{currentSong?.name || '재생 중인 곡 없음'}</span>
                        <span className="music-player-song-artist">{currentSong?.artist || '선택해주세요'}</span>
                    </div>
                </div>



                <div className="music-player-controls-area">
                    <div className="music-player-buttons">
                        <button onClick={prevSong} className="control-button">
                            <FaStepBackward className="icon-style" />
                        </button>
                        <button onClick={togglePlayPause} className={`control-button play-button`}>
                            {isPlaying ? <FaPause className="icon-style" /> : <FaPlay className="icon-style" />}
                        </button>
                        <button onClick={nextSong} className="control-button">
                            <FaStepForward className="icon-style" />
                        </button>
                    </div>

                    <div className="music-player-progress">
                        <span className="time-current">{formatTime(currentTime || 0)}</span>
                        <input
                            type="range"
                            className="music-player-progress-bar"
                            min="0"
                            max="100"
                            value={duration > 0 ? (currentTime / duration) * 100 : 0}
                            onChange={handleProgressChange}
                        />
                        <span className="time-duration">{formatTime(duration || 0)}</span>
                    </div>
                </div>

                <div className="music-player-extra-controls">
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
                        {userPlaylists.length === 0 ? (
                            <p>플레이리스트가 없습니다. 플레이리스트를 만들어보세요!</p>
                        ) : null}
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
                                        <span 
                                            onClick={() => handlePlayPlaylist(pl.id, pl.title)}
                                            onDoubleClick={() => { setIsEditingName(pl.id); setEditingName(pl.title); }}
                                            style={{ cursor: 'pointer' }}
                                            title="클릭하여 재생, 더블클릭하여 이름 편집"
                                        >
                                            {pl.title}
                                        </span>
                                    )}
                                    <div className="playlist-item-buttons">
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
        </>
    );
};

export default MusicPlayer;
