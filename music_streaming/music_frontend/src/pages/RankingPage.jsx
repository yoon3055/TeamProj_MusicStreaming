import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../styles/RankingPage.css';



const RankingPage = () => {
  const { user, apiClient } = useContext(AuthContext);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likedSongs, setLikedSongs] = useState({});
  const [hoveredSongId, setHoveredSongId] = useState(null);

  // API 호출 함수들
  const fetchSongs = async () => {
    try {
      const response = await apiClient.get('/api/songs');
      return response.data;
    } catch (error) {
      console.error('곡 데이터 fetch 오류:', error);
      throw new Error('곡 데이터를 가져오는데 실패했습니다.');
    }
  };

  const fetchLikeCount = async (songId) => {
    try {
      const response = await apiClient.get(`/api/songs/${songId}/likes/count`);
      return response.data;
    } catch (error) {
      console.error('좋아요 수 fetch 오류:', error);
      return 0;
    }
  };

  const toggleSongLike = async (songId, userId) => {
    try {
      const response = await apiClient.post(`/api/songs/${songId}/likes?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('좋아요 토글 오류:', error);
      throw new Error('좋아요 토글에 실패했습니다.');
    }
  };

  // 컴포넌트 마운트 시 곡 데이터 로드
  useEffect(() => {
    // apiClient가 있을 때 데이터 로드 (로그인 여부와 관계없이)
    if (!apiClient) {
      setLoading(false);
      return;
    }

    const loadSongs = async () => {
      try {
        setLoading(true);
        const songsData = await fetchSongs();
        
        // 각 곡의 좋아요 수를 가져와서 추가
        const songsWithLikes = await Promise.all(
          songsData.map(async (song) => {
            const likeCount = await fetchLikeCount(song.id);
            return { ...song, likeCount };
          })
        );
        
        // 좋아요 수로 내림차순 정렬
        const sortedSongs = songsWithLikes.sort((a, b) => b.likeCount - a.likeCount);
        setSongs(sortedSongs);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSongs();
  }, [apiClient]);

  const handleLikeToggle = async (songId) => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const isLiked = await toggleSongLike(songId, user.id);
      setLikedSongs(prev => ({ ...prev, [songId]: isLiked }));
      
      // 좋아요 수 업데이트
      setSongs(prevSongs => 
        prevSongs.map(song => 
          song.id === songId 
            ? { ...song, likeCount: song.likeCount + (isLiked ? 1 : -1) }
            : song
        ).sort((a, b) => b.likeCount - a.likeCount) // 다시 정렬
      );
    } catch (error) {
      alert('좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="ranking-page">
        <h1>랭킹 차트</h1>
        <div className="loading-message">로딩 중...</div>
      </div>
    );
  }



  if (error) {
    return (
      <div className="ranking-page">
        <h1>랭킹 차트</h1>
        <div className="error-message">오류: {error}</div>
      </div>
    );
  }

  return (
    <div className="ranking-page">
      <h1>랭킹 차트</h1>
      <p className="ranking-description">좋아요 수가 많은 순서로 정렬됩니다</p>

      <div className="ranking-list">
        {songs.length === 0 && <p>등록된 곡이 없습니다.</p>}

        {songs.map((song, idx) => (
          <div
            key={song.id}
            className="ranking-item"
            onMouseEnter={() => setHoveredSongId(song.id)}
            onMouseLeave={() => setHoveredSongId(null)}
          >
            <div className="ranking-index">{idx + 1}</div>



            <div className="album-name-artist">
              <div className="album-name" title={song.title}>{song.title}</div>
              <div className="artist-name" title={song.artist?.name || '알 수 없는 아티스트'}>
                {song.artist?.name || '알 수 없는 아티스트'}
              </div>
            </div>

            <div className="song-info">
              장르: {song.genre || '미분류'}
            </div>

            <div className="action-buttons">
              <button
                className={`action-button ${likedSongs[song.id] ? 'active' : ''}`}
                onClick={() => handleLikeToggle(song.id)}
                aria-label="좋아요"
              >
                ❤️ <span className="count">{song.likeCount || 0}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RankingPage;
