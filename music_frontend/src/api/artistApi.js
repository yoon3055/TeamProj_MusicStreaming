// src/api/artistApi.js
import API from './api';

export const artistApi = {
  // 전체 아티스트 조회
  getAllArtists: async () => {
    try {
      const response = await API.get('/api/artists');
      return response.data;
    } catch (error) {
      console.error('아티스트 목록 조회 실패:', error);
      throw error;
    }
  },

  // 단일 아티스트 조회
  getArtistById: async (id) => {
    try {
      const response = await API.get(`/api/artists/${id}`);
      return response.data;
    } catch (error) {
      console.error('아티스트 조회 실패:', error);
      throw error;
    }
  },

  // 아티스트 생성
  createArtist: async (artistData) => {
    try {
      const response = await API.post('/api/artists', artistData);
      return response.data;
    } catch (error) {
      console.error('아티스트 생성 실패:', error);
      throw error;
    }
  },

  // 아티스트 수정
  updateArtist: async (id, artistData) => {
    try {
      const response = await API.put(`/api/artists/${id}`, artistData);
      return response.data;
    } catch (error) {
      console.error('아티스트 수정 실패:', error);
      throw error;
    }
  },

  // 아티스트 삭제
  deleteArtist: async (id) => {
    try {
      await API.delete(`/api/artists/${id}`);
    } catch (error) {
      console.error('아티스트 삭제 실패:', error);
      throw error;
    }
  },

  // 아티스트 좋아요 토글
  toggleLike: async (artistId, userId) => {
    try {
      const response = await API.post(`/api/artists/${artistId}/like?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('아티스트 좋아요 토글 실패:', error);
      throw error;
    }
  },

  // 아티스트 좋아요 여부 확인
  isLiked: async (artistId, userId) => {
    try {
      const response = await API.get(`/api/artists/${artistId}/like?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('아티스트 좋아요 여부 확인 실패:', error);
      throw error;
    }
  },

  // 아티스트 좋아요 수 조회
  getLikeCount: async (artistId) => {
    try {
      const response = await API.get(`/api/artists/${artistId}/like-count`);
      return response.data;
    } catch (error) {
      console.error('아티스트 좋아요 수 조회 실패:', error);
      throw error;
    }
  },

  // 아티스트별 노래 목록 조회
  getArtistSongs: async (artistId) => {
    try {
      const response = await API.get(`/api/songs/by-artist/${artistId}`);
      return response.data;
    } catch (error) {
      console.error('아티스트별 노래 목록 조회 실패:', error);
      throw error;
    }
  }
};

// 좋아요한 아티스트 목록 조회
export const fetchLikedArtists = async () => {
  try {
    const token = localStorage.getItem('jwt');
    console.log('토큰 확인:', token ? '있음' : '없음');
    
    if (!token) {
      return { success: false, message: '로그인이 필요합니다.' };
    }

    const response = await API.get('/api/users/me/liked-artists', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return {
      success: true,
      data: response.data.artists || []
    };
  } catch (error) {
    console.error('좋아요한 아티스트 조회 실패:', error);
    return {
      success: false,
      message: error.response?.data?.message || '아티스트 목록을 불러오는데 실패했습니다.'
    };
  }
};
