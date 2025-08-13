// src/pages/RecommendPage.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import SongFilterBar from '../component/SongFilterBar';
import FilterButtons from '../component/FilterButtons';
import PlaylistDrawer from '../component/PlaylistDrawer';
import { MusicPlayerContext } from '../context/MusicPlayerContext';
import { loadMusicListFromDB } from '../services/indexDB';

import '../styles/RecommendPage.css';

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

const DUMMY_ARTISTS = [
  {
    id: 'da_a1',
    name: '별빛가수',
    profileImageUrl: '/images/K-051.jpg',
    genre: '발라드',
    origin: '국내',
    likeCount: 150,
    followerCount: 200,
    isLiked: true,
    isFollowed: false,
  },
  {
    id: 'da_a2',
    name: '댄스신',
    profileImageUrl: '/images/K-052.jpg',
    genre: '댄스',
    origin: '해외',
    likeCount: 230,
    followerCount: 350,
    isLiked: false,
    isFollowed: true,
  },
  {
    id: 'da_a3',
    name: '힙합킹',
    profileImageUrl: '/images/K-053.jpg',
    genre: '힙합',
    origin: '국내',
    likeCount: 180,
    followerCount: 290,
    isLiked: false,
    isFollowed: false,
  },
  {
    id: 'da_a4',
    name: '재즈여왕',
    profileImageUrl: '/images/K-054.jpg',
    genre: '재즈',
    origin: '해외',
    likeCount: 210,
    followerCount: 400,
    isLiked: true,
    isFollowed: true,
  },
  {
    id: 'da_a5',
    name: '록스타',
    profileImageUrl: '/images/K-055.jpg',
    genre: '락',
    origin: '국내',
    likeCount: 120,
    followerCount: 150,
    isLiked: false,
    isFollowed: false,
  },
  {
    id: 'da_a6',
    name: '트로트맨',
    profileImageUrl: '/images/K-056.jpg',
    genre: '트로트',
    origin: '국내',
    likeCount: 170,
    followerCount: 220,
    isLiked: true,
    isFollowed: false,
  },
];

const DUMMY_ALBUMS = [
  {
    id: 'da1',
    title: '봄날의 멜로디',
    artist: '플로이',
    coverUrl: '/images/K-051.jpg',
    songCount: 10,
    updatedAt: '2024.07.10',
    genre: '발라드',
    origin: '국내',
    isHighQuality: true,
  },
  {
    id: 'da2',
    title: '어느 맑은 날',
    artist: '클로버',
    coverUrl: '/images/K-052.jpg',
    songCount: 12,
    updatedAt: '2024.07.08',
    genre: '댄스',
    origin: '해외',
    isHighQuality: false,
  },
  {
    id: 'da3',
    title: '도시의 밤',
    artist: '시티송',
    coverUrl: '/images/K-053.jpg',
    songCount: 8,
    updatedAt: '2024.07.06',
    genre: '힙합',
    origin: '국내',
    isHighQuality: true,
  },
  {
    id: 'da4',
    title: '재즈의 향기',
    artist: '재즈밴드',
    coverUrl: '/images/K-054.jpg',
    songCount: 9,
    updatedAt: '2024.07.05',
    genre: '재즈',
    origin: '해외',
    isHighQuality: false,
  },
];

const DUMMY_SONGS = [
  {
    id: 'ds1',
    title: '환상속의 그대',
    artist: '플로아',
    coverUrl: '/images/K-055.jpg',
    isHighQuality: true,
    songCount: 1,
    updatedAt: '2024.07.10',
    genre: '발라드',
    origin: '국내',
  },
  {
    id: 'ds2',
    title: '고요한 숲',
    artist: '멜로디온',
    coverUrl: '/images/K-056.jpg',
    isHighQuality: false,
    songCount: 1,
    updatedAt: '2024.07.08',
    genre: '댄스',
    origin: '해외',
  },
  {
    id: 'ds3',
    title: '도시의 불빛',
    artist: '시티송',
    coverUrl: '/images/K-010.jpg',
    isHighQuality: true,
    songCount: 1,
    updatedAt: '2024.07.06',
    genre: '힙합',
    origin: '국내',
  },
  {
    id: 'ds4',
    title: '재즈카페',
    artist: '재즈밴드',
    coverUrl: '/images/K-011.jpg',
    isHighQuality: false,
    songCount: 1,
    updatedAt: '2024.07.05',
    genre: '재즈',
    origin: '해외',
  },
];

const DUMMY_FEATURED_PLAYLISTS = [
  {
    id: 'fp1',
    title: 'FLO 추천! 힐링 음악',
    artist: 'Various Artists',
    coverUrl: '/images/K-051.jpg',
    songCount: 20,
    updatedAt: '2024.07.10',
    genre: '발라드',
    origin: '국내',
    isHighQuality: true,
  },
  {
    id: 'fp2',
    title: '드라이브 히트',
    artist: 'Drive Sound',
    coverUrl: '/images/K-052.jpg',
    songCount: 18,
    updatedAt: '2024.07.10',
    genre: '댄스',
    origin: '해외',
    isHighQuality: false,
  },
  {
    id: 'fp3',
    title: '힙합 신곡 모음',
    artist: 'Various Artists',
    coverUrl: '/images/K-053.jpg',
    songCount: 25,
    updatedAt: '2024.07.10',
    genre: '힙합',
    origin: '국내',
    isHighQuality: true,
  },
  {
    id: 'fp4',
    title: '재즈와 커피',
    artist: 'Jazz Band',
    coverUrl: '/images/K-054.jpg',
    songCount: 15,
    updatedAt: '2024.07.10',
    genre: '재즈',
    origin: '해외',
    isHighQuality: false,
  },
];

const HOT_NEW_FILTERS = [
  { label: '종합', value: 'all' },
  { label: '국내', value: '국내' },
  { label: '해외', value: '해외' },
];

const POPULAR_ARTIST_FILTERS = HOT_NEW_FILTERS;

const BACKGROUND_SCHEMES = [
  'gradient-scheme-1',
  'gradient-scheme-2',
  'gradient-scheme-3',
  'gradient-scheme-4',
  'gradient-scheme-5',
];

const RecommendPage = () => {
  const { playSong } = useContext(MusicPlayerContext);

  const [filterHighQuality, setFilterHighQuality] = useState(false);
  const [genreFilter, setGenreFilter] = useState('');
  const [isFilterOptionsVisible, setIsFilterOptionsVisible] = useState(false);
  const [hotNewFilter, setHotNewFilter] = useState('all');
  const [popularArtistsFilter, setPopularArtistsFilter] = useState('all');

  const [todayAlbums, setTodayAlbums] = useState([]);
  const [hotNewSongs, setHotNewSongs] = useState([]);
  const [popularArtists, setPopularArtists] = useState(DUMMY_ARTISTS);
  const [featuredPlaylists, setFeaturedPlaylists] = useState([]);

  const [currentBgSchemeIndex, setCurrentBgSchemeIndex] = useState(0);

  // 고음질 필터 적용
  const applyHighQualityFilter = useCallback(
    (data) => (filterHighQuality ? data.filter((item) => item.isHighQuality) : data),
    [filterHighQuality]
  );

  useEffect(() => {
    async function fetchLocalMusicData() {
      try {
        const localMusicList = await loadMusicListFromDB();

        if (!localMusicList || localMusicList.length === 0) {
          setTodayAlbums(applyHighQualityFilter(DUMMY_ALBUMS).filter((a) => !genreFilter || a.genre === genreFilter));
          setHotNewSongs(applyHighQualityFilter(DUMMY_SONGS).filter((s) => !genreFilter || s.genre === genreFilter));
          setFeaturedPlaylists(
            applyHighQualityFilter(DUMMY_FEATURED_PLAYLISTS).filter((p) => !genreFilter || p.genre === genreFilter)
          );
          return;
        }

        const filteredToday = localMusicList.filter((item) => !genreFilter || item.genre === genreFilter);
        const filteredHotNew = localMusicList.filter((item) => !genreFilter || item.genre === genreFilter);
        const filteredFeatured = localMusicList.filter((item) => !genreFilter || item.genre === genreFilter);

        setTodayAlbums(applyHighQualityFilter(filteredToday));
        setHotNewSongs(applyHighQualityFilter(filteredHotNew));
        setFeaturedPlaylists(applyHighQualityFilter(filteredFeatured));
      } catch (error) {
        console.error('로컬 음악 데이터 불러오기 실패:', error);
        setTodayAlbums(applyHighQualityFilter(DUMMY_ALBUMS).filter((a) => !genreFilter || a.genre === genreFilter));
        setHotNewSongs(applyHighQualityFilter(DUMMY_SONGS).filter((s) => !genreFilter || s.genre === genreFilter));
        setFeaturedPlaylists(
          applyHighQualityFilter(DUMMY_FEATURED_PLAYLISTS).filter((p) => !genreFilter || p.genre === genreFilter)
        );
      }
    }
    fetchLocalMusicData();
  }, [genreFilter, filterHighQuality, applyHighQualityFilter]);

  const filterSectionData = (data, filterValue, sectionType) => {
    if (!data) return [];
    if (filterValue === 'all') return data;
    if (['todayAlbums', 'hotNewSongs', 'popularArtists', 'featuredPlaylists'].includes(sectionType)) {
      return data.filter((item) => item.origin === filterValue);
    }
    return data;
  };

  const handleGenreFilterApply = (genre) => {
    setGenreFilter(genre);
    setIsFilterOptionsVisible(false);
  };

  const handleFilterButtonClick = () => {
    setIsFilterOptionsVisible((prev) => !prev);
  };

  const handlePlayTheme = (item) => {
    console.log('재생 시도:', item);
    playSong({
      id: item.id,
      title: item.title,
      artist: item.artist || 'Various Artists',
      coverUrl: item.coverUrl,
      url: item.audioUrl || item.url || '',
    });
    alert(`${item.title} - ${item.artist || 'Various Artists'} 재생 시작!`);
  };

  const handleNextBackgroundScheme = useCallback(() => {
    setCurrentBgSchemeIndex((prev) => (prev + 1) % BACKGROUND_SCHEMES.length);
  }, []);

  const handleToggleLikeForArtist = (artistId) => {
    console.log('좋아요 토글:', artistId);
    setPopularArtists((prev) =>
      prev.map((artist) =>
        artist.id === artistId
          ? {
              ...artist,
              isLiked: !artist.isLiked,
              likeCount: artist.isLiked ? artist.likeCount - 1 : artist.likeCount + 1,
            }
          : artist
      )
    );
  };

  const handleToggleFollowForArtist = (artistId) => {
    console.log('팔로우 토글:', artistId);
    setPopularArtists((prev) =>
      prev.map((artist) =>
        artist.id === artistId
          ? {
              ...artist,
              isFollowed: !artist.isFollowed,
              followerCount: artist.isFollowed ? artist.followerCount - 1 : artist.followerCount + 1,
            }
          : artist
      )
    );
  };

  return (
    <div className="recommend-page-container">
      <div className="song-filter-bar-container">
        <button className="genre-filter-toggle-btn" onClick={handleFilterButtonClick}>
          장르 필터 {isFilterOptionsVisible ? '▲' : '▼'}
        </button>

        {isFilterOptionsVisible && (
          <div className="genre-filter-options-popup">
            <div className="filter-options-content">
              <label className="filter-option-item">
                <input
                  type="radio"
                  name="genre"
                  value=""
                  checked={genreFilter === ''}
                  onChange={() => handleGenreFilterApply('')}
                />
                모든 장르
              </label>
              {DUMMY_GENRES.map((g) => (
                <label key={g.id} className="filter-option-item">
                  <input
                    type="radio"
                    name="genre"
                    value={g.name}
                    checked={genreFilter === g.name}
                    onChange={() => handleGenreFilterApply(g.name)}
                  />
                  {g.name}
                </label>
              ))}
            </div>
          </div>
        )}

        <SongFilterBar filterHighQuality={filterHighQuality} setFilterHighQuality={setFilterHighQuality} />
      </div>

      <PlaylistDrawer
        title="추천 테마 플레이리스트"
        sectionType="featuredPlaylists"
        initialData={filterSectionData(featuredPlaylists, hotNewFilter, 'featuredPlaylists')}
        filterButtons={
          <FilterButtons
            currentFilter={hotNewFilter}
            onFilterChange={setHotNewFilter}
            filters={HOT_NEW_FILTERS}
            className="hidden"
          />
        }
        onPlayTheme={handlePlayTheme}
        cardType="song"
        containerClassName={BACKGROUND_SCHEMES[currentBgSchemeIndex]}
        onPageChange={handleNextBackgroundScheme}
      />

      <PlaylistDrawer
        title="오늘 발매 음악"
        sectionType="todayAlbums"
        initialData={filterSectionData(todayAlbums, hotNewFilter, 'todayAlbums')}
        filterButtons={null}
        onPlayTheme={handlePlayTheme}
        cardType="song"
        containerClassName={BACKGROUND_SCHEMES[currentBgSchemeIndex]}
        onPageChange={handleNextBackgroundScheme}
      />

      <PlaylistDrawer
        title="HOT & NEW"
        sectionType="hotNewSongs"
        initialData={filterSectionData(hotNewSongs, hotNewFilter, 'hotNewSongs')}
        filterButtons={<FilterButtons currentFilter={hotNewFilter} onFilterChange={setHotNewFilter} filters={HOT_NEW_FILTERS} />}
        onPlayTheme={handlePlayTheme}
        cardType="album"
        containerClassName={BACKGROUND_SCHEMES[currentBgSchemeIndex]}
        onPageChange={handleNextBackgroundScheme}
      />

      <PlaylistDrawer
        title="장르"
        sectionType="genres"
        initialData={DUMMY_GENRES}
        filterButtons={null}
        onPlayTheme={null}
        cardType="genre"
        containerClassName={BACKGROUND_SCHEMES[currentBgSchemeIndex]}
        onPageChange={handleNextBackgroundScheme}
      />

      <PlaylistDrawer
        title="인기 아티스트"
        sectionType="popularArtists"
        initialData={filterSectionData(popularArtists, popularArtistsFilter, 'popularArtists')}
        filterButtons={
          <FilterButtons
            currentFilter={popularArtistsFilter}
            onFilterChange={setPopularArtistsFilter}
            filters={POPULAR_ARTIST_FILTERS}
          />
        }
        onPlayTheme={null}
        cardType="artist"
        gridLayout={true}
        cardsPerPage={6}
        className="popular-artists"
        containerClassName={BACKGROUND_SCHEMES[currentBgSchemeIndex]}
        onPageChange={handleNextBackgroundScheme}
        onToggleLike={handleToggleLikeForArtist}
        onToggleFollow={handleToggleFollowForArtist}
      />
    </div>
  );
};

export default RecommendPage;
