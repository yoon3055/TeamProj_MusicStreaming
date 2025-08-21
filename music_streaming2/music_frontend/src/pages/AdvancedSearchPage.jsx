// src/pages/AdvancedSearchPage.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // AuthContext 임포트
import '../styles/AdvancedSearchPage.css';

const AdvancedSearchPage = () => {
  const { apiClient } = useContext(AuthContext); // AuthContext에서 apiClient 가져오기
  const [searchTerm, setSearchTerm] = useState('');
  const [artistFilter, setArtistFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      // 실제 백엔드 API 호출 로직 활성화
      const response = await apiClient.get('/api/search/advanced', {
        params: {
          q: searchTerm,
          artist: artistFilter,
          genre: genreFilter,
        },
      });
      setResults(response.data);
      console.log('고급 검색 결과:', response.data);
    } catch (err) {
      console.error('고급 검색 실패:', err);
      setError('검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="advanced-search-page-container">
      <h2 className="advanced-search-page-title">여러 곡 한 번에 찾기</h2>
      <form onSubmit={handleSearch} className="advanced-search-form">
        <div className="form-group">
          <label htmlFor="searchTerm" className="form-label">곡/앨범/아티스트:</label>
          <input
            type="text"
            id="searchTerm"
            className="form-input"
            placeholder="제목, 아티스트명, 앨범명"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="artistFilter" className="form-label">아티스트 필터:</label>
          <input
            type="text"
            id="artistFilter"
            className="form-input"
            placeholder="특정 아티스트명"
            value={artistFilter}
            onChange={(e) => setArtistFilter(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="genreFilter" className="form-label">장르 필터:</label>
          <input
            type="text"
            id="genreFilter"
            className="form-input"
            placeholder="발라드, 댄스, 힙합 등"
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
          />
        </div>
        <button type="submit" className="search-button" disabled={loading}>
          {loading ? '검색 중...' : '검색'}
        </button>
      </form>
      {error && <p className="search-error-message">{error}</p>}
      {loading && <p className="search-loading-message">검색 결과를 불러오는 중...</p>}
      {results.length > 0 && !loading && (
        <div className="search-results-container">
          <h3 className="search-results-title">검색 결과</h3>
          <ul className="search-results-list">
            {results.map((song) => (
              <li key={song.id} className="search-result-item">
                <span className="search-result-item-title">{song.title}</span> -{' '}
                <span className="search-result-item-artist">{typeof song.artist === 'object' ? song.artist?.name || '아티스트' : song.artist || '아티스트'}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {!results.length && !loading && !error && (searchTerm || artistFilter || genreFilter) && (
        <p className="search-empty-results">검색 결과가 없습니다.</p>
      )}
    </div>
  );
};

export default AdvancedSearchPage;