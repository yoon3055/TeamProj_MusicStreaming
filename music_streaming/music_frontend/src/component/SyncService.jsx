// src/services/SyncService.jsx
import { useEffect, useState, useContext, useCallback, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { debounce } from 'lodash';
import { getAll, put, remove } from '../services/indexDB';

const SyncService = () => {
  const { user, logout, refreshUser } = useContext(AuthContext); // 가정: refreshUser 추가
  const [isSyncing, setIsSyncing] = useState(false);
  const failedSyncsRef = useRef({ lyrics: new Set(), files: new Set(), playlists: new Set() });

  const API_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080';
  const SYNC_INTERVAL = 300000;

  const updateFailedSyncs = (type, id, add) => {
    const currentSet = failedSyncsRef.current[type];
    if (add) currentSet.add(id);
    else currentSet.delete(id);
    failedSyncsRef.current = { ...failedSyncsRef.current };
  };

  const retry = useCallback(async (fn, retries = 3, delay = 1000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === retries) throw error;
        await new Promise(r => setTimeout(r, delay * 2 ** attempt));
      }
    }
  }, []);

  const syncLyric = useCallback(async (lyric) => {
    if (!user?.token) throw new Error('인증 토큰 없음');
    try {
      const res = await axios.post(
        `${API_URL}/api/lyrics/admin`,
        { songId: lyric.songId, language: lyric.language, lyrics: lyric.lyrics },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      await remove('lyrics', lyric.id);
      window.showToast(`가사 동기화 성공: ${lyric.songId}`, 'success');
      updateFailedSyncs('lyrics', lyric.id, false);
      return res.data;
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        window.showToast('인증 오류. 재로그인 필요.', 'error');
        logout();
        await refreshUser(); // 재인증 시도
        throw error;
      }
      updateFailedSyncs('lyrics', lyric.id, true);
      throw error;
    }
  }, [user, logout, refreshUser, API_URL]);

  const syncFile = useCallback(async (file) => {
    if (!user?.token || user.role !== 'ADMIN') throw new Error('관리자 권한 필요');
    try {
      const formData = new FormData();
      formData.append('audio', file.fileData);
      if (file.coverFile) formData.append('cover', file.coverFile);
      formData.append('name', file.name);
      formData.append('artist', file.artist || '관리자 업로드');

      const res = await axios.post(
        `${API_URL}/api/admin/files/upload`,
        formData,
        { headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' } }
      );
      await remove('uploadedFiles', file.id);
      window.showToast(`파일 동기화 성공: ${file.name}`, 'success');
      updateFailedSyncs('files', file.id, false);
      return res.data;
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        window.showToast('인증 오류. 재로그인 필요.', 'error');
        logout();
        await refreshUser();
        throw error;
      }
      updateFailedSyncs('files', file.id, true);
      throw error;
    }
  }, [user, logout, refreshUser, API_URL]);

  const syncPlaylist = useCallback(async (playlist) => {
    if (!user?.token) throw new Error('인증 토큰 없음');
    try {
      const res = await axios.post(
        `${API_URL}/api/playlists`,
        { name: playlist.name, songs: playlist.songs },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      await remove('playlists', playlist.id);
      window.showToast(`플레이리스트 동기화 성공: ${playlist.name}`, 'success');
      updateFailedSyncs('playlists', playlist.id, false);
      return res.data;
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        window.showToast('인증 오류. 재로그인 필요.', 'error');
        logout();
        await refreshUser();
        throw error;
      }
      await put('playlists', playlist);
      updateFailedSyncs('playlists', playlist.id, true);
      throw error;
    }
  }, [user, logout, refreshUser, API_URL]);

  const syncBatch = useCallback(async (type, items, batchSize) => {
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    for (const batch of batches) {
      const results = await Promise.allSettled(
        batch.map(item =>
          retry(() =>
            type === 'lyrics' ? syncLyric(item) :
            type === 'files' ? syncFile(item) :
            syncPlaylist(item)
          ).then(serverState => {
            if (serverState?.timestamp > item.timestamp) {
              put(type, { ...item, ...serverState });
            }
          }).catch(err => {
            console.error(`${type} 동기화 실패:`, item.id, err);
            window.showToast(`${type} 동기화 실패: ${item.name || item.songId}`, 'error');
          })
        )
      );
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      window.showToast(`${type} 배치: ${successCount}/${batch.length} 성공`, 'info');
    }
  }, [retry, syncLyric, syncFile, syncPlaylist]);

  const checkServerAndSync = useCallback(async () => {
    if (!navigator.onLine) {
      window.showToast('오프라인. 연결 후 재시도.', 'info');
      return;
    }
    if (!user?.token) return;
    setIsSyncing(true);
    try {
      await axios.get(`${API_URL}/api/ping`, { headers: { Authorization: `Bearer ${user.token}` } });

      const lyrics = await getAll('lyrics');
      const files = await getAll('uploadedFiles');
      const playlists = await getAll('playlists');

      const failedLyrics = lyrics.filter(l => failedSyncsRef.current.lyrics.has(l.id));
      const failedFiles = files.filter(f => failedSyncsRef.current.files.has(f.id));
      const failedPlaylists = playlists.filter(p => failedSyncsRef.current.playlists.has(p.id));

      const targetLyrics = failedLyrics.length > 0 ? failedLyrics : lyrics;
      const targetFiles = user.role === 'ADMIN' ? (failedFiles.length > 0 ? failedFiles : files) : [];
      const targetPlaylists = failedPlaylists.length > 0 ? failedPlaylists : playlists;

      if (targetLyrics.length) await syncBatch('lyrics', targetLyrics, 10);
      if (targetFiles.length) await syncBatch('files', targetFiles, 2);
      if (targetPlaylists.length) await syncBatch('playlists', targetPlaylists, 5);

      const totalFailed = Object.values(failedSyncsRef.current).reduce((sum, set) => sum + set.size, 0);
      window.showToast(totalFailed === 0 ? '전체 동기화 성공' : `실패 ${totalFailed}개. 재시도 중.`, totalFailed === 0 ? 'success' : 'warning');
    } catch (error) {
      console.error('서버 연결 실패:', error);
      window.showToast('서버 연결 실패. 재시도.', 'error');
    } finally {
      setIsSyncing(false);
    }
  }, [user, syncBatch, API_URL]);

  useEffect(() => {
    const debouncedShowToast = debounce((message, type) => {
      window.showToast(message, type);
    }, 1000);

    const handleOnline = () => {
      console.log('온라인 감지, 동기화 시도');
      checkServerAndSync();
    };

    window.addEventListener('online', handleOnline);
    const intervalId = setInterval(checkServerAndSync, SYNC_INTERVAL);

    if (isSyncing) {
      debouncedShowToast(`동기화 중... (실패 ${Object.values(failedSyncsRef.current).reduce((sum, set) => sum + set.size, 0)}개)`, 'info');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(intervalId);
      debouncedShowToast.cancel();
    };
  }, [isSyncing, checkServerAndSync]);

  return null;
};

export default SyncService;