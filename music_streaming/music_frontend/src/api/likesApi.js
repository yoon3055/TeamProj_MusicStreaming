// src/api/likesApi.js
import axios from 'axios';
import { handleAction, getAll } from '../services/indexDB';

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = localStorage.getItem('jwt') || localStorage.getItem('token');
  if (!token) {
    return {};
  }
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

// 아티스트 좋아요 토글
export const toggleArtistLikeApi = async (id) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/api/artists/${id}/likes`, null, { headers: getAuthHeaders() });
    return res.data;
  } catch (error) {
    if (!navigator.onLine || error.response?.status === 401) {
      await handleAction('toggle_artist_like', { id });
      window.showToast('오프라인. 나중에 동기화.', 'info');
    }
    throw error;
  }
};

// 좋아요한 노래 목록 조회
export const fetchLikedSongs = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/users/me/liked-songs`, { 
      headers: getAuthHeaders() 
    });

    return {
      success: true,
      data: response.data.songs || []
    };
  } catch (error) {
    console.error('좋아요한 노래 조회 실패:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

// 좋아요한 아티스트 목록 조회
export const fetchLikedArtists = async () => {
  try {
    const token = localStorage.getItem('jwt');
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch('/api/users/me/liked-artists', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('좋아요한 아티스트 API 응답:', data);
    
    // API 응답 구조에 맞게 데이터 반환
    return {
      artists: data.artists || [],
      totalCount: data.totalCount || 0
    };
  } catch (error) {
    console.error('좋아요한 아티스트 조회 실패:', error);
    throw error;
  }
};

// 팔로우한 가수 목록 조회
export const fetchFollowedArtists = async () => {
  try {
    const token = localStorage.getItem('jwt');
    const response = await fetch('/api/users/me/followed-artists', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.artists || []
    };
  } catch (error) {
    console.error('팔로우한 가수 조회 실패:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};