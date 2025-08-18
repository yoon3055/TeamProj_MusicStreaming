// src/pages/LikesFollowsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaMusic, FaChevronLeft } from 'react-icons/fa';
import Songcard from '../component/Songcard';
import { MusicPlayerProvider } from '../context/MusicPlayerProvider';
import { songApi } from '../api/songApi';
import { fetchLikedSongs, toggleLikeApi } from '../api/likesApi';
import '../styles/LikesFollowsPage.css';

const LikesFollowsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const [allSongs, setAllSongs] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);

  const loadDataFromDB = async () => {
    try {
      const likedSongsResponse = await fetchLikedSongs();
      
      if (likedSongsResponse.success) {
        setAllSongs(likedSongsResponse.data);
        setLikedSongs(likedSongsResponse.data.map(song => song.id));
      } else {
        throw new Error(likedSongsResponse.error || '좋아요한 노래 조회 실패');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleToggleLike = useCallback(async (type, id) => {
    try {
      setLikedSongs(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
      await toggleLikeApi(type, id);
    } catch (err) {
      window.showToast('좋아요 처리 실패', 'error');
      setLikedSongs(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    }
  }, []);


  useEffect(() => {
    const loadInitialState = async () => {
      setLoading(true);
      setError(null);
      try {
        await loadDataFromDB();
      } catch (err) {
        setError('데이터 로드 실패');
      } finally {
        setLoading(false);
      }
    };

    loadInitialState();
  }, []);

  const getFilteredData = useCallback(() => {
    const activeIds = new Set(likedSongs);
    return allSongs.filter(item => activeIds.has(item.id))
      .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [allSongs, likedSongs, page]);

  const filteredData = getFilteredData();

  const renderContent = () => {
    if (loading) {
      return <div className="loading">데이터를 불러오는 중...</div>;
    }
    if (error) {
      return (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>재시도</button>
        </div>
      );
    }
    if (!filteredData || filteredData.length === 0) {
      return (
        <div className="empty-state">
          <p>이곳에 아무것도 없어요. 새로운 음악을 찾아보세요!</p>
        </div>
      );
    }

    return (
      <div className={`likes-follows-grid ${viewMode}`}>
        {filteredData.map((item) => {
          // 데이터 유효성 검사
          if (!item || typeof item !== 'object' || !item.id) {
            return null;
          }

          return (
            <Songcard
              key={String(item.id)}
              song={{ 
                ...item, 
                id: String(item.id),
                title: String(item.title || '제목 없음'),
                isLiked: likedSongs.includes(item.id) 
              }}
              onToggleLike={(id) => handleToggleLike('song', id)}
            />
          );
        })}
        {filteredData.length >= PAGE_SIZE && (
          <button onClick={() => setPage(p => p + 1)} className="load-more-button">더 보기</button>
        )}
      </div>
    );
  };

  return (
    <MusicPlayerProvider>
      <div className="likes-follows-page-container">
        <div className="likes-follows-header">
          <Link to="/mypage" className="back-button">
            <FaChevronLeft />
          </Link>
          <h1 className="likes-follows-page-title">Like & Follow</h1>
        </div>

        <div className="likes-follows-controls">
          <div className="tab-navigation">
            <div className="tab-btn active">
              <FaMusic className="tab-icon" />
              <span className="tab-text">좋아요한 곡</span>
            </div>
          </div>
        </div>
        {renderContent()}
      </div>
    </MusicPlayerProvider>
  );
};

export default LikesFollowsPage;