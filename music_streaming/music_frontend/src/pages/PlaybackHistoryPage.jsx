import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MusicPlayerContext } from '../context/MusicPlayerContext';
import { FaClock, FaMusic, FaSync, FaHeart, FaRegHeart, FaPlay, FaPlus } from 'react-icons/fa';
import { Grid, List } from 'lucide-react';

import { getAll, put, getById, sync, remove } from '../services/indexDB';
import CreatePlaylistModalPage from './CreatePlaylistModalPage';
import '../styles/HistoryPage.css';

const DEV_MODE = process.env.REACT_APP_DEV_MODE === 'true';
const PAGE_SIZE = 20;

// public/uploads 경로 기준 더미 데이터
const dummyPlaybackHistory = [
  {
    id: 'song1',
    title: '가질 수 없는 너',
    artist: '현빈',
    coverUrl: '/images/closer.jpg',
    audioUrl: '/uploads/014 현빈 - 가질 수 없는 너.mp3',
    playedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    isLiked: true,
    type: 'song',
    timestamp: Date.now(),
    isLocal: true, // public 경로 파일은 로컬파일처럼 처리
  },
  // ... 이하 생략 (기존 더미 데이터 동일)
];

const PlaybackHistoryPage = () => {
  const { user } = useContext(AuthContext);
  const { playSong, replacePlaylist } = useContext(MusicPlayerContext);

  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [totalHistoryCount, setTotalHistoryCount] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // 인덱스DB에서 재생기록 불러오기 + 더미 초기화
  const loadHistoryFromIndexedDB = useCallback(async () => {
    setIsLoading(true);
    try {
      let storedHistory = await getAll('playback_history');

      if (storedHistory.length === 0 && DEV_MODE) {
        // 더미 데이터 초기화
        for (const item of dummyPlaybackHistory) {
          await put('playback_history', item);
        }
        storedHistory = dummyPlaybackHistory;
        window.showToast('더미 데이터로 재생 기록을 초기화했습니다.', 'info');
      }

      // 재생 기록 정렬 (최신 순)
      storedHistory.sort((a, b) => b.timestamp - a.timestamp);

      // 곡/앨범에 isLocal 필드 보장 + url 필드 셋팅 (playSong에서 사용)
      storedHistory = storedHistory.map((item) => {
        if (item.type === 'album' && item.songs) {
          return {
            ...item,
            songs: item.songs.map((song) => ({
              ...song,
              isLocal: song.isLocal ?? false,
              url: song.audioUrl || song.url || '', // url 필드 필수 추가
            })),
          };
        }
        return {
          ...item,
          isLocal: item.isLocal ?? false,
          url: item.audioUrl || item.url || '',
        };
      });

      setHistory(storedHistory.slice(0, PAGE_SIZE));
      setTotalHistoryCount(storedHistory.length);
    } catch (err) {
      console.error('재생 기록 로드 실패', err);
      window.showToast('재생 기록 로드 실패.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 및 유저 변경 시 로드
  useEffect(() => {
    if (user) {
      loadHistoryFromIndexedDB();
    }
  }, [user, loadHistoryFromIndexedDB]);

  // 더보기 버튼 클릭 시 추가 로드
  const loadMoreData = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const startIndex = history.length;
      let nextHistory = await getAll('playback_history');
      nextHistory.sort((a, b) => b.timestamp - a.timestamp);
      nextHistory = nextHistory.map((item) => {
        if (item.type === 'album' && item.songs) {
          return {
            ...item,
            songs: item.songs.map((song) => ({
              ...song,
              isLocal: song.isLocal ?? false,
              url: song.audioUrl || song.url || '',
            })),
          };
        }
        return {
          ...item,
          isLocal: item.isLocal ?? false,
          url: item.audioUrl || item.url || '',
        };
      });
      const newData = nextHistory.slice(startIndex, startIndex + PAGE_SIZE);
      if (newData.length > 0) {
        setHistory((prevHistory) => [...prevHistory, ...newData]);
      }
    } catch (error) {
      console.error('추가 데이터 로드 실패:', error);
      window.showToast('추가 데이터 로드 실패.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [history, isLoading]);

  useEffect(() => {
    if (page > 1) {
      loadMoreData();
    }
  }, [page, loadMoreData]);

  // 동기화 버튼 클릭 시 인덱스DB 동기화 처리
  const handleSyncButtonClick = useCallback(async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      await sync();
      await loadHistoryFromIndexedDB();
      window.showToast('동기화가 완료되었습니다.', 'success');
    } catch (error) {
      console.error('동기화 실패:', error);
      window.showToast('동기화 실패했습니다.', 'error');
    } finally {
      setIsSyncing(false);
    }
  }, [user, loadHistoryFromIndexedDB]);

  // 카드 클릭 시 재생 또는 앨범 재생
  const handleCardClick = (item) => {
    if (item.type === 'song') {
      playSong(item);
    } else if (item.type === 'album' && item.songs) {
      // songs 배열에 url 필드 잘 있는지 확인 후 재생목록 교체
      const playableSongs = item.songs.map((song) => ({
        id: song.id,
        title: song.title || song.name,
        artist: song.artist || 'Unknown',
        url: song.url || song.audioUrl || '',
        coverUrl: song.coverUrl || '/src/assets/default-cover.jpg',
        isLocal: song.isLocal ?? false,
      }));
      replacePlaylist(playableSongs);
    }
  };

  // 좋아요 토글
  const handleLikeToggle = async (itemId, e) => {
    e.stopPropagation();
    try {
      const item = await getById('playback_history', itemId);
      if (!item) {
        console.warn('좋아요를 누른 항목을 찾을 수 없습니다:', itemId);
        return;
      }
      const updatedItem = { ...item, isLiked: !item.isLiked, timestamp: Date.now() };

      // url 필드 유지 (재생 가능하도록)
      if (!updatedItem.url && updatedItem.audioUrl) {
        updatedItem.url = updatedItem.audioUrl;
      }
      if (updatedItem.type === 'album' && updatedItem.songs) {
        updatedItem.songs = updatedItem.songs.map((song) => ({
          ...song,
          url: song.audioUrl || song.url || '',
          isLocal: song.isLocal ?? false,
        }));
      }

      await put('playback_history', updatedItem);
      setHistory((prev) => prev.map((h) => (h.id === itemId ? updatedItem : h)));
      window.showToast(updatedItem.isLiked ? '좋아요 추가' : '좋아요 취소', 'success');
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
      window.showToast('좋아요 업데이트 실패.', 'error');
    }
  };

  // 재생 기록 삭제
  const handleDeleteHistoryItem = async (itemId, e) => {
    e.stopPropagation();
    try {
      await remove('playback_history', itemId);
      setHistory((prev) => prev.filter((item) => item.id !== itemId));
      window.showToast('재생 기록이 삭제되었습니다.', 'success');
    } catch (error) {
      console.error('재생 기록 삭제 실패:', error);
      window.showToast('삭제 실패했습니다.', 'error');
    }
  };

  // 선택 토글
  const toggleSelectItem = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  // 사이드바에서 선택된 노래 삭제
  const handleRemoveSongFromSidebar = (songId) => {
    setSelectedItems((prev) => prev.filter((id) => id !== songId));
  };

  // 선택된 노래 리스트
  const getSelectedSongs = () => {
    // 선택된 id 배열에서 재생기록 항목 찾아 songs 배열인지 체크 후 펼침 처리
    const songs = [];
    selectedItems.forEach((id) => {
      const item = history.find((h) => h.id === id);
      if (!item) return;
      if (item.type === 'song') {
        songs.push({
          id: item.id,
          title: item.title,
          artist: item.artist,
          url: item.url,
          coverUrl: item.coverUrl,
          isLocal: item.isLocal ?? false,
        });
      } else if (item.type === 'album' && item.songs) {
        item.songs.forEach((song) => {
          songs.push({
            id: song.id,
            title: song.title || song.name,
            artist: song.artist,
            url: song.url || song.audioUrl,
            coverUrl: song.coverUrl || '/src/assets/default-cover.jpg',
            isLocal: song.isLocal ?? false,
          });
        });
      }
    });
    return songs;
  };

  // 플레이리스트 생성 모달 열기
  const handleCreatePlaylist = () => {
    setShowCreateModal(true);
  };

  // 플레이리스트 생성 완료 후 처리
  const handlePlaylistCreated = (newPlaylist) => {
    setSelectedItems([]);
    if (newPlaylist && newPlaylist.songs) {
      const normalizedSongs = newPlaylist.songs.map((song) => ({
        id: song.id,
        title: song.title || song.name,
        artist: song.artist || 'Unknown',
        url: song.url || song.audioUrl || '',
        coverUrl: song.coverUrl || '/src/assets/default-cover.jpg',
        isLocal: song.isLocal ?? false,
      }));
      replacePlaylist(normalizedSongs);
    }
    setShowCreateModal(false);
    window.showToast('플레이리스트가 생성되었습니다.', 'success');
  };

  // 그리드 / 리스트 뷰 토글
  const handleViewToggle = () => {
    setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'));
  };

  // 더보기 버튼 클릭
  const loadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  if (isLoading && history.length === 0) {
    return (
      <div className="history-page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>재생 기록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page-container">
      <div className="history-main">
        <div className="page-header">
          <h1 className="page-title">
            <FaClock className="page-title-icon" />
            재생 기록
          </h1>
          <div className="header-actions">
            {selectedItems.length > 0 && (
              <button onClick={handleCreatePlaylist} className="create-playlist-btn">
                <FaPlus /> 플레이리스트 생성
              </button>
            )}
            <button onClick={handleSyncButtonClick} disabled={isSyncing} className="sync-button">
              <FaSync className={`sync-button-icon ${isSyncing ? 'spinning' : ''}`} />
              {isSyncing ? '동기화 중...' : '동기화'}
            </button>
            <button onClick={handleViewToggle} className="menu-btn">
              {viewMode === 'grid' ? <List /> : <Grid />}
            </button>
            {history.length > 0 && history.length < totalHistoryCount && (
              <button onClick={loadMore} className="load-more-header-btn">
                더 보기
              </button>
            )}
          </div>
        </div>

        {history.length === 0 ? (
          <div className="empty-state">
            <FaMusic className="empty-icon" />
            <h3 className="empty-title">재생 기록이 없습니다</h3>
            <p className="empty-description">음악을 재생하면 여기에 기록이 나타납니다.</p>
          </div>
        ) : (
          <div className={`history-list ${viewMode === 'grid' ? 'grid-view' : 'list-view'}`}>
            {history.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className={`media-card ${viewMode === 'grid' ? 'grid-item' : 'list-item'}`}
                onClick={() => handleCardClick(item)}
              >
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => toggleSelectItem(item.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="select-checkbox"
                />
                <div className="media-image-wrapper">
                  <img
                    src={item.coverUrl || '/images/default_cover.png'}
                    alt={item.title}
                    className="media-image"
                  />
                  <div className="play-overlay">
                    <button className="play-button">
                      <FaPlay />
                    </button>
                  </div>
                </div>
                <div className="media-info">
                  <h4 className="media-title">{item.title}</h4>
                  <p className="media-artist">{item.artist}</p>
                  <p className="played-time">
                    {new Date(item.playedAt).toLocaleDateString()}{' '}
                    {new Date(item.playedAt).toLocaleTimeString()}
                  </p>
                  <span className="media-type-badge">{item.type === 'song' ? '곡' : '앨범'}</span>
                </div>
                <div className="media-actions">
                  {item.type === 'song' && (
                    <button
                      onClick={(e) => handleLikeToggle(item.id, e)}
                      className="like-button"
                      title={item.isLiked ? '좋아요 취소' : '좋아요'}
                    >
                      {item.isLiked ? <FaHeart className="liked" /> : <FaRegHeart />}
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                    className="delete-button"
                    title="재생 기록 삭제"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            {history.length < totalHistoryCount && (
              <button onClick={loadMore} className="load-more-button">
                더 보기
              </button>
            )}
          </div>
        )}
      </div>

      {/* 플레이리스트 생성 모달 */}
      <div className="history-sidebar">
        <CreatePlaylistModalPage
          selectedSongs={getSelectedSongs()}
          onRemoveSong={handleRemoveSongFromSidebar}
          onPlaylistCreated={handlePlaylistCreated}
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </div>
    </div>
  );
};

export default PlaybackHistoryPage;