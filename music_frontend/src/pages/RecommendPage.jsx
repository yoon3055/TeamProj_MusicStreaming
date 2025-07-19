
// src/pages/RecommendPage.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import SongFilterBar from '../component/SongFilterBar';
import Pagination from '../component/Pagination';
import FilterButtons from '../component/FilterButtons';
import Albumcard from '../component/Albumcard';
import PlaylistDrawer from '../component/PlaylistDrawer';

import { MusicPlayerContext } from '../context/MusicPlayerContext';

import '../styles/RecommendPage.css';

// 장르 카드 컴포넌트
const GenreCard = ({ genre }) => {
  return (
    <Link
      to={`/genres/${genre.id}`}
      className="genre-card"
    >
      <img
        src={genre.imageUrl || '/images/K-052.jpg'}
        alt={genre.name}
        className="genre-card-image"
      />
      <div className="genre-card-overlay">
        <h3 className="genre-card-title">{genre.name}</h3>
      </div>
    </Link>
  );
};
GenreCard.propTypes = {
  genre: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
  }).isRequired,
};

// 아티스트 카드 컴포넌트
const ArtistCard = ({ artist }) => {
  return (
    <Link
      to={`/artist/${artist.id}`}
      className="artist-card"
    >
      <img
        src={artist.profileImageUrl || '/images/K-052.jpg'}
        alt={artist.name}
        className="artist-card-image"
      />
      <h3 className="artist-card-name">{artist.name}</h3>
      {artist.genre && <p className="artist-card-genre">{artist.genre}</p>}
    </Link>
  );
};
ArtistCard.propTypes = {
  artist: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    profileImageUrl: PropTypes.string,
    genre: PropTypes.string,
  }).isRequired,
};

// 필터 모달 컴포넌트
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
        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="filter-select"
        >
          <option value="">모든 장르</option>
          {availableGenres.map((genre) => (
            <option key={genre.id} value={genre.name}>{genre.name}</option>
          ))}
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
  availableGenres: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
};

// 로컬 이미지 경로 배열 및 이미지 인덱스 관리
const LOCAL_IMAGE_PATHS = [
  '/images/K-052.jpg',
  '/images/K-053.jpg',
  '/images/K-054.jpg',
  '/images/K-055.jpg',
  '/images/K-056.jpg',
  '/images/K-057.jpg',
];
let imageIndex = 0;

const getNextLocalImage = () => {
  const path = LOCAL_IMAGE_PATHS[imageIndex % LOCAL_IMAGE_PATHS.length];
  imageIndex++;
  return path;
};

// 더미 데이터
const DUMMY_ALBUMS = [
  { id: 'da1', title: '봄날의 멜로디', artist: '플로이', coverUrl: getNextLocalImage(), songCount: 10, updatedAt: '2024.07.10', genre: '발라드' },
  { id: 'da2', title: '어느 맑은 날', artist: '클로버', coverUrl: getNextLocalImage(), songCount: 12, updatedAt: '2024.07.08', genre: '댄스' },
  { id: 'da3', title: '향기로운 기억', artist: '레몬트리', coverUrl: getNextLocalImage(), songCount: 8, updatedAt: '2024.07.05', genre: '힙합' },
  { id: 'da4', title: '새벽 감성 재즈', artist: '재즈캣', coverUrl: getNextLocalImage(), songCount: 15, updatedAt: '2024.07.12', genre: '재즈' },
  { id: 'da5', title: '도시의 불빛', artist: '나이트시티', coverUrl: getNextLocalImage(), songCount: 9, updatedAt: '2024.07.01', genre: 'R&B' },
  { id: 'da6', title: '별이 빛나는 밤', artist: '우주소녀', coverUrl: getNextLocalImage(), songCount: 11, updatedAt: '2024.06.28', genre: '인디' },
  { id: 'da7', title: '나른한 오후', artist: '티타임즈', coverUrl: getNextLocalImage(), songCount: 13, updatedAt: '2024.07.03', genre: '발라드' },
  { id: 'da8', title: '기억 속 여름', artist: '써머블루', coverUrl: getNextLocalImage(), songCount: 10, updatedAt: '2024.07.09', genre: '댄스' },
];

const DUMMY_SONGS = [
  { id: 'ds1', title: '환상속의 그대', artist: '플로아', coverUrl: getNextLocalImage(), isHighQuality: true, songCount: 1, updatedAt: '2024.07.10', genre: '발라드' },
  { id: 'ds2', title: '고요한 숲', artist: '멜로디온', coverUrl: getNextLocalImage(), isHighQuality: false, songCount: 1, updatedAt: '2024.07.08', genre: '댄스' },
  { id: 'ds3', title: '비밀 정원', artist: '에코', coverUrl: getNextLocalImage(), isHighQuality: true, songCount: 1, updatedAt: '2024.07.05', genre: '힙합' },
  { id: 'ds4', title: '어둠을 걷고', artist: '스타라이트', coverUrl: getNextLocalImage(), isHighQuality: false, songCount: 1, updatedAt: '2024.07.12', genre: '재즈' },
  { id: 'ds5', title: '새로운 시작', artist: '브리즈', coverUrl: getNextLocalImage(), isHighQuality: true, songCount: 1, updatedAt: '2024.07.01', genre: 'R&B' },
  { id: 'ds6', title: '푸른 하늘', artist: '윈드보이', coverUrl: getNextLocalImage(), isHighQuality: false, songCount: 1, updatedAt: '2024.07.03', genre: '인디' },
];

const DUMMY_GENRES = [
  { id: 'dg1', name: '발라드', imageUrl: getNextLocalImage() },
  { id: 'dg2', name: '댄스', imageUrl: getNextLocalImage() },
  { id: 'dg3', name: '힙합', imageUrl: getNextLocalImage() },
  { id: 'dg4', name: 'R&B', imageUrl: getNextLocalImage() },
  { id: 'dg5', name: '재즈', imageUrl: getNextLocalImage() },
  { id: 'dg6', name: '인디', imageUrl: getNextLocalImage() },
];

const DUMMY_ARTISTS = [
  { id: 'da_a1', name: '별빛가수', profileImageUrl: getNextLocalImage(), genre: '발라드' },
  { id: 'da_a2', name: '댄스신', profileImageUrl: getNextLocalImage(), genre: '댄스' },
  { id: 'da_a3', name: '힙통령', profileImageUrl: getNextLocalImage(), genre: '힙합' },
  { id: 'da_a4', name: '소울보컬', profileImageUrl: getNextLocalImage(), genre: 'R&B' },
  { id: 'da_a5', name: '재즈퀸', profileImageUrl: getNextLocalImage(), genre: '재즈' },
  { id: 'da_a6', name: '포크맨', profileImageUrl: getNextLocalImage(), genre: '인디' },
];

const DUMMY_FEATURED_PLAYLISTS = [
  { id: 'fp1', title: 'FLO 추천! 힐링 음악', coverUrl: getNextLocalImage(), artist: 'Various Artists', songCount: 20, updatedAt: '2024.07.10', genre: '발라드' },
  { id: 'fp2', title: '오늘 당신의 집중력 UP', coverUrl: getNextLocalImage(), artist: 'Study Beats', songCount: 25, updatedAt: '2024.07.08', genre: '댄스' },
  { id: 'fp3', title: '퇴근길 위로가 필요한 순간', coverUrl: getNextLocalImage(), artist: 'Comfort Tunes', songCount: 18, updatedAt: '2024.07.05', genre: '힙합' },
  { id: 'fp4', title: '잠들기 전 편안한 음악', coverUrl: getNextLocalImage(), artist: 'Sleepy Vibes', songCount: 15, updatedAt: '2024.07.12', genre: '재즈' },
  { id: 'fp5', title: '신나는 드라이브 필수 플레이리스트', coverUrl: getNextLocalImage(), artist: 'Drive Hits', songCount: 22, updatedAt: '2024.07.01', genre: 'R&B' },
  { id: 'fp6', title: '기분 전환! 밝고 경쾌한 팝송', coverUrl: getNextLocalImage(), artist: 'Pop Stars', songCount: 30, updatedAt: '2024.07.03', genre: '인디' },
];

const ITEMS_PER_PAGE = 12;
const HOT_NEW_FILTERS = [
  { label: '종합', value: 'all' },
  { label: '국내', value: 'domestic' },
  { label: '해외', value: 'international' },
];
const POPULAR_ARTIST_FILTERS = HOT_NEW_FILTERS;

const RecommendPage = () => {
  const { playSong } = useContext(MusicPlayerContext);

  const [filterHighQuality, setFilterHighQuality] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [genreFilter, setGenreFilter] = useState('');

  // 상태 관리
  const [todayAlbums, setTodayAlbums] = useState([]);
  const [todayAlbumsLoading, setTodayAlbumsLoading] = useState(false);
  const [todayAlbumsError, setTodayAlbumsError] = useState(null);
  const [todayAlbumsCurrentPage, setTodayAlbumsCurrentPage] = useState(1);
  const [todayAlbumsTotal, setTodayAlbumsTotal] = useState(DUMMY_ALBUMS.length);

  const [hotNewSongs, setHotNewSongs] = useState([]);
  const [hotNewLoading, setHotNewLoading] = useState(false);
  const [hotNewError, setHotNewError] = useState(null);
  const [hotNewCurrentPage, setHotNewCurrentPage] = useState(1);
  const [hotNewTotal, setHotNewTotal] = useState(DUMMY_SONGS.length);
  const [hotNewFilter, setHotNewFilter] = useState('all');

  const [genres, setGenres] = useState([]);
  const [genresLoading, setGenresLoading] = useState(false);
  const [genresError, setGenresError] = useState(null);

  const [popularArtists, setPopularArtists] = useState([]);
  const [popularArtistsLoading, setPopularArtistsLoading] = useState(false);
  const [popularArtistsError, setPopularArtistsError] = useState(null);
  const [popularArtistsCurrentPage, setPopularArtistsCurrentPage] = useState(1);
  const [popularArtistsTotal, setPopularArtistsTotal] = useState(DUMMY_ARTISTS.length);
  const [popularArtistsFilter, setPopularArtistsFilter] = useState('all');

  const [featuredPlaylists, setFeaturedPlaylists] = useState([]);
  const [featuredPlaylistsCurrentPage, setFeaturedPlaylistsCurrentPage] = useState(1);
  const [featuredPlaylistsTotal, setFeaturedPlaylistsTotal] = useState(DUMMY_FEATURED_PLAYLISTS.length);

  // 데이터 페칭 함수
  const fetchTodayAlbums = useCallback(async () => {
    setTodayAlbumsLoading(true);
    setTodayAlbumsError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      let filteredAlbums = DUMMY_ALBUMS;
      if (genreFilter) {
        filteredAlbums = DUMMY_ALBUMS.filter(album => album.genre === genreFilter);
      }
      const startIdx = (todayAlbumsCurrentPage - 1) * ITEMS_PER_PAGE;
      const endIdx = startIdx + ITEMS_PER_PAGE;
      setTodayAlbums(filteredAlbums.slice(startIdx, endIdx));
      setTodayAlbumsTotal(filteredAlbums.length);
    } catch (err) {
      console.error('🌐 오늘 발매 앨범 가져오기 실패:', err);
      setTodayAlbumsError('오늘 발매 앨범을 불러오는 데 실패했습니다.');
      setTodayAlbums([]);
    } finally {
      setTodayAlbumsLoading(false);
    }
  }, [todayAlbumsCurrentPage, genreFilter]);

  const fetchHotNewSongs = useCallback(async () => {
    setHotNewLoading(true);
    setHotNewError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      let filteredSongs = DUMMY_SONGS;
      if (hotNewFilter !== 'all') {
        filteredSongs = DUMMY_SONGS.filter(song =>
          (hotNewFilter === 'domestic' && song.artist.includes('플로')) ||
          (hotNewFilter === 'international' && !song.artist.includes('플로'))
        );
      }
      if (filterHighQuality) {
        filteredSongs = filteredSongs.filter(song => song.isHighQuality);
      }
      if (genreFilter) {
        filteredSongs = filteredSongs.filter(song => song.genre === genreFilter);
      }
      const startIdx = (hotNewCurrentPage - 1) * ITEMS_PER_PAGE;
      const endIdx = startIdx + ITEMS_PER_PAGE;
      setHotNewSongs(filteredSongs.slice(startIdx, endIdx));
      setHotNewTotal(filteredSongs.length);
    } catch (err) {
      console.error('🌐 HOT & NEW 곡 가져오기 실패:', err);
      setHotNewError('HOT & NEW 곡을 불러오는 데 실패했습니다.');
      setHotNewSongs([]);
    } finally {
      setHotNewLoading(false);
    }
  }, [hotNewCurrentPage, hotNewFilter, filterHighQuality, genreFilter]);

  const fetchGenres = useCallback(async () => {
    setGenresLoading(true);
    setGenresError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setGenres(DUMMY_GENRES);
    } catch (err) {
      console.error('🌐 장르 가져오기 실패:', err);
      setGenresError('장르를 불러오는 데 실패했습니다.');
      setGenres([]);
    } finally {
      setGenresLoading(false);
    }
  }, []);

  const fetchPopularArtists = useCallback(async () => {
    setPopularArtistsLoading(true);
    setPopularArtistsError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      let filteredArtists = DUMMY_ARTISTS;
      if (popularArtistsFilter !== 'all') {
        filteredArtists = DUMMY_ARTISTS.filter(artist =>
          (popularArtistsFilter === 'domestic' && artist.name.includes('가수')) ||
          (popularArtistsFilter === 'international' && !artist.name.includes('가수'))
        );
      }
      if (genreFilter) {
        filteredArtists = filteredArtists.filter(artist => artist.genre === genreFilter);
      }
      const startIdx = (popularArtistsCurrentPage - 1) * ITEMS_PER_PAGE;
      const endIdx = startIdx + ITEMS_PER_PAGE;
      setPopularArtists(filteredArtists.slice(startIdx, endIdx));
      setPopularArtistsTotal(filteredArtists.length);
    } catch (err) {
      console.error('🌐 인기 아티스트 가져오기 실패:', err);
      setPopularArtistsError('인기 아티스트를 불러오는 데 실패했습니다.');
      setPopularArtists([]);
    } finally {
      setPopularArtistsLoading(false);
    }
  }, [popularArtistsCurrentPage, popularArtistsFilter, genreFilter]);

  const fetchFeaturedPlaylists = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      let filteredPlaylists = DUMMY_FEATURED_PLAYLISTS;
      if (genreFilter) {
        filteredPlaylists = DUMMY_FEATURED_PLAYLISTS.filter(playlist => playlist.genre === genreFilter);
      }
      const startIdx = (featuredPlaylistsCurrentPage - 1) * ITEMS_PER_PAGE;
      const endIdx = startIdx + ITEMS_PER_PAGE;
      setFeaturedPlaylists(filteredPlaylists.slice(startIdx, endIdx));
      setFeaturedPlaylistsTotal(filteredPlaylists.length);
    } catch (err) {
      console.error('🌐 추천 플레이리스트 가져오기 실패:', err);
      setFeaturedPlaylists([]);
    }
  }, [featuredPlaylistsCurrentPage, genreFilter]);

  // useEffect 호출
  useEffect(() => { fetchTodayAlbums(); }, [fetchTodayAlbums]);
  useEffect(() => { fetchHotNewSongs(); }, [fetchHotNewSongs]);
  useEffect(() => { fetchGenres(); }, [fetchGenres]);
  useEffect(() => { fetchPopularArtists(); }, [fetchPopularArtists]);
  useEffect(() => { fetchFeaturedPlaylists(); }, [fetchFeaturedPlaylists]);

  // 페이지네이션 및 필터 핸들러
  const handleHotNewFilterChange = (filterValue) => {
    setHotNewFilter(filterValue);
    setHotNewCurrentPage(1);
  };
  const handlePopularArtistsFilterChange = (filterValue) => {
    setPopularArtistsFilter(filterValue);
    setPopularArtistsCurrentPage(1);
  };
  const handleGenreFilterApply = (genre) => {
    setGenreFilter(genre);
    setTodayAlbumsCurrentPage(1);
    setHotNewCurrentPage(1);
    setPopularArtistsCurrentPage(1);
    setFeaturedPlaylistsCurrentPage(1);
  };

  // MusicPlayerContext의 playSong 함수
  const handlePlayTheme = (playlistItem) => {
    const songToPlay = {
      id: playlistItem.id,
      title: playlistItem.title,
      artist: playlistItem.artist || 'Various Artists',
      coverUrl: playlistItem.coverUrl,
    };
    playSong(songToPlay);
    alert(`${songToPlay.title} - ${songToPlay.artist} 재생 시작!`);
  };

  // 총 페이지 수 계산
  const todayAlbumsTotalPages = Math.ceil(todayAlbumsTotal / ITEMS_PER_PAGE);
  const hotNewTotalPages = Math.ceil(hotNewTotal / ITEMS_PER_PAGE);
  const popularArtistsTotalPages = Math.ceil(popularArtistsTotal / ITEMS_PER_PAGE);
  const featuredPlaylistsTotalPages = Math.ceil(featuredPlaylistsTotal / ITEMS_PER_PAGE);

  // hotNewSongs 데이터를 PlaylistDrawer의 initialPlaylists 형식에 맞게 변환
  const hotNewPlaylistsForDrawer = hotNewSongs.map(song => ({
    id: song.id,
    title: song.title,
    coverUrl: song.coverUrl,
    artist: song.artist,
    songCount: song.songCount,
    updatedAt: song.updatedAt,
  }));

  return (
    <div className="recommend-page-container">
      <div className="song-filter-bar-container">
        <button
          className="filter-button"
          onClick={() => setIsFilterModalOpen(true)}
        >
          필터
        </button>
        <SongFilterBar
          filterHighQuality={filterHighQuality}
          setFilterHighQuality={setFilterHighQuality}
        />
      </div>
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleGenreFilterApply}
        availableGenres={DUMMY_GENRES}
      />

      {/* 0. 최상단 Featured PlaylistDrawer 섹션 */}
      <section className="recommend-section featured-playlist-section">
        <h2 className="section-title">추천 테마 플레이리스트</h2>
        <PlaylistDrawer
          title=""
          initialPlaylists={featuredPlaylists}
          onPlayTheme={handlePlayTheme}
          filterButtons={
            <FilterButtons
              currentFilter={hotNewFilter}
              onFilterChange={handleHotNewFilterChange}
              filters={HOT_NEW_FILTERS}
            />
          }
        />
        {featuredPlaylistsTotalPages > 1 && (
          <Pagination
            currentPage={featuredPlaylistsCurrentPage}
            totalPages={featuredPlaylistsTotalPages}
            onPageChange={setFeaturedPlaylistsCurrentPage}
          />
        )}
      </section>

      {/* 1. 오늘 발매 음악 섹션 */}
      <section className="recommend-section">
        <h2 className="section-title">
          오늘 발매 음악
        </h2>
        {todayAlbumsLoading ? (
          <div className="recommend-loading-message">불러오는 중...</div>
        ) : todayAlbumsError ? (
          <div className="recommend-error-message">{todayAlbumsError}</div>
        ) : (
          <>
            <div className="card-carousel">
              {todayAlbums.length === 0 ? (
                <p className="recommend-empty-message">발매된 앨범이 없습니다.</p>
              ) : (
                todayAlbums.map((album) => (
                  <Albumcard key={album.id} album={album} size="md" />
                ))
              )}
            </div>
            {todayAlbumsTotalPages > 1 && (
              <Pagination
                currentPage={todayAlbumsCurrentPage}
                totalPages={todayAlbumsTotalPages}
                onPageChange={setTodayAlbumsCurrentPage}
              />
            )}
          </>
        )}
      </section>

      {/* 2. HOT & NEW 섹션 */}
      <section className="recommend-section">
        <h2 className="section-title">
          HOT & NEW
        </h2>
        {hotNewLoading ? (
          <div className="recommend-loading-message">불러오는 중...</div>
        ) : hotNewError ? (
          <div className="recommend-error-message">{hotNewError}</div>
        ) : (
          <PlaylistDrawer
            title=""
            initialPlaylists={hotNewPlaylistsForDrawer}
            onPlayTheme={handlePlayTheme}
            filterButtons={
              <FilterButtons
                currentFilter={hotNewFilter}
                onFilterChange={handleHotNewFilterChange}
                filters={HOT_NEW_FILTERS}
              />
            }
          />
        )}
        {hotNewTotalPages > 1 && (
          <Pagination
            currentPage={hotNewCurrentPage}
            totalPages={hotNewTotalPages}
            onPageChange={setHotNewCurrentPage}
          />
        )}
      </section>

      {/* 3. 장르 섹션 */}
      <section className="recommend-section">
        <h2 className="section-title">
          장르
        </h2>
        {genresLoading ? (
          <div className="recommend-loading-message">불러오는 중...</div>
        ) : genresError ? (
          <div className="recommend-error-message">{genresError}</div>
        ) : (
          <div className="card-carousel genres-container">
            {genres.length === 0 ? (
              <p className="recommend-empty-message">장르가 없습니다.</p>
            ) : (
              genres.map((genre) => (
                <GenreCard key={genre.id} genre={genre} />
              ))
            )}
          </div>
        )}
      </section>

      {/* 4. 인기 아티스트 섹션 */}
      <section className="recommend-section">
        <h2 className="section-title">
          인기 아티스트
        </h2>
        <div className="controls-container">
          <FilterButtons currentFilter={popularArtistsFilter} onFilterChange={handlePopularArtistsFilterChange} filters={POPULAR_ARTIST_FILTERS} />
        </div>
        {popularArtistsLoading ? (
          <div className="recommend-loading-message">불러오는 중...</div>
        ) : popularArtistsError ? (
          <div className="recommend-error-message">{popularArtistsError}</div>
        ) : (
          <>
            <div className="card-carousel artists-grid-container">
              {popularArtists.length === 0 ? (
                <p className="recommend-empty-message">인기 아티스트가 없습니다.</p>
              ) : (
                popularArtists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))
              )}
            </div>
            {popularArtistsTotalPages > 1 && (
              <Pagination
                currentPage={popularArtistsCurrentPage}
                totalPages={popularArtistsTotalPages}
                onPageChange={setPopularArtistsCurrentPage}
              />
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default RecommendPage;
