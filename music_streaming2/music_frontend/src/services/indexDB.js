// src/services/indexDB.js
import axios from 'axios';

const DB_NAME = 'musicPlayerDB';
const DB_VERSION = 3;
const STORE_NAMES = ['lyrics', 'uploadedFiles', 'playlists', 'sync_queue', 'likes', 'playback_history'];
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080';

let db = null;

// DB 열기 & 업그레이드 처리
export const openDB = () => {
    if (db) return Promise.resolve(db);

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            STORE_NAMES.forEach((storeName) => {
                if (!db.objectStoreNames.contains(storeName)) {
                    const options = storeName === 'sync_queue' ? { keyPath: 'id', autoIncrement: true } : { keyPath: 'id' };
                    const store = db.createObjectStore(storeName, options);
                    store.createIndex('timestamp', 'timestamp');
                }
            });
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
};

// 트랜잭션 실행 유틸
const transactionRequest = async (storeName, mode, operationCallback) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        const request = operationCallback(store);

        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e.target.error);
    });
};

// CRUD 함수
export const getAll = async (storeName) =>
    transactionRequest(storeName, 'readonly', (store) => store.getAll());

export const getById = async (storeName, id) =>
    transactionRequest(storeName, 'readonly', (store) => store.get(id));

export const put = async (storeName, obj) =>
    transactionRequest(storeName, 'readwrite', (store) => store.put(obj));

export const remove = async (storeName, id) =>
    transactionRequest(storeName, 'readwrite', (store) => store.delete(id));

// 플레이리스트에 데이터 추가
export const addToPlaylists = async (playlistData) => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('playlists', 'readwrite');
            const store = tx.objectStore('playlists');
            const request = store.put({
                ...playlistData,
                timestamp: Date.now(),
            });

            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e.target.error);
        });
    } catch (error) {
        console.error('플레이리스트 추가 실패:', error);
        throw error;
    }
};

// sync_queue 전용 함수
export const addToSyncQueue = async (action) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('sync_queue', 'readwrite');
        const store = tx.objectStore('sync_queue');
        const index = store.index('timestamp');
        const request = index.openCursor(null, 'prev');

        request.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor && cursor.value.type === action.type && cursor.value.payload.id === action.payload.id) {
                cursor.value.payload = action.payload;
                cursor.value.timestamp = action.timestamp;
                cursor.update(cursor.value);
                resolve(cursor.primaryKey);
            } else {
                const addReq = store.add(action);
                addReq.onsuccess = () => resolve(addReq.result);
                addReq.onerror = (err) => reject(err.target.error);
            }
        };
    });
};

export const getSyncQueue = async () => getAll('sync_queue');

export const deleteSyncQueueItem = async (id) => remove('sync_queue', id);

// API 호출 헬퍼
const callApi = async (action) => {
    const { type, payload } = action;
    console.log(`🌐 API 호출: ${type} -`, payload);

    let endpoint = '';
    let body = null;
    let method = 'post';

    if (type === 'toggle_like') {
        const url = `/api/songs/${payload.id}/likes`;
        const existingLike = await getById('likes', payload.id);
        if (existingLike) {
            endpoint = url;
            method = 'delete';
        } else {
            endpoint = url;
            method = 'post';
        }
    } else if (type === 'toggle_follow') {
        endpoint = `/api/follows/artists`;
        body = { artistId: payload.id };
    } else if (type === 'create_playlist') {
        endpoint = `/api/playlists`;
        body = payload;
    }

    if (!endpoint) {
        console.warn('⚠️ 알 수 없는 action type, 스킵:', type);
        return null;
    }

    const token = localStorage.getItem('token');
    if (!token) throw new Error('인증 토큰 없음');
    const response = await axios({
        method,
        url: `${API_BASE_URL}${endpoint}`,
        data: body,
        headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
};

// 동기화 작업 처리
export const handleAction = async (actionType, payload) => {
    try {
        const action = { type: actionType, payload, timestamp: Date.now() };
        const id = await addToSyncQueue(action);
        console.log(`💾 작업 저장됨: ${actionType} - ${payload.id || payload.name}, DB ID: ${id}`);
        await sync();
    } catch (error) {
        console.error('IndexDB 저장 실패:', error);
        window.showToast('작업 저장 실패. 재시도.', 'error');
    }
};

// 동기화 수행
export const sync = async () => {
    try {
        const actions = await getSyncQueue();

        if (actions.length > 500) {
            const oldActions = actions.slice(0, actions.length - 500);
            await Promise.all(oldActions.map(a => deleteSyncQueueItem(a.id)));
            console.warn('큐 오버플로: 오래된 액션 삭제');
        }

        if (actions.length === 0) {
            console.log('✅ 동기화할 작업 없음');
            return;
        }

        console.log(`🚀 동기화 시작: ${actions.length}개`);

        const results = await Promise.allSettled(
            actions.map(async (action) => {
                const serverState = await retryApiCall(() => callApi(action), 3);
                if (serverState) {
                    await put('likes', { id: action.payload.id, state: serverState, timestamp: Date.now() });
                    await deleteSyncQueueItem(action.id);
                    console.log(`✅ 동기화 성공: ${action.type} - ${action.payload.id || action.payload.name}`);
                }
            })
        );

        const failedCount = results.filter(r => r.status === 'rejected').length;
        window.showToast(`동기화 완료: ${actions.length - failedCount}/${actions.length} 성공`, failedCount ? 'warning' : 'success');
    } catch (error) {
        console.error('동기화 프로세스 실패:', error);
        window.showToast('동기화 실패. 재시도.', 'error');
    }
};

// 재시도 헬퍼
const retryApiCall = async (fn, retries = 3, delay = 1000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === retries) throw error;
            await new Promise(r => setTimeout(r, delay * 2 ** attempt));
        }
    }
};

// 음악 목록 로드 함수
export const loadMusicListFromDB = async (storeName = 'uploadedFiles') => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = async () => {
                let data = request.result;
                if (storeName === 'playlists' && (!data || data.length === 0)) {
                    const history = await loadPlaybackHistoryFromDB();
                    data = history.map((item) => ({
                        id: item.id || `hist_${Date.now()}`,
                        title: item.title || 'Unknown Title',
                        artist: item.artist || 'Unknown Artist',
                        coverUrl: item.coverUrl || '/images/default-cover.jpg',
                        songCount: item.songCount || 1,
                        updatedAt: item.updatedAt || new Date().toISOString().split('T')[0],
                        genre: item.genre || 'Unknown',
                        origin: item.origin || '국내',
                        isHighQuality: item.isHighQuality || false,
                    }));
                } else {
                    data = data.map((item) => ({
                        id: item.id || `file_${Date.now()}`,
                        title: item.title || item.name || 'Unknown Title',
                        artist: item.artist || 'Unknown Artist',
                        coverUrl: item.coverUrl || '/images/default-cover.jpg',
                        songCount: item.songCount || 1,
                        updatedAt: item.updatedAt || new Date().toISOString().split('T')[0],
                        genre: item.genre || 'Unknown',
                        origin: item.origin || '국내',
                        isHighQuality: item.isHighQuality || false,
                    }));
                }
                resolve(data);
            };
            request.onerror = (e) => reject(e.target.error);
        });
    } catch (error) {
        console.error('음악 목록 로드 실패:', error);
        throw error;
    }
};

// ✅ 추가: 모든 업로드 곡 가져오기
export const getAllSongsFromDB = async () => {
    return getAll('uploadedFiles');
};

// ✅ 추가: 좋아요 상태 토글
export const toggleLike = async (songId, isLiked) => {
    const db = await openDB();
    const transaction = db.transaction('uploadedFiles', 'readwrite');
    const store = transaction.objectStore('uploadedFiles');

    return new Promise((resolve, reject) => {
        const getRequest = store.get(songId);

        getRequest.onsuccess = () => {
            const song = getRequest.result;
            if (song) {
                song.isLiked = isLiked;
                const putRequest = store.put(song);
                putRequest.onsuccess = () => resolve(song);
                putRequest.onerror = (event) => reject(event.target.error);
            } else {
                reject(new Error('Song not found'));
            }
        };
        getRequest.onerror = (event) => reject(event.target.error);
    });
};

// ✅ 추가: 재생 기록 로드 함수
export const loadPlaybackHistoryFromDB = async () => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('playback_history', 'readonly');
            const store = tx.objectStore('playback_history');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e.target.error);
        });
    } catch (error) {
        console.error('재생 기록 로드 실패:', error);
        throw error;
    }
};

// ✅ 추가: 좋아요 수 기준으로 랭킹 곡 가져오기 (임시: 좋아요가 true인 곡을 우선 정렬)
export const getRankingSongs = async () => {
    const allSongs = await getAllSongsFromDB();
    return allSongs.sort((a, b) => (b.isLiked ? 1 : 0) - (a.isLiked ? 1 : 0));
};

// ✅ 추가: 랜덤 추천 곡 가져오기
export const getRecommendedSongs = async (count = 6) => {
    const allSongs = await getAllSongsFromDB();
    const shuffled = allSongs.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

// 플레이리스트에 데이터 추가
export const addPlaylistToDB = async (playlistData) => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('playlists', 'readwrite');
            const store = tx.objectStore('playlists');
            const request = store.put({
                ...playlistData,
                timestamp: Date.now(),
            });

            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e.target.error);
        });
    } catch (error) {
        console.error('플레이리스트 추가 실패:', error);
        throw error;
    }
};

// 플레이리스트 목록 로드 함수
export const loadPlaylistsFromDB = async () => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('playlists', 'readonly');
            const store = tx.objectStore('playlists');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e.target.error);
        });
    } catch (error) {
        console.error('플레이리스트 목록 로드 실패:', error);
        throw error;
    }
};

// 자동 동기화
setInterval(sync, 300000);

export default {
    openDB,
    getAll,
    getById,
    put,
    remove,
    addToSyncQueue,
    getSyncQueue,
    deleteSyncQueueItem,
    handleAction,
    sync,
    loadMusicListFromDB,
    loadPlaybackHistoryFromDB,
    addToPlaylists,
    getAllSongsFromDB,
    toggleLike,
    getRankingSongs,
    getRecommendedSongs,
    addPlaylistToDB,
    loadPlaylistsFromDB,
};