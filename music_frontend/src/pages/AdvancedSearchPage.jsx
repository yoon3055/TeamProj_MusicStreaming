// src/pages/AdvancedSearchPage.jsx
import React, { useState } from 'react';
// import axios from 'axios'; // 🌐 검색 로직 구현 시 필요

import '../styles/AdvancedSearchPage.css'; // ✨ CSS 파일 임포트

const AdvancedSearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [artistFilter, setArtistFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [results, setResults] = useState([]); // 🌐 검색 결과 상태
  const [loading, setLoading] = useState(false); // 🌐 로딩 상태
  const [error, setError] = useState(null); // 🌐 에러 상태

  // 🌐 고급 검색 실행 핸들러 (실제 검색 로직은 백엔드 통신 필요)
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]); // 이전 결과 초기화

    // 🌐 실제 백엔드 API 호출 로직
    // try {
    //   const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/search/advanced`, {
    //     params: {
    //       q: searchTerm,
    //       artist: artistFilter,
    //       genre: genreFilter,
    //     },
    //   });
    //   setResults(response.data);
    //   console.log('🌐 고급 검색 결과:', response.data);
    // } catch (err) {
    //   console.error('🌐 고급 검색 실패:', err);
    //   setError('검색 중 오류가 발생했습니다.');
    // } finally {
    //   setLoading(false);
    // }

    // ⚠️ 데모를 위한 임시 검색 결과
    setTimeout(() => {
      if (searchTerm || artistFilter || genreFilter) {
        setResults([
          { id: 's1', title: `검색된 곡: ${searchTerm || '없음'}`, artist: `아티스트: ${artistFilter || '없음'}` },
          { id: 's2', title: `장르: ${genreFilter || '없음'}`, artist: '다른 아티스트' },
        ]);
      } else {
        setResults([]);
        setError('검색어를 입력해주세요.');
      }
      setLoading(false);
    }, 1000);
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

      {/* 검색 결과 표시 */}
      {error && <p className="search-error-message">{error}</p>}
      {loading && <p className="search-loading-message">검색 결과를 불러오는 중...</p>}
      {results.length > 0 && !loading && (
        <div className="search-results-container">
          <h3 className="search-results-title">검색 결과</h3>
          <ul className="search-results-list">
            {results.map((song) => (
              <li key={song.id} className="search-result-item">
                <span className="search-result-item-title">{song.title}</span> -{' '}
                <span className="search-result-item-artist">{song.artist}</span>
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