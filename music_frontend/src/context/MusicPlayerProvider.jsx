import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MusicPlayerContext } from './MusicPlayerContext';

// IndexedDB 관련 헬퍼 함수들
const dbName = 'musicPlayerDB';
const storeName = 'uploadedFiles';

const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: 'id' });
            }
        };
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

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

const MusicPlayerProvider = ({ children }) => {
    const audioRef = useRef(new Audio());
    const [isPlaying, setIsPlaying] = useState(false);
    const [playlist, setPlaylist] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    const [repeatMode, setRepeatMode] = useState('none'); // none, one, all

    // Blob URL 관리 및 오디오 소스 설정 로직
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        // 이전 Blob URL 해제 클린업
        const prevSongUrl = audio.src;
        return () => {
            if (prevSongUrl && prevSongUrl.startsWith('blob:')) {
                URL.revokeObjectURL(prevSongUrl);
            }
        };
    }, [currentSong]);

    const playSong = useCallback(async (song) => {
        if (!song) {
            window.showToast("선택된 곡이 없습니다.", 'error');
            return;
        }

        // 동일한 곡이면 src 변경 및 load 생략
        if (currentSong?.id === song.id && audioRef.current.src === song.url) {
            if (audioRef.current.paused) {
                try {
                    await audioRef.current.play();
                    setIsPlaying(true);
                } catch (error) {
                    console.error("재생 실패:", error);
                    window.showToast("재생에 실패했습니다. 플레이 버튼을 눌러주세요.", 'error');
                    setIsPlaying(false);
                }
            }
            return;
        }

        setIsPlaying(false); // 재생 로직 시작 전 잠시 정지

        try {
            let songUrl = song.url;
            if (song.isLocal) {
                const fileData = await getFileFromDB(song.id);
                if (fileData && fileData.fileData) {
                    songUrl = URL.createObjectURL(fileData.fileData);
                } else {
                    window.showToast("재생할 파일을 찾을 수 없습니다.", 'error');
                    return;
                }
            }

            // 오디오 소스 업데이트
            audioRef.current.src = songUrl;
            setCurrentSong({ ...song, url: songUrl });

            // 재생 로직
            try {
                await audioRef.current.load(); // 명시적 로드
                await audioRef.current.play();
                setIsPlaying(true);
            } catch (error) {
                console.error("Audio playback failed:", error);
                window.showToast("음악 재생에 실패했습니다. 플레이 버튼을 눌러주세요.", 'error');
                setIsPlaying(false);
            }
        } catch (error) {
            console.error("Failed to load file:", error);
            window.showToast("파일 로딩 중 오류가 발생했습니다.", 'error');
            setCurrentSong(null);
            setIsPlaying(false);
        }
    }, [currentSong]);

    const togglePlayPause = useCallback(() => {
        const audio = audioRef.current;
        if (!currentSong) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play().catch(error => {
                console.error("Autoplay failed:", error);
                window.showToast("재생이 실패했습니다. 다시 시도해주세요.", 'error');
            });
            setIsPlaying(true);
        }
    }, [isPlaying, currentSong]);

    const nextSong = useCallback(() => {
        if (!currentSong || playlist.length <= 1) return;

        if (repeatMode === 'one') {
            // 1곡 반복: 현재 곡 재생
            audioRef.current.currentTime = 0;
            playSong(currentSong);
        } else {
            const currentIndex = playlist.findIndex(song => song.id === currentSong.id);
            const nextIndex = (currentIndex + 1) % playlist.length;
            playSong(playlist[nextIndex]);
        }
    }, [currentSong, playlist, repeatMode, playSong]);

    const prevSong = useCallback(() => {
        if (!currentSong || playlist.length <= 1) return;

        if (repeatMode === 'one') {
            // 1곡 반복: 현재 곡 재생
            audioRef.current.currentTime = 0;
            playSong(currentSong);
        } else {
            const currentIndex = playlist.findIndex(song => song.id === currentSong.id);
            const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
            playSong(playlist[prevIndex]);
        }
    }, [currentSong, playlist, repeatMode, playSong]);

    // ended 이벤트 리스너 제거 (MusicPlayer.jsx에서 처리하도록 위임)
    // useEffect(() => {
    //     const audio = audioRef.current;
    //     if (!audio) return;
    //     audio.addEventListener('ended', nextSong);
    //     return () => {
    //         audio.removeEventListener('ended', nextSong);
    //     };
    // }, [nextSong]);

    const addSongToPlaylist = useCallback((song) => {
        setPlaylist((prevPlaylist) => {
            if (prevPlaylist.some(s => s.id === song.id)) {
                window.showToast(`${song.name}은(는) 이미 재생목록에 있습니다.`, 'warning');
                return prevPlaylist;
            }
            const newPlaylist = [...prevPlaylist, song];
            if (!currentSong) {
                playSong(song); // 재생목록에 곡이 없을 때 바로 재생
            }
            return newPlaylist;
        });
        window.showToast(`${song.name}이(가) 현재 재생목록에 추가되었습니다.`, 'success');
    }, [currentSong, playSong]);

    const removeSongFromPlaylist = useCallback((songId) => {
        setPlaylist((prevPlaylist) => {
            const updatedPlaylist = prevPlaylist.filter(song => song.id !== songId);
            window.showToast('재생목록에서 곡이 삭제되었습니다.', 'success');
            if (currentSong?.id === songId) {
                if (updatedPlaylist.length > 0) {
                    const nextSongIndex = prevPlaylist.findIndex(song => song.id === songId) % updatedPlaylist.length;
                    playSong(updatedPlaylist[nextSongIndex]);
                } else {
                    setCurrentSong(null);
                    setIsPlaying(false);
                }
            }
            return updatedPlaylist;
        });
    }, [currentSong, playSong]);

    const value = useMemo(() => ({
        currentSong,
        isPlaying,
        playlist,
        playSong,
        pauseSong: () => {},
        togglePlayPause,
        nextSong,
        prevSong,
        addSongToPlaylist,
        removeSongFromPlaylist,
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
        repeatMode,
    ]);

    return (
        <MusicPlayerContext.Provider value={value}>
            {children}
        </MusicPlayerContext.Provider>
    );
};

export { MusicPlayerProvider };