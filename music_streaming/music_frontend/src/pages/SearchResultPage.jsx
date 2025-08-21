// src/pages/SearchResultPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { MusicPlayerContext } from '../context/MusicPlayerContext';
import '../styles/SearchResultPage.css';

const SearchResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { apiClient } = useContext(AuthContext);
  const { playSong } = useContext(MusicPlayerContext);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const query = searchParams.get('q') || '';

  const handleSongClick = (song) => {
    // 상세 페이지로 이동
    navigate(`/song/${song.id}`);
  };

  useEffect(() => {
    if (query.trim()) {
      handleSearch();
    }
  }, [query]);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      // 백엔드 API 호출
      const response = await apiClient.get('/api/search', {
        params: {
          q: query.trim(),
        },
      });
      setResults(response.data);
      console.log('검색 결과:', response.data);
    } catch (err) {
      console.error('검색 실패:', err);
      setError('검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-result-page-container">
      <h2 className="search-result-page-title">
        "{query}" 검색 결과
      </h2>
      
      {loading && (
        <div className="search-loading">
          <p>검색 중...</p>
        </div>
      )}
      
      {error && (
        <div className="search-error">
          <p>{error}</p>
        </div>
      )}
      
      {!loading && !error && results.length === 0 && query && (
        <div className="search-no-results">
          <p>검색 결과가 없습니다.</p>
          <p>다른 키워드로 다시 검색해보세요.</p>
        </div>
      )}
      
      {!loading && !error && results.length > 0 && (
        <div className="search-results">
          <p className="search-results-count">
            총 {results.length}개의 결과를 찾았습니다.
          </p>
          <div className="search-results-list">
            {results.map((song) => (
              <div 
                key={song.id} 
                className="search-result-item"
                onClick={() => handleSongClick(song)}
                style={{ cursor: 'pointer' }}
              >
                <div className="search-result-info">
                  <h3 className="search-result-title">{song.title}</h3>
                  <p className="search-result-artist">{song.artist?.name || '알 수 없는 아티스트'}</p>
                  {song.album && (
                    <p className="search-result-album">앨범: {song.album}</p>
                  )}
                  {song.genre && (
                    <p className="search-result-genre">장르: {song.genre}</p>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResultPage;
