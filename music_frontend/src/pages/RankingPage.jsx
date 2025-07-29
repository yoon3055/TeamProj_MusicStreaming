// src/pages/RankingPage.jsx
import React, { useState, useEffect } from 'react';
import RankingFilterBar from '../component/RankingFilterBar';  // 필터바 컴포넌트 경로 조정
import '../styles/RankingPage.css';

// --- 더미 데이터 ---
const DUMMY_GENRES = [
  { id: 'dg1', name: '발라드', imageUrl: '/images/K-057.jpg' },
  { id: 'dg2', name: '댄스', imageUrl: '/images/K-058.jpg' },
  { id: 'dg3', name: '힙합', imageUrl: '/images/K-059.jpg' },
  { id: 'dg4', name: '재즈', imageUrl: '/images/K-051.jpg' },
  { id: 'dg5', name: '락', imageUrl: '/images/K-052.jpg' },
  { id: 'dg6', name: '트로트', imageUrl: '/images/K-053.jpg' },
  { id: 'dg7', name: '팝', imageUrl: '/images/K-054.jpg' },
  { id: 'dg8', name: 'R&B', imageUrl: '/images/K-055.jpg' },
  { id: 'dg9', name: '클래식', imageUrl: '/images/K-056.jpg' },
  { id: 'dg10', name: 'EDM', imageUrl: '/images/K-010.jpg' },
  { id: 'dg11', name: '컨트리', imageUrl: '/images/K-011.jpg' },
  { id: 'dg12', name: '레게', imageUrl: '/images/K-015.jpg' },
];

// 장르 필터 옵션 (필터바에서 사용할 수 있음)
const GENRE_OPTIONS = ['all', '발라드', '댄스', '힙합', '재즈', '락', '트로트', '팝', 'R&B', '클래식', 'EDM', '컨트리', '레게'];

const DUMMY_ALBUMS = [
  { id: 'da1', title: '봄날의 멜로디', artist: '플로이', coverUrl: '/images/K-051.jpg', songCount: 10, updatedAt: '2024.07.10', genre: '발라드', origin: '국내', length: 240, isHighQuality: true, likes: 120, followers: 500 },
  { id: 'da2', title: '어느 맑은 날', artist: '클로버', coverUrl: '/images/K-052.jpg', songCount: 12, updatedAt: '2024.07.08', genre: '댄스', origin: '해외', length: 215, isHighQuality: false, likes: 80, followers: 230 },
  { id: 'da3', title: '향기로운 기억', artist: '레몬트리', coverUrl: '/images/K-053.jpg', songCount: 8, updatedAt: '2024.07.05', genre: '힙합', origin: '국내', length: 198, isHighQuality: true, likes: 140, followers: 340 },
  { id: 'da4', title: '밤거리 가로등', artist: '레몬트리', coverUrl: '/images/K-054.jpg', songCount: 9, updatedAt: '2024.07.05', genre: '재즈', origin: '국내', length: 320, isHighQuality: false, likes: 40, followers: 100 },
  { id: 'da5', title: '밥먹는 시간', artist: '레몬트리', coverUrl: '/images/K-055.jpg', songCount: 11, updatedAt: '2024.07.05', genre: '락', origin: '해외', length: 275, isHighQuality: true, likes: 190, followers: 420 },
  { id: 'da6', title: '퇴근 길', artist: '레몬트리', coverUrl: '/images/K-056.jpg', songCount: 13, updatedAt: '2024.07.05', genre: '트로트', origin: '국내', length: 180, isHighQuality: false, likes: 60, followers: 190 },
];

// 국가 필터 옵션
const REGION_OPTIONS = [
  { label: '종합', value: 'all' },
  { label: '국내', value: 'domestic' },
  { label: '해외', value: 'international' },
];

// 초 → mm:ss 변환 함수
function formatLength(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const RankingPage = () => {
  const [genreFilter, setGenreFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [filteredAlbums, setFilteredAlbums] = useState([]);

  // 좋아요/팔로우/담기 상태 관리 (앨범 ID 기준)
  const [likedAlbums, setLikedAlbums] = useState({});
  const [followedAlbums, setFollowedAlbums] = useState({});
  const [addedAlbums, setAddedAlbums] = useState({});

  // 호버 중인 앨범 ID
  const [hoveredAlbumId, setHoveredAlbumId] = useState(null);

  useEffect(() => {
    let filtered = DUMMY_ALBUMS;

    if (genreFilter !== 'all') {
      filtered = filtered.filter(album => album.genre === genreFilter);
    }

    if (regionFilter !== 'all') {
      if (regionFilter === 'domestic') {
        filtered = filtered.filter(album => album.origin === '국내');
      } else if (regionFilter === 'international') {
        filtered = filtered.filter(album => album.origin === '해외');
      }
    }

    setFilteredAlbums(filtered);
  }, [genreFilter, regionFilter]);

  // 클릭 토글 함수
  const toggleLike = (id) => {
    setLikedAlbums(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleFollow = (id) => {
    setFollowedAlbums(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAdd = (id) => {
    setAddedAlbums(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="ranking-page">
      <h1>랭킹 차트</h1>

      <RankingFilterBar
        genreFilter={genreFilter}
        regionFilter={regionFilter}
        onGenreChange={setGenreFilter}
        onRegionChange={setRegionFilter}
      />

      <div className="ranking-list">
        {filteredAlbums.length === 0 && <p>검색 결과가 없습니다.</p>}
        {filteredAlbums.map((album, idx) => (
          <div
            key={album.id}
            className="ranking-item"
            onMouseEnter={() => setHoveredAlbumId(album.id)}
            onMouseLeave={() => setHoveredAlbumId(null)}
          >
            <div className="ranking-index">{idx + 1}</div>
            <img src={album.coverUrl} alt={`${album.title} 앨범 커버`} className="album-thumbnail" />

            <div className="album-info-with-play">
              <div className="album-artist-box">
                <div className="album-name" title={album.title}>{album.title}</div>
                <div className="artist-name" title={album.artist}>{album.artist}</div>
              </div>

              <div className="play-button-wrapper">
                {hoveredAlbumId === album.id && (
                  <button
                    className="play-button"
                    onClick={() => alert(`재생: ${album.title}`)}
                    aria-label="재생"
                  >
                    ▶
                  </button>
                )}
              </div>
            </div>

            <div className="song-info">
              곡수: {album.songCount} / 길이: {formatLength(album.length)}
            </div>

            <div className="action-buttons">
              <button
                className={`action-button ${likedAlbums[album.id] ? 'active' : ''}`}
                onClick={() => toggleLike(album.id)}
                aria-label="좋아요"
              >
                ❤️ <span className="count">{album.likes}</span>
              </button>

              <button
                className={`action-button ${followedAlbums[album.id] ? 'active' : ''}`}
                onClick={() => toggleFollow(album.id)}
                aria-label="팔로우"
              >
                👥 <span className="count">{album.followers}</span>
              </button>

              <button
                className={`action-button ${addedAlbums[album.id] ? 'active' : ''}`}
                onClick={() => toggleAdd(album.id)}
                aria-label="담기"
              >
                ➕ 담기
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RankingPage;
