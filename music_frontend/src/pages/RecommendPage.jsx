// src/pages/RecommendPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import SongFilterBar from '../component/SongFilterBar';
import FilterButtons from '../component/FilterButtons';
import PlaylistDrawer from '../component/PlaylistDrawer';

import { MusicPlayerContext } from '../context/MusicPlayerContext';

import '../styles/RecommendPage.css';

const HOT_NEW_FILTERS = [
  { label: '종합', value: 'all' },
  { label: '국내', value: 'domestic' },
  { label: '해외', value: 'international' },
];
const POPULAR_ARTIST_FILTERS = HOT_NEW_FILTERS;

const RecommendPage = () => {
  const { playSong } = useContext(MusicPlayerContext);

  const [filterHighQuality, setFilterHighQuality] = useState(false);
  const [genreFilter, setGenreFilter] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [hotNewFilter, setHotNewFilter] = useState('all');
  const [popularArtistsFilter, setPopularArtistsFilter] = useState('all');

  const [todayAlbums, setTodayAlbums] = useState([]);
  const [hotNewSongs, setHotNewSongs] = useState([]);
  const [genres, setGenres] = useState([]);
  const [popularArtists, setPopularArtists] = useState([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState([]);

  const handleGenreFilterApply = (genre) => {
    setGenreFilter(genre);
  };

  const handleHotNewFilterChange = (filterValue) => {
    setHotNewFilter(filterValue);
  };

  const handlePopularArtistsFilterChange = (filterValue) => {
    setPopularArtistsFilter(filterValue);
  };

  const handlePlayTheme = (item) => {
    const songToPlay = {
      id: item.id,
      title: item.title,
      artist: item.artist || 'Various Artists',
      coverUrl: item.coverUrl,
    };
    playSong(songToPlay);
    alert(`${songToPlay.title} - ${songToPlay.artist} 재생 시작!`);
  };

  // 초기 데이터 설정 및 필터링
  useEffect(() => {
    const DUMMY_ALBUMS = [
      { id: 'da1', title: '봄날의 멜로디', artist: '플로이', coverUrl: '/images/K-052.jpg', songCount: 10, updatedAt: '2024.07.10', genre: '발라드', origin: '국내' },
      { id: 'da2', title: '어느 맑은 날', artist: '클로버', coverUrl: '/images/K-053.jpg', songCount: 12, updatedAt: '2024.07.08', genre: '댄스', origin: '해외' },
      { id: 'da3', title: '향기로운 기억', artist: '레몬트리', coverUrl: '/images/K-054.jpg', songCount: 8, updatedAt: '2024.07.05', genre: '힙합', origin: '국내' },
    ];
    const DUMMY_SONGS = [
      { id: 'ds1', title: '환상속의 그대', artist: '플로아', coverUrl: '/images/K-055.jpg', isHighQuality: true, songCount: 1, updatedAt: '2024.07.10', genre: '발라드', origin: '국내' },
      { id: 'ds2', title: '고요한 숲', artist: '멜로디온', coverUrl: '/images/K-056.jpg', isHighQuality: false, songCount: 1, updatedAt: '2024.07.08', genre: '댄스', origin: '해외' },
    ];
    const DUMMY_GENRES = [
      { id: 'dg1', name: '발라드', imageUrl: '/images/K-057.jpg' },
      { id: 'dg2', name: '댄스', imageUrl: '/images/K-058.jpg' },
    ];
    const DUMMY_ARTISTS = [
      { id: 'da_a1', name: '별빛가수', profileImageUrl: '/images/K-059.jpg', genre: '발라드', origin: '국내' },
      { id: 'da_a2', name: '댄스신', profileImageUrl: '/images/K-060.jpg', genre: '댄스', origin: '해외' },
    ];
    const DUMMY_FEATURED_PLAYLISTS = [
      { id: 'fp1', title: 'FLO 추천! 힐링 음악', artist: 'Various Artists', coverUrl: '/images/K-061.jpg', songCount: 20, updatedAt: '2024.07.10', genre: '발라드', origin: '국내' },
      { id: 'fp2', title: '드라이브 히트', artist: 'Drive Sound', coverUrl: '/images/K-062.jpg', songCount: 18, updatedAt: '2024.07.10', genre: '댄스', origin: '해외' },
    ];

    // 장르 필터 적용
    setTodayAlbums(DUMMY_ALBUMS.filter(a => !genreFilter || a.genre === genreFilter));
    setHotNewSongs(DUMMY_SONGS.filter(s => !genreFilter || s.genre === genreFilter));
    setGenres(DUMMY_GENRES.filter(g => !genreFilter || g.name === genreFilter));
    setPopularArtists(DUMMY_ARTISTS.filter(a => !genreFilter || a.genre === genreFilter));
    setFeaturedPlaylists(DUMMY_FEATURED_PLAYLISTS.filter(p => !genreFilter || p.genre === genreFilter));
  }, [genreFilter]);

  // 섹션별 필터 적용 (로딩 없이 실시간 필터링)
  const filterSectionData = (data, filterValue, sectionType) => {
    if (!data || filterValue === 'all') return data;
    return data.filter(item => {
      if (sectionType === 'hotNewSongs' || sectionType === 'popularArtists') {
        return item.origin === filterValue;
      }
      return true; // 다른 섹션은 필터 적용 안 함
    });
  };

  const FilterModal = ({ isOpen, onClose, onApply, availableGenres }) => {
    const [selectedGenre, setSelectedGenre] = useState('');

    const handleApply = () => {
      onApply(selectedGenre);
      onClose();
    };

    if (!isOpen) return null;

    return (
      <div className="filter-modal">
        <div className="filter-modal-content">
          <h3>필터</h3>
          <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)} className="filter-select">
            <option value="">모든 장르</option>
            {availableGenres.map((genre) => <option key={genre.id} value={genre.name}>{genre.name}</option>)}
          </select>
          <div className="filter-modal-buttons">
            <button className="filter-button" onClick={handleApply}>적용</button>
            <button className="filter-button cancel" onClick={onClose}>취소</button>
          </div>
        </div>
      </div>
    );
  };
  FilterModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onApply: PropTypes.func.isRequired,
    availableGenres: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string.isRequired, name: PropTypes.string.isRequired })).isRequired,
  };

  return (
    <div className="recommend-page-container">
      <div className="song-filter-bar-container">
        <button className="filter-button" onClick={() => setIsFilterModalOpen(true)}>필터</button>
        <SongFilterBar filterHighQuality={filterHighQuality} setFilterHighQuality={setFilterHighQuality} />
        {/* 오른쪽 FilterButtons 삭제 */}
      </div>
      <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} onApply={handleGenreFilterApply} availableGenres={genres} />

      {/* 0. 추천 테마 플레이리스트 */}
      <PlaylistDrawer
        title="추천 테마 플레이리스트"
        sectionType="featuredPlaylists"
        initialData={filterSectionData(featuredPlaylists, hotNewFilter, 'featuredPlaylists')}
        filterButtons={<FilterButtons currentFilter={hotNewFilter} onFilterChange={handleHotNewFilterChange} filters={HOT_NEW_FILTERS} className="hidden" />}
        onPlayTheme={handlePlayTheme}
        cardType="album"
      />

      {/* 1. 오늘 발매 음악 */}
      <PlaylistDrawer
        title="오늘 발매 음악"
        sectionType="todayAlbums"
        initialData={filterSectionData(todayAlbums, hotNewFilter, 'todayAlbums')}
        filterButtons={null}
        onPlayTheme={handlePlayTheme}
        cardType="album"
      />

      {/* 2. HOT & NEW */}
      <PlaylistDrawer
        title="HOT & NEW"
        sectionType="hotNewSongs"
        initialData={filterSectionData(hotNewSongs, hotNewFilter, 'hotNewSongs')}
        filterButtons={<FilterButtons currentFilter={hotNewFilter} onFilterChange={handleHotNewFilterChange} filters={HOT_NEW_FILTERS} />}
        onPlayTheme={handlePlayTheme}
        cardType="album"
      />

      {/* 3. 장르 */}
      <PlaylistDrawer
        title="장르"
        sectionType="genres"
        initialData={filterSectionData(genres, hotNewFilter, 'genres')}
        filterButtons={null}
        onPlayTheme={null}
        cardType="genre"
      />

      {/* 4. 인기 아티스트 */}
      <PlaylistDrawer
        title="인기 아티스트"
        sectionType="popularArtists"
        initialData={filterSectionData(popularArtists, popularArtistsFilter, 'popularArtists')}
        filterButtons={<FilterButtons currentFilter={popularArtistsFilter} onFilterChange={handlePopularArtistsFilterChange} filters={POPULAR_ARTIST_FILTERS} />}
        onPlayTheme={null}
        cardType="artist"
      />
    </div>
  );
};

export default RecommendPage;