// src/pages/LikesFollowsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaTh, FaList, FaMusic, FaCompactDisc, FaMicrophoneAlt, FaChevronLeft } from 'react-icons/fa';
import Songcard from '../component/Songcard';
import Albumcard from '../component/Albumcard';
import Artistcard from '../component/ArtistCard';
import { MusicPlayerProvider } from '../context/MusicPlayerProvider';
import { getAll } from '../services/indexDB';
import { handleAction } from '../services/indexDB';
import { debounce } from 'lodash';
import '../styles/LikesFollowsPage.css';

const DUMMY_ALL_DATA = {
  songs: [
    { id: 's1', title: '사랑하는 그대', artist: '발라드 가수', coverUrl: '/images/K-051.jpg', duration: '3:45', url: 'url_s1', timestamp: Date.now() },
    { id: 's2', title: '여름 밤의 꿈', artist: '팝 그룹', coverUrl: '/images/K-052.jpg', duration: '4:10', url: 'url_s2', timestamp: Date.now() },
    { id: 's3', title: '어쩌다 마주친', artist: '댄스 그룹', coverUrl: '/images/K-053.jpg', duration: '2:55', url: 'url_s3', timestamp: Date.now() },
    { id: 's4', title: '그 해 겨울', artist: '싱어송라이터', coverUrl: '/images/K-054.jpg', duration: '4:30', url: 'url_s4', timestamp: Date.now() },
  ],
  albums: [
    { id: 'a1', title: '힐링 가득한 하루', artist: 'Various Artists', coverUrl: '/images/K-055.jpg', likeCount: 120, songs: [{ id: 'as1', title: '힐링곡1', url: 'url_as1' }, { id: 'as2', title: '힐링곡2', url: 'url_as2' }], timestamp: Date.now() },
    { id: 'a2', title: '퇴근길 플레이리스트', artist: 'Various Artists', coverUrl: '/images/K-056.jpg', likeCount: 78, songs: [{ id: 'as3', title: '퇴근곡1', url: 'url_as3' }], timestamp: Date.now() },
    { id: 'a3', title: '나만의 카페', artist: 'Various Artists', coverUrl: '/images/K-057.jpg', likeCount: 200, songs: [{ id: 'as4', title: '카페곡1', url: 'url_as4' }], timestamp: Date.now() },
    { id: 'a4', title: '비 오는 날 감성', artist: 'Various Artists', coverUrl: '/images/K-058.jpg', likeCount: 55, songs: [{ id: 'as5', title: '비오는날곡1', url: 'url_as5' }], timestamp: Date.now() },
  ],
  artists: [
    { id: 'at1', name: '아이유', genre: 'K-Pop', profileImageUrl: '/images/K-060.jpg', followerCount: 1200000, songs: [{ id: 'ats1', title: '아이유곡1', url: 'url_ats1' }, { id: 'ats2', title: '아이유곡2', url: 'url_ats2' }], timestamp: Date.now() },
    { id: 'at2', name: '방탄소년단', genre: 'K-Pop', profileImageUrl: '/images/K-061.jpg', followerCount: 5000000, songs: [{ id: 'ats3', title: 'BTS곡1', url: 'url_ats3' }], timestamp: Date.now() },
    { id: 'at3', name: 'ZICO', genre: 'K-Pop', profileImageUrl: '/images/K-062.jpg', followerCount: 800000, songs: [{ id: 'ats4', title: 'ZICO곡1', url: 'url_ats4' }], timestamp: Date.now() },
    { id: 'at4', name: 'NewJeans', genre: 'K-Pop', profileImageUrl: '/images/K-063.jpg', followerCount: 3500000, songs: [{ id: 'ats5', title: 'NewJeans곡1', url: 'url_ats5' }], timestamp: Date.now() },
  ],
};

const DUMMY_INITIAL_ACTIONS = [
  { type: 'toggle_like', payload: { itemType: 'song', id: 's1' }, timestamp: Date.now() - 1000 },
  { type: 'toggle_like', payload: { itemType: 'song', id: 's2' }, timestamp: Date.now() - 900 },
  { type: 'toggle_like', payload: { itemType: 'album', id: 'a1' }, timestamp: Date.now() - 800 },
  { type: 'toggle_like', payload: { itemType: 'album', id: 'a2' }, timestamp: Date.now() - 700 },
  { type: 'toggle_follow', payload: { id: 'at1' }, timestamp: Date.now() - 600 },
  { type: 'toggle_follow', payload: { id: 'at2' }, timestamp: Date.now() - 500 },
  { type: 'toggle_like', payload: { itemType: 'song', id: 's3' }, timestamp: Date.now() - 400 },
];

const LikesFollowsPage = () => {
  const [activeTab, setActiveTab] = useState('songs');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const [likedSongs, setLikedSongs] = useState([]);
  const [likedAlbums, setLikedAlbums] = useState([]);
  const [followedArtists, setFollowedArtists] = useState([]);

  const loadActionsFromDB = async () => {
    const actions = await getAll('sync_queue');
    return actions.filter(a => a.type === 'toggle_like' || a.type === 'toggle_follow');
  };

  const handleToggleLike = useCallback(async (type, id) => {
    try {
      const setState = type === 'song' ? setLikedSongs : setLikedAlbums;
      setState(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);

      if (process.env.NODE_ENV !== 'development') {
        await handleAction('toggle_like', { itemType: type, id });
      }
    } catch (err) {
      console.error(`Toggle ${type} failed:`, err);
      window.showToast('좋아요 처리 실패', 'error');
      const setState = type === 'song' ? setLikedSongs : setLikedAlbums;
      setState(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    }
  }, []);

  const handleToggleFollow = useCallback(async (id) => {
    try {
      setFollowedArtists(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
      if (process.env.NODE_ENV !== 'development') {
        await handleAction('toggle_follow', { id });
      }
    } catch (err) {
      console.error('Toggle follow failed:', err);
      window.showToast('팔로우 처리 실패', 'error');
      setFollowedArtists(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    }
  }, []);

  useEffect(() => {
    const loadInitialState = async () => {
      setLoading(true);
      setError(null);
      try {
        let actions;
        if (process.env.NODE_ENV === 'development') {
          actions = DUMMY_INITIAL_ACTIONS;
        } else {
          actions = await loadActionsFromDB();
        }

        const processed = actions.sort((a, b) => a.timestamp - b.timestamp).reduce((acc, action) => {
          const key = `${action.type}-${action.payload.id || action.payload.itemType + action.payload.id}`;
          acc[key] = action;
          return acc;
        }, {});

        const likedSongsSet = new Set();
        const likedAlbumsSet = new Set();
        const followedArtistsSet = new Set();

        Object.values(processed).forEach(action => {
          if (action.type === 'toggle_like') {
            const set = action.payload.itemType === 'song' ? likedSongsSet : likedAlbumsSet;
            if (set.has(action.payload.id)) {
              set.delete(action.payload.id);
            } else {
              set.add(action.payload.id);
            }
          } else if (action.type === 'toggle_follow') {
            if (followedArtistsSet.has(action.payload.id)) {
              followedArtistsSet.delete(action.payload.id);
            } else {
              followedArtistsSet.add(action.payload.id);
            }
          }
        });

        setLikedSongs([...likedSongsSet]);
        setLikedAlbums([...likedAlbumsSet]);
        setFollowedArtists([...followedArtistsSet]);
      } catch (err) {
        setError('데이터 로드 실패');
        console.error('Load actions failed:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialState();
  }, []);

  const debouncedSearch = debounce((value) => setSearchTerm(value), 300);

  const getFilteredData = useCallback(() => {
    let allData = [];
    let activeIds = new Set();
    if (activeTab === 'songs') {
      allData = DUMMY_ALL_DATA.songs;
      activeIds = new Set(likedSongs);
    } else if (activeTab === 'albums') {
      allData = DUMMY_ALL_DATA.albums;
      activeIds = new Set(likedAlbums);
    } else {
      allData = DUMMY_ALL_DATA.artists;
      activeIds = new Set(followedArtists);
    }

    const filteredBySearch = allData.filter(item => {
      const searchFields = activeTab === 'artists' ? [item.name] : [item.title, item.artist];
      return searchFields.some(field =>
        field?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    return filteredBySearch.filter(item => activeIds.has(item.id))
      .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [activeTab, likedSongs, likedAlbums, followedArtists, searchTerm, page]);

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
          if (activeTab === 'albums') {
            return (
              <Albumcard
                key={item.id}
                album={{ ...item, isLiked: likedAlbums.includes(item.id) }}
                onToggleLike={(id) => handleToggleLike('album', id)}
              />
            );
          } else if (activeTab === 'artists') {
            return (
              <Artistcard
                key={item.id}
                artist={{ ...item, isFollowed: followedArtists.includes(item.id) }}
                onToggleFollow={handleToggleFollow}
              />
            );
          } else {
            return (
              <Songcard
                key={item.id}
                song={{ ...item, isLiked: likedSongs.includes(item.id) }}
                onToggleLike={(id) => handleToggleLike('song', id)}
              />
            );
          }
        })}
        <button onClick={() => setPage(p => p + 1)} className="load-more-button">더 보기</button>
      </div>
    );
  };

  return (
    <MusicPlayerProvider>
      <div className="likes-follows-page-container">
        <div className="likes-follows-header">
          <Link to="/" className="back-button">
            <FaChevronLeft />
          </Link>
          <h1 className="likes-follows-page-title">Like & Follow</h1>
        </div>

        <div className="likes-follows-controls">
          <div className="tab-navigation">
            <button className={`tab-btn ${activeTab === 'songs' ? 'active' : ''}`} onClick={() => setActiveTab('songs')}>
              <FaMusic className="tab-icon" />
              <span className="tab-text">곡</span>
            </button>
            <button className={`tab-btn ${activeTab === 'albums' ? 'active' : ''}`} onClick={() => setActiveTab('albums')}>
              <FaCompactDisc className="tab-icon" />
              <span className="tab-text">앨범</span>
            </button>
            <button className={`tab-btn ${activeTab === 'artists' ? 'active' : ''}`} onClick={() => setActiveTab('artists')}>
              <FaMicrophoneAlt className="tab-icon" />
              <span className="tab-text">아티스트</span>
            </button>
          </div>

          <div className="search-and-view-toggle">
            <input
              type="text"
              placeholder={`${activeTab === 'artists' ? '아티스트' : activeTab === 'albums' ? '앨범' : '곡'} 검색...`}
              onChange={(e) => debouncedSearch(e.target.value)}
              className="search-input"
            />
            <div className="view-toggle">
              <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
                <FaTh />
              </button>
              <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
                <FaList />
              </button>
            </div>
          </div>
        </div>
        {renderContent()}
      </div>
    </MusicPlayerProvider>
  );
};

export default LikesFollowsPage;