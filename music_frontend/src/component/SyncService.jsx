import { useEffect, useState, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { debounce } from 'lodash';

const SyncService = () => {
    const { logout } = useContext(AuthContext);
    const [isSyncing, setIsSyncing] = useState(false);
    const dbName = 'musicPlayerDB';
    const lyricsStoreName = 'lyrics';
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

    const openDB = useCallback(() => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName, 2);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(lyricsStoreName)) {
                    db.createObjectStore(lyricsStoreName, { keyPath: 'id' });
                }
            };
            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }, [dbName, lyricsStoreName]);

    const getAllLyricsFromDB = useCallback(async () => {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(lyricsStoreName, 'readonly');
            const store = transaction.objectStore(lyricsStoreName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }, [openDB, lyricsStoreName]);

    const deleteLyricsFromDB = useCallback(async (id) => {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(lyricsStoreName, 'readwrite');
            const store = transaction.objectStore(lyricsStoreName);
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    }, [openDB, lyricsStoreName]);

    const retry = useCallback(async (fn, retries = 3, delay = 1000) => {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                return await fn();
            } catch (_err) {
                if (attempt === retries) throw _err;
                await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
            }
        }
    }, []);

    const syncLyric = useCallback(async (lyric) => {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('토큰 없음');
        try {
            await axios.post(`${API_URL}/api/lyrics/admin`, {
                songId: lyric.songId,
                language: lyric.language,
                lyrics: lyric.lyrics
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await deleteLyricsFromDB(lyric.id);
            window.showToast(`가사 동기화 성공: ${lyric.songId}`, 'success');
        } catch (_err) {
            if (_err.response?.status === 401) {
                window.showToast('토큰이 만료되었습니다. 다시 로그인하세요.', 'error');
                logout();
            }
            throw _err;
        }
    }, [logout, API_URL, deleteLyricsFromDB]);

    const checkServerAndSync = useCallback(async () => {
        if (!navigator.onLine) {
            console.log('오프라인 상태, 동기화 대기');
            return;
        }
        setIsSyncing(true);
        try {
            await axios.get(`${API_URL}/api/ping`);
            const lyrics = await getAllLyricsFromDB();
            for (const lyric of lyrics) {
                try {
                    await retry(() => syncLyric(lyric));
                } catch (err) {
                    console.error(`가사 동기화 실패: ${lyric.id}`, err.message, err.stack);
                }
            }
        } catch (err) {
            console.log('서버 연결 실패, 동기화 대기:', err.message);
        } finally {
            setIsSyncing(false);
        }
    }, [retry, syncLyric, API_URL, getAllLyricsFromDB]);

    useEffect(() => {
        const debouncedShowToast = debounce((message, type) => {
            window.showToast(message, type);
        }, 1000);

        const handleOnline = () => {
            console.log('온라인 상태 감지, 동기화 시도');
            checkServerAndSync();
        };

        window.addEventListener('online', handleOnline);
        const intervalId = setInterval(checkServerAndSync, 300000); // 5분 주기

        if (isSyncing) {
            debouncedShowToast('가사를 서버와 동기화 중...', 'info');
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            clearInterval(intervalId);
            debouncedShowToast.cancel();
        };
    }, [isSyncing, logout, checkServerAndSync]);

    return null;
};

export default SyncService;