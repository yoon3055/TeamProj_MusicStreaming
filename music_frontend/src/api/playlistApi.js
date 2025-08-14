// src/api/playlistApi.js
import axios from 'axios';
import { handleAction, getAll, getById } from '../services/indexDB';

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = localStorage.getItem('jwt');
  return { Authorization: `Bearer ${token}` };
};

export const createPlaylist = async (title) => {
  try {
    const res = await axios.post(
      `${API_URL}/api/playlists`,
      { title },
      { headers: getAuthHeaders() }
    );
    return res.data;
  } catch (error) {
    if (!navigator.onLine || error.response?.status === 401) {
      await handleAction('create_playlist', { title, id: `temp_${Date.now()}` });
      window.showToast('오프라인. 나중에 동기화.', 'info');
    }
    throw error;
  }
};

// 플레이리스트에 트랙 추가
export const addTrackToPlaylist = async (playlistId, songId, songOrder) => {
  try {
    const res = await axios.post(
      `${API_URL}/api/playlists/${playlistId}/tracks`,
      { playlistId, songId, songOrder },
      { headers: getAuthHeaders() }
    );
    return res.data;
  } catch (error) {
    if (!navigator.onLine || error.response?.status === 401) {
      await handleAction('add_track', { playlistId, songId, songOrder });
      window.showToast('오프라인. 나중에 동기화.', 'info');
    }
    throw error;
  }
};

// 모든 노래 목록 가져오기
export const fetchAllSongs = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/songs`, { headers: getAuthHeaders() });
    return res.data;
  } catch (error) {
    console.error('노래 목록 조회 실패:', error);
    throw error;
  }
};

export const fetchMyPlaylists = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/playlists`, { headers: getAuthHeaders() });
    return res.data;
  } catch (error) {
    if (!navigator.onLine) {
      const localPlaylists = await getAll('playlists');
      window.showToast('오프라인. 로컬 데이터 표시.', 'info');
      return localPlaylists;
    }
    throw error;
  }
};

export const fetchPlaylistDetails = async (playlistId) => {
  try {
    const res = await axios.get(`${API_URL}/api/playlists/${playlistId}`, { headers: getAuthHeaders() });
    return res.data;
  } catch (error) {
    if (!navigator.onLine) {
      const localPlaylist = await getById('playlists', playlistId);
      window.showToast('오프라인. 로컬 데이터 표시.', 'info');
      return localPlaylist;
    }
    throw error;
  }
};

export const updatePlaylist = async (playlistId, name, songIds) => {
  try {
    const res = await axios.put(
      `${API_URL}/api/playlists/${playlistId}`,
      { name, songIds, timestamp: Date.now() },
      { headers: getAuthHeaders() }
    );
    return res.data;
  } catch (error) {
    if (!navigator.onLine || error.response?.status === 401) {
      await handleAction('update_playlist', { id: playlistId, name, songIds });
      window.showToast('오프라인. 나중에 동기화.', 'info');
    }
    throw error;
  }
};

export const deletePlaylist = async (playlistId) => {
  try {
    const res = await axios.delete(`${API_URL}/api/playlists/${playlistId}`, { headers: getAuthHeaders() });
    return res.data;
  } catch (error) {
    if (!navigator.onLine || error.response?.status === 401) {
      await handleAction('delete_playlist', { id: playlistId });
      window.showToast('오프라인. 나중에 동기화.', 'info');
    }
    throw error;
  }
};

// 플레이리스트 트랙 목록 조회
export const fetchPlaylistTracks = async (playlistId) => {
  try {
    const res = await axios.get(`${API_URL}/api/playlists/${playlistId}/tracks`, { headers: getAuthHeaders() });
    return res.data;
  } catch (error) {
    console.error('플레이리스트 트랙 조회 실패:', error);
    throw error;
  }
};
