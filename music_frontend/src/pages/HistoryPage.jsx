// src/pages/HistoryPage.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios'; // 🌐 백엔드 통신을 위한 axios 임포트
import Songcard from '../component/Songcard.jsx'; // Songcard 컴포넌트 임포트
import { MusicPlayerContext } from '../context/MusicPlayerContext';

import '../styles/HistoryPage.css'; // ✨ CSS 파일 임포트

const HistoryPage = () => {
  // 🌐 MusicPlayerContext에서 음악 재생 함수를 가져옵니다.
  const { playSong } = useContext(MusicPlayerContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true); // 🌐 로딩 상태 추가
  const [error, setError] = useState(null); // 🌐 에러 상태 추가

  // 🌐 localStorage에서 토큰 값을 가져옵니다.
  const token = localStorage.getItem('token');

  // 🌐 재생 기록 가져오기
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 🌐 API 호출: /api/history 엔드포인트에서 재생 기록을 가져옵니다.
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/history`, {
        headers: { Authorization: `Bearer ${token}` }, // 🌐 인증이 필요합니다.
      });
      setHistory(res.data);
      console.log("🌐 재생 기록 데이터 로드 성공:", res.data);
    } catch (err) {
      console.error('🌐 재생 기록 가져오기 실패:', err);
      setError('재생 기록을 불러오는 데 실패했습니다.');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // 🌐 로딩 중일 때 표시되는 UI
  if (loading) {
    return (
      <div className="history-page-loading">
        재생 기록을 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div className="history-page-container">
      <h2 className="history-page-title">
        재생 기록
      </h2>

      <div className="history-page-grid">
        {error ? (
          <p className="history-page-message history-page-error-message">{error}</p>
        ) : history.length === 0 ? (
          <p className="history-page-message history-page-empty-message">
            재생 기록이 없습니다.
          </p>
        ) : (
          history.map((song) => (
            <Songcard key={song.id} song={song} onPlay={playSong} />
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryPage;