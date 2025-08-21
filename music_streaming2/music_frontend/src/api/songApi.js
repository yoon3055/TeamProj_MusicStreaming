// src/api/songApi.js
import API from './api';

export const songApi = {
  // 모든 노래 조회
  getAllSongs: async () => {
    try {
      const response = await API.get('/api/songs');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 페이지네이션으로 노래 조회
  getSongsWithPagination: async (page = 0, size = 20) => {
    try {
      const response = await API.get(`/api/songs/paged?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 특정 노래 상세 정보 조회
  getSongById: async (songId) => {
    try {
      const response = await API.get(`/api/songs/${songId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 아티스트별 노래 조회
  getSongsByArtist: async (artistId) => {
    try {
      const response = await API.get(`/api/songs/by-artist/${artistId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 노래 검색
  searchSongs: async (query) => {
    try {
      const response = await API.get(`/api/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 최근 업로드된 노래 조회 (오늘 발매 음악용)
  getRecentSongs: async (days = 7) => {
    try {
      const response = await API.get(`/api/songs/recent?days=${days}`);
      return response.data;
    } catch (error) {
      // 실패 시 전체 노래 목록에서 최신순으로 반환
      const allSongs = await this.getAllSongs();
      return allSongs.slice(0, 20); // 최신 20곡만 반환
    }
  },

  // 노래 좋아요 토글
  toggleSongLike: async (songId, userId) => {
    try {
      const response = await API.post(`/api/songs/${songId}/likes?userId=${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 노래 좋아요 수 조회
  getSongLikeCount: async (songId) => {
    try {
      const response = await API.get(`/api/songs/${songId}/likes/count`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 사용자의 노래 좋아요 여부 확인
  isLikedByUser: async (songId, userId) => {
    try {
      const response = await API.get(`/api/songs/${songId}/likes/is-liked?userId=${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
