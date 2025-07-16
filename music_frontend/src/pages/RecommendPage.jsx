import React, { useState, useEffect, useContext, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import axios from 'axios';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import SongFilterBar from '../component/SongFilterBar';
import Pagination from '../component/Pagination';
import FilterButtons from '../component/FilterButtons';
import AlbumCard from '../component/Albumcard';
import InteractiveSongCard from '../component/InteractiveSongCard';
import { MusicPlayerContext } from '../context/MusicPlayerContext';

import '../styles/RecommendPage.css';

// --- 내부 컴포넌트 정의 ---
// 장르 카드 컴포넌트
const GenreCard = ({ genre }) => {
  return (
    <Link
      to={`/genres/${genre.id}`}
      className="genre-card"
    >
      <img
        src={genre.imageUrl || '/images/K-52.jpg'} // ✨ 로컬 이미지 폴백
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
        src={artist.profileImageUrl || '/images/K-52.jpg'} // ✨ 로컬 이미지 폴백
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
// --- 내부 컴포넌트 정의 끝 ---


// ✨ 로컬 이미지 경로 배열 및 이미지 인덱스 관리 (중복 사용)
const LOCAL_IMAGE_PATHS = [
  '/images/K-52.jpg',
  '/images/K-53.jpg',
  '/images/K-54.jpg',
  '/images/K-55.jpg',
];
let imageIndex = 0; // 컴포넌트 외부에서 관리하여 계속 순환하도록 함

const getNextLocalImage = () => {
  const path = LOCAL_IMAGE_PATHS[imageIndex % LOCAL_IMAGE_PATHS.length];
  imageIndex++;
  return path;
};

// --- 더미 데이터 (디자인 확인용, 실제 API 대체) ---
const DUMMY_ALBUMS = [
  { id: 'da1', title: '봄날의 멜로디', artist: '플로이', coverUrl: getNextLocalImage() },
  { id: 'da2', title: '어느 맑은 날', artist: '클로버', coverUrl: getNextLocalImage() },
  { id: 'da3', title: '향기로운 기억', artist: '레몬트리', coverUrl: getNextLocalImage() },
  { id: 'da4', title: '새벽 감성 재즈', artist: '재즈캣', coverUrl: getNextLocalImage() },
  { id: 'da5', title: '도시의 불빛', artist: '나이트시티', coverUrl: getNextLocalImage() },
  { id: 'da6', title: '별이 빛나는 밤', artist: '우주소녀', coverUrl: getNextLocalImage() },
  { id: 'da7', title: '나른한 오후', artist: '티타임즈', coverUrl: getNextLocalImage() },
  { id: 'da8', title: '기억 속 여름', artist: '써머블루', coverUrl: getNextLocalImage() },
];

const DUMMY_SONGS = [
  { id: 'ds1', title: '환상속의 그대', artist: '플로아', coverUrl: getNextLocalImage(), isHighQuality: true },
  { id: 'ds2', title: '고요한 숲', artist: '멜로디온', coverUrl: getNextLocalImage(), isHighQuality: false },
  { id: 'ds3', title: '비밀 정원', artist: '에코', coverUrl: getNextLocalImage(), isHighQuality: true },
  { id: 'ds4', title: '어둠을 걷고', artist: '스타라이트', coverUrl: getNextLocalImage(), isHighQuality: false },
  { id: 'ds5', title: '새로운 시작', artist: '브리즈', coverUrl: getNextLocalImage(), isHighQuality: true },
  { id: 'ds6', title: '푸른 하늘', artist: '윈드보이', coverUrl: getNextLocalImage(), isHighQuality: false },
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
// --- 더미 데이터 끝 ---


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


  // --- 데이터 페칭 로직 (useCallback으로 함수 안정화) ---

  // 🌐 오늘 발매 음악 페칭 (더미 데이터 사용, 실제 API 호출은 주석 처리)
  const fetchTodayAlbums = useCallback(async () => {
    setTodayAlbumsLoading(true);
    setTodayAlbumsError(null);
    try {
      // 🌐 API 호출 (주석 처리됨, 디자인 확인용)
      // const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/albums/latest`, {
      //   params: { page: todayAlbumsCurrentPage, limit: ITEMS_PER_PAGE },
      // });
      // setTodayAlbums(res.data.albums); // 🌐 백엔드 응답 구조: { albums: [...], total: N }
      // setTodayAlbumsTotal(res.data.total);

      // ✨ 더미 데이터 사용 (디자인 확인용)
      await new Promise(resolve => setTimeout(resolve, 300));
      const startIdx = (todayAlbumsCurrentPage - 1) * ITEMS_PER_PAGE;
      const endIdx = startIdx + ITEMS_PER_PAGE;
      setTodayAlbums(DUMMY_ALBUMS.slice(startIdx, endIdx));
      setTodayAlbumsTotal(DUMMY_ALBUMS.length);

    } catch (err) {
      console.error('🌐 오늘 발매 앨범 가져오기 실패:', err);
      setTodayAlbumsError('오늘 발매 앨범을 불러오는 데 실패했습니다.');
      setTodayAlbums([]);
    } finally {
      setTodayAlbumsLoading(false);
    }
  }, [todayAlbumsCurrentPage]);

  // 🌐 HOT & NEW 곡 페칭 (더미 데이터 사용, 실제 API 호출은 주석 처리)
  const fetchHotNewSongs = useCallback(async () => {
    setHotNewLoading(true);
    setHotNewError(null);
    try {
      // 🌐 API 호출 (주석 처리됨, 디자인 확인용)
      // const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/songs/hot-new`, {
      //   params: {
      //     page: hotNewCurrentPage,
      //     limit: ITEMS_PER_PAGE,
      //     filter: hotNewFilter,
      //     highQuality: filterHighQuality,
      //   },
      // });
      // setHotNewSongs(res.data.songs); // 🌐 백엔드 응답 구조: { songs: [...], total: N }
      // setHotNewTotal(res.data.total);

      // ✨ 더미 데이터 사용 (디자인 확인용)
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
  }, [hotNewCurrentPage, hotNewFilter, filterHighQuality]);

  // 🌐 장르 페칭 (더미 데이터 사용, 실제 API 호출은 주석 처리)
  const fetchGenres = useCallback(async () => {
    setGenresLoading(true);
    setGenresError(null);
    try {
      // 🌐 API 호출 (주석 처리됨, 디자인 확인용)
      // const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/genres`);
      // setGenres(res.data);

      // ✨ 더미 데이터 사용 (디자인 확인용)
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

  // 🌐 인기 아티스트 페칭 (더미 데이터 사용, 실제 API 호출은 주석 처리)
  const fetchPopularArtists = useCallback(async () => {
    setPopularArtistsLoading(true);
    setPopularArtistsError(null);
    try {
      // 🌐 API 호출 (주석 처리됨, 디자인 확인용)
      // const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/artists/popular`, {
      //   params: {
      //     page: popularArtistsCurrentPage,
      //     limit: ITEMS_PER_PAGE,
      //     filter: popularArtistsFilter,
      //   },
      // });
      // setPopularArtists(res.data.artists); // 🌐 백엔드 응답 구조: { artists: [...], total: N }
      // setPopularArtistsTotal(res.data.total);

      // ✨ 더미 데이터 사용 (디자인 확인용)
      await new Promise(resolve => setTimeout(resolve, 300));
      let filteredArtists = DUMMY_ARTISTS;
      if (popularArtistsFilter !== 'all') {
        filteredArtists = DUMMY_ARTISTS.filter(artist =>
          (popularArtistsFilter === 'domestic' && artist.name.includes('가수')) ||
          (popularArtistsFilter === 'international' && !artist.name.includes('가수'))
        );
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
  }, [popularArtistsCurrentPage, popularArtistsFilter]);


  // --- useEffect 호출 (각 페칭 함수가 변경될 때 실행) ---
  useEffect(() => { fetchTodayAlbums(); }, [fetchTodayAlbums]);
  useEffect(() => { fetchHotNewSongs(); }, [fetchHotNewSongs]);
  useEffect(() => { fetchGenres(); }, [fetchGenres]);
  useEffect(() => { fetchPopularArtists(); }, [fetchPopularArtists]);


  // --- 페이지네이션 및 필터 핸들러 ---
  const handleHotNewFilterChange = (filterValue) => {
    setHotNewFilter(filterValue);
    setHotNewCurrentPage(1);
  };
  const handlePopularArtistsFilterChange = (filterValue) => {
    setPopularArtistsFilter(filterValue);
    setPopularArtistsCurrentPage(1);
  };


  // --- 총 페이지 수 계산 ---
  const todayAlbumsTotalPages = Math.ceil(todayAlbumsTotal / ITEMS_PER_PAGE);
  const hotNewTotalPages = Math.ceil(hotNewTotal / ITEMS_PER_PAGE);
  const popularArtistsTotalPages = Math.ceil(popularArtistsTotal / ITEMS_PER_PAGE);


  return (
    <div className="recommend-page-container">
      <SongFilterBar
        filterHighQuality={filterHighQuality}
        setFilterHighQuality={setFilterHighQuality}
      />

      {/* 1. 오늘 발매 음악 섹션 */}
      <section className="recommend-section">
        <h2 className="recommend-section-title">오늘 발매 음악</h2>
        {todayAlbumsLoading ? (
          <div className="recommend-loading-message">불러오는 중...</div>
        ) : todayAlbumsError ? (
          <div className="recommend-error-message">{todayAlbumsError}</div>
        ) : (
          <div className="recommend-grid">
            {todayAlbums.length === 0 ? (
              <p className="recommend-empty-message">발매된 앨범이 없습니다.</p>
            ) : (
              todayAlbums.map((album) => (
                <AlbumCard key={album.id} album={album} size="md" />
              ))
            )}
          </div>
        )}
        {todayAlbumsTotalPages > 1 && (
          <Pagination
            currentPage={todayAlbumsCurrentPage}
            totalPages={todayAlbumsTotalPages}
            onPageChange={setTodayAlbumsCurrentPage}
          />
        )}
      </section>

      {/* 2. HOT & NEW 섹션 */}
      <section className="recommend-section">
        <h2 className="recommend-section-title">HOT & NEW</h2>
        <FilterButtons currentFilter={hotNewFilter} onFilterChange={handleHotNewFilterChange} filters={HOT_NEW_FILTERS} />
        {hotNewLoading ? (
          <div className="recommend-loading-message">불러오는 중...</div>
        ) : hotNewError ? (
          <div className="recommend-error-message">{hotNewError}</div>
        ) : (
          <div className="recommend-grid">
            {hotNewSongs.length === 0 ? (
              <p className="recommend-empty-message">HOT & NEW 곡이 없습니다.</p>
            ) : (
              hotNewSongs.map((song) => (
                <InteractiveSongCard key={song.id} song={song} onPlay={playSong} />
              ))
            )}
          </div>
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
        <h2 className="recommend-section-title">장르</h2>
        {genresLoading ? (
          <div className="recommend-loading-message">불러오는 중...</div>
        ) : genresError ? (
          <div className="recommend-error-message">{genresError}</div>
        ) : (
          <div className="recommend-grid">
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
        <h2 className="recommend-section-title">인기 아티스트</h2>
        <FilterButtons currentFilter={popularArtistsFilter} onFilterChange={handlePopularArtistsFilterChange} filters={POPULAR_ARTIST_FILTERS} />
        {popularArtistsLoading ? (
          <div className="recommend-loading-message">불러오는 중...</div>
        ) : popularArtistsError ? (
          <div className="recommend-error-message">{popularArtistsError}</div>
        ) : (
          <div className="recommend-grid">
            {popularArtists.length === 0 ? (
              <p className="recommend-empty-message">인기 아티스트가 없습니다.</p>
            ) : (
              popularArtists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))
            )}
          </div>
        )}
        {popularArtistsTotalPages > 1 && (
          <Pagination
            currentPage={popularArtistsCurrentPage}
            totalPages={popularArtistsTotalPages}
            onPageChange={setPopularArtistsCurrentPage}
          />
        )}
      </section>
    </div>
  );
};

export default RecommendPage;