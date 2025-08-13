import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MusicPlayerContext } from './MusicPlayerContext';
import axios from 'axios';

// 컴포넌트 내부에 IndexedDB 관련 헬퍼 함수들을 정의하여 사용
const dbName = 'musicPlayerDB';
const storeName = 'uploadedFiles';
const historyStoreName = 'playback_history';

// IndexedDB를 열고 objectStore를 생성하는 함수
const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 3);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('playlists')) {
                db.createObjectStore('playlists', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(historyStoreName)) {
                db.createObjectStore(historyStoreName, { keyPath: 'id' });
            }
        };
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

// IndexedDB에서 특정 파일을 가져오는 함수
const getFileFromDB = async (fileId) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(fileId);
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

// IndexedDB에 데이터를 추가하거나 업데이트하는 범용 함수
const put = async (storeName, item) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(item);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
};

const MusicPlayerProvider = ({ children }) => {
    const audioRef = useRef(new Audio());
    const [isPlaying, setIsPlaying] = useState(false);
    const [playlist, setPlaylist] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    const [repeatMode, setRepeatMode] = useState('none');
    const [currentBlobUrl, setCurrentBlobUrl] = useState(null);

    const [toastState, setToastState] = useState({ message: '', type: 'info', timestamp: 0 });

    // Blob URL 메모리 누수 방지용
    const cleanupBlobUrl = useCallback((url) => {
        if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
        }
    }, []);

    // 컴포넌트 언마운트 시 Blob URL 정리
    useEffect(() => {
        return () => {
            if (currentBlobUrl) {
                cleanupBlobUrl(currentBlobUrl);
            }
        };
    }, [currentBlobUrl, cleanupBlobUrl]);

    // 토스트 메시지 표시 효과
    useEffect(() => {
        if (toastState.message) {
            window.showToast(toastState.message, toastState.type);
        }
    }, [toastState]);

    // 재생 기록을 서버에 동기화하는 함수 (axios 사용)
    const syncPlaybackHistory = useCallback(async (historyItem) => {
        try {
            await axios.post('http://localhost:8080/api/playback-history', historyItem, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            console.log('재생 기록 서버 동기화 성공:', historyItem);
        } catch (error) {
            console.error('재생 기록 서버 동기화 실패:', error);
            setToastState({ message: '서버 동기화 실패. 로컬에 저장됨.', type: 'warning', timestamp: Date.now() });
        }
    }, [setToastState]);

    // 재생 기록을 로컬 IndexedDB에 저장하고 서버에 동기화를 시도하는 함수
    const savePlaybackHistory = useCallback(async (song) => {
        const historyItem = {
            id: song.id,
            title: song.name,
            artist: song.artist,
            coverUrl: song.coverUrl,
            audioUrl: song.url,
            playedAt: new Date().toISOString(),
            isLiked: false,
            type: 'song',
            timestamp: Date.now(),
        };
        try {
            await put(historyStoreName, historyItem);
            await syncPlaybackHistory(historyItem);
            setToastState({ message: '재생 기록 저장됨.', type: 'success', timestamp: Date.now() });
        } catch (error) {
            console.error('재생 기록 저장 실패:', error);
            setToastState({ message: '재생 기록 저장 실패.', type: 'error', timestamp: Date.now() });
        }
    }, [ syncPlaybackHistory, setToastState]);

    // 특정 곡을 재생하는 핵심 로직
const playSong = useCallback(async (song) => {
    if (!song) {
        setToastState({ message: "선택된 곡이 없습니다.", type: 'error', timestamp: Date.now() });
        return;
    }

    console.log('playSong 호출:', song);

    if (currentSong?.id === song.id && audioRef.current.src) {
        if (audioRef.current.paused) {
            try {
                await audioRef.current.play();
                setIsPlaying(true);
            } catch (error) {
                console.error("재생 실패:", error);
                setToastState({ message: "재생에 실패했습니다.", type: 'error', timestamp: Date.now() });
                setIsPlaying(false);
            }
        }
        return;
    }

    setIsPlaying(false);

    try {
        let songUrl = song.url;
        if (song.isLocal) {
            const fileData = await getFileFromDB(song.id);
            console.log('IndexedDB fileData:', fileData);
            if (fileData && fileData.fileData) {
                cleanupBlobUrl(currentBlobUrl);
                songUrl = URL.createObjectURL(fileData.fileData);
                setCurrentBlobUrl(songUrl);
            } else {
                setToastState({ message: "재생할 파일을 찾을 수 없습니다.", type: 'error', timestamp: Date.now() });
                return;
            }
        } else {
            if (currentBlobUrl) {
                cleanupBlobUrl(currentBlobUrl);
                setCurrentBlobUrl(null);
            }
        }

        console.log('설정할 audio src:', songUrl);
        audioRef.current.src = songUrl;
        audioRef.current.load();
        await audioRef.current.play();
        setCurrentSong({ ...song, url: songUrl });
        setIsPlaying(true);
        await savePlaybackHistory(song);
    } catch (error) {
        console.error("Audio playback failed:", error);
        setToastState({ message: "음악 재생에 실패했습니다.", type: 'error', timestamp: Date.now() });
        setIsPlaying(false);
    }
}, [currentSong, currentBlobUrl, cleanupBlobUrl, savePlaybackHistory, setToastState]);

    // 재생/일시정지 토글 함수
    const togglePlayPause = useCallback(() => {
        const audio = audioRef.current;
        if (!currentSong) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play().catch(error => {
                console.error("Autoplay failed:", error);
                setToastState({ message: "재생이 실패했습니다.", type: 'error', timestamp: Date.now() });
            });
            setIsPlaying(true);
        }
    }, [isPlaying, currentSong, setToastState]);

    // 다음 곡 재생 함수
    const nextSong = useCallback(() => {
        if (!currentSong || playlist.length <= 1) return;

        if (repeatMode === 'one') {
            audioRef.current.currentTime = 0;
            playSong(currentSong);
        } else {
            const currentIndex = playlist.findIndex(song => song.id === currentSong.id);
            const nextIndex = (currentIndex + 1) % playlist.length;
            playSong(playlist[nextIndex]);
        }
    }, [currentSong, playlist, repeatMode, playSong]);

    // 이전 곡 재생 함수
    const prevSong = useCallback(() => {
        if (!currentSong || playlist.length <= 1) return;

        if (repeatMode === 'one') {
            audioRef.current.currentTime = 0;
            playSong(currentSong);
        } else {
            const currentIndex = playlist.findIndex(song => song.id === currentSong.id);
            const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
            playSong(playlist[prevIndex]);
        }
    }, [currentSong, playlist, repeatMode, playSong]);

    // 플레이리스트에 곡을 추가하는 함수
    const addSongToPlaylist = useCallback(async (song) => {
        return new Promise((resolve, reject) => {
            try {
                setPlaylist((prevPlaylist) => {
                    if (prevPlaylist.some(s => s.id === song.id)) {
                        setToastState({ message: `${song.name}은(는) 이미 재생목록에 있습니다.`, type: 'warning', timestamp: Date.now() });
                        reject(new Error('Song already in playlist'));
                        return prevPlaylist;
                    }
                    const newPlaylist = [...prevPlaylist, song];
                    if (prevPlaylist.length === 0 && !currentSong) {
                        playSong(song);
                    }
                    resolve();
                    return newPlaylist;
                });
                setToastState({ message: `${song.name}이(가) 재생목록에 추가되었습니다.`, type: 'success', timestamp: Date.now() });
            } catch (error) {
                reject(error);
            }
        });
    }, [currentSong, playSong, setToastState]);

    // 플레이리스트에서 특정 곡을 제거하는 함수
    const removeSongFromPlaylist = useCallback((songId) => {
        setPlaylist((prevPlaylist) => {
            const updatedPlaylist = prevPlaylist.filter(song => song.id !== songId);
            if (currentSong?.id === songId) {
                if (updatedPlaylist.length > 0) {
                    const currentIndex = prevPlaylist.findIndex(song => song.id === songId);
                    const nextSongIndex = currentIndex < updatedPlaylist.length ? currentIndex : 0;
                    playSong(updatedPlaylist[nextSongIndex]);
                } else {
                    audioRef.current.pause();
                    setCurrentSong(null);
                    setIsPlaying(false);
                    if (currentBlobUrl) {
                        cleanupBlobUrl(currentBlobUrl);
                        setCurrentBlobUrl(null);
                    }
                }
            }
            setToastState({ message: '재생목록에서 곡이 삭제되었습니다.', type: 'success', timestamp: Date.now() });
            return updatedPlaylist;
        });
    }, [currentSong, playSong, currentBlobUrl, cleanupBlobUrl, setToastState]);

    // 외부에서 가져온 곡 목록으로 플레이리스트를 로드하는 함수
    const loadPlaylistSongs = useCallback(async (songs) => {
        try {
            setPlaylist([]);
            for (const song of songs) {
                await addSongToPlaylist(song);
            }
            setToastState({ message: `${songs.length}곡이 재생목록에 로드되었습니다.`, type: 'success', timestamp: Date.now() });
        } catch (error) {
            console.error('플레이리스트 로드 실패:', error);
            setToastState({ message: '플레이리스트 로드에 실패했습니다.', type: 'error', timestamp: Date.now() });
        }
    }, [addSongToPlaylist, setToastState]);

    // 플레이리스트를 새로운 곡 목록으로 완전히 교체하는 함수
    const replacePlaylist = useCallback(async (songs) => {
        try {
            audioRef.current.pause();
            setIsPlaying(false);
            if (currentBlobUrl) {
                cleanupBlobUrl(currentBlobUrl);
                setCurrentBlobUrl(null);
            }
            setPlaylist(songs);
            if (songs.length > 0) {
                await playSong(songs[0]);
            } else {
                setCurrentSong(null);
            }
            return true;
        } catch (error) {
            console.error('재생목록 교체 실패:', error);
            setToastState({ message: '재생목록 교체에 실패했습니다.', type: 'error', timestamp: Date.now() });
            return false;
        }
    }, [currentBlobUrl, cleanupBlobUrl, playSong, setToastState]);

    // 플레이리스트를 비우는 함수
    const clearPlaylist = useCallback(() => {
        audioRef.current.pause();
        setIsPlaying(false);
        setPlaylist([]);
        setCurrentSong(null);
        if (currentBlobUrl) {
            cleanupBlobUrl(currentBlobUrl);
            setCurrentBlobUrl(null);
        }
        setToastState({ message: '재생목록이 초기화되었습니다.', type: 'info', timestamp: Date.now() });
    }, [currentBlobUrl, cleanupBlobUrl, setToastState]);

    // 오디오 이벤트 리스너 설정
    useEffect(() => {
        const audio = audioRef.current;
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleError = (e) => {
            console.error('Audio error:', e);
            setIsPlaying(false);
            setToastState({ message: '오디오 재생 중 오류가 발생했습니다.', type: 'error', timestamp: Date.now() });
        };

        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('error', handleError);
        };
    }, [setToastState]);

    const value = useMemo(() => ({
        currentSong,
        isPlaying,
        playlist,
        playSong,
        pauseSong: () => audioRef.current.pause(),
        togglePlayPause,
        nextSong,
        prevSong,
        addSongToPlaylist,
        removeSongFromPlaylist,
        loadPlaylistSongs,
        replacePlaylist,
        clearPlaylist,
        audioRef,
        repeatMode,
        setRepeatMode,
    }), [
        currentSong,
        isPlaying,
        playlist,
        playSong,
        togglePlayPause,
        nextSong,
        prevSong,
        addSongToPlaylist,
        removeSongFromPlaylist,
        loadPlaylistSongs,
        replacePlaylist,
        clearPlaylist,
        repeatMode,
    ]);

    return (
        <MusicPlayerContext.Provider value={value}>
            {children}
        </MusicPlayerContext.Provider>
    );
};

export { MusicPlayerProvider };