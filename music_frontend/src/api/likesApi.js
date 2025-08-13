// src/api/likesApi.js
import axios from 'axios';
import { handleAction, getAll } from '../services/indexDB';

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const fetchLikesFollowsData = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/users/me/likes-follows`, { headers: getAuthHeaders() });
    return res.data;
  } catch (error) {
    if (!navigator.onLine) {
      const likes = await getAll('likes');
      window.showToast('오프라인. 로컬 데이터 표시.', 'info');
      return {
        likedSongs: likes.filter(l => l.state.itemType === 'song').map(l => l.id),
        likedAlbums: likes.filter(l => l.state.itemType === 'album').map(l => l.id),
        followedArtists: likes.filter(l => l.state.type === 'toggle_follow').map(l => l.id),
      };
    }
    console.error('Fetch likes/follows failed:', error);
    throw error;
  }
};

export const toggleLikeApi = async (type, id) => {
  try {
    const endpoint = type === 'album' ? `/api/albums/${id}/likes` : `/api/songs/${id}/likes`;
    const res = await axios.post(`${API_BASE_URL}${endpoint}`, null, { headers: getAuthHeaders() });
    return res.data;
  } catch (error) {
    if (!navigator.onLine || error.response?.status === 401) {
      await handleAction('toggle_like', { itemType: type, id });
      window.showToast('오프라인. 나중에 동기화.', 'info');
    }
    throw error;
  }
};

export const toggleFollowApi = async (id) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/api/follows/artists`, { artistId: id }, { headers: getAuthHeaders() });
    return res.data;
  } catch (error) {
    if (!navigator.onLine || error.response?.status === 401) {
      await handleAction('toggle_follow', { id });
      window.showToast('오프라인. 나중에 동기화.', 'info');
    }
    throw error;
  }
};