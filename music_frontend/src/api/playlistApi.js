// src/api/playlistApi.js
import axios from 'axios';
import { handleAction, getAll, getById } from '../services/indexDB';

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const createPlaylist = async (name, songIds, isPublic) => {
  try {
    const res = await axios.post(
      `${API_URL}/api/playlists`,
      { name, songIds, isPublic, timestamp: Date.now() },
      { headers: getAuthHeaders() }
    );
    return res.data;
  } catch (error) {
    if (!navigator.onLine || error.response?.status === 401) {
      await handleAction('create_playlist', { name, songIds, isPublic, id: `temp_${Date.now()}` });
      window.showToast('오프라인. 나중에 동기화.', 'info');
    }
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

export const updatePlaylist = async (playlistId, name, songIds, isPublic) => {
  try {
    const res = await axios.put(
      `${API_URL}/api/playlists/${playlistId}`,
      { name, songIds, isPublic, timestamp: Date.now() },
      { headers: getAuthHeaders() }
    );
    return res.data;
  } catch (error) {
    if (!navigator.onLine || error.response?.status === 401) {
      await handleAction('update_playlist', { id: playlistId, name, songIds, isPublic });
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

export const togglePlaylistVisibility = async (playlistId, isPublic) => {
  try {
    const res = await axios.put(
      `${API_URL}/api/playlists/${playlistId}/visibility`,
      { isPublic, timestamp: Date.now() },
      { headers: getAuthHeaders() }
    );
    return res.data;
  } catch (error) {
    if (!navigator.onLine || error.response?.status === 401) {
      await handleAction('toggle_visibility', { id: playlistId, isPublic });
      window.showToast('오프라인. 나중에 동기화.', 'info');
    }
    throw error;
  }
};