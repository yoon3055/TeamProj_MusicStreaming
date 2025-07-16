import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import RankingFilterBar from '../component/RankingFilterBar';
import RankingChart from '../component/RankingChart';
import Pagination from '../component/Pagination';

const ITEMS_PER_PAGE = 20;

const RankingPage = () => {
  const [regionFilter, setRegionFilter] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');
  const [rankingData, setRankingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRankingData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/rankings`, {
        params: {
          region: regionFilter,
          genre: genreFilter,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        },
      });
      setRankingData(res.data.items);
      setTotalPages(Math.ceil(res.data.total / ITEMS_PER_PAGE));
    } catch (err) {
      setError('랭킹 데이터를 불러오는 데 실패했습니다.');
      setRankingData([]);
    } finally {
      setLoading(false);
    }
  }, [regionFilter, genreFilter, currentPage]);

  useEffect(() => {
    fetchRankingData();
  }, [fetchRankingData]);

  const handleRegionChange = (value) => {
    setRegionFilter(value);
    setCurrentPage(1);
  };

  const handleGenreChange = (value) => {
    setGenreFilter(value);
    setCurrentPage(1);
  };

  return (
    <div className="ranking-page-container">
      <RankingFilterBar
        regionFilter={regionFilter}
        genreFilter={genreFilter}
        onRegionChange={handleRegionChange}
        onGenreChange={handleGenreChange}
      />

      {loading && <div className="loading-message">불러오는 중...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && !error && (
        <>
          <RankingChart data={rankingData} />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
};

export default RankingPage;