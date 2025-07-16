import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios'; // 🌐 백엔드 통신을 위한 axios 임포트
import { Link } from 'react-router-dom'; // 장르, 아티스트 링크용
import PropTypes from 'prop-types'; // PropTypes 사용을 위해 임포트

import SongFilterBar from '../component/SongFilterBar'; // 고음질 필터 바
import Pagination from '../component/Pagination'; // 페이지네이션
import FilterButtons from '../component/FilterButtons'; // 국내/해외/종합 필터 버튼
import AlbumCard from '../component/Albumcard'; // 앨범 카드
import InteractiveSongCard from '../component/InteractiveSongCard'; // 인터랙티브 송 카드
import { MusicPlayerContext } from '../context/MusicPlayerContext'; // 음악 재생 Context

// --- 내부 컴포넌트 정의 ---
// 장르 카드 컴포넌트 (RecommendPage 내에서만 사용될 수 있는 작은 컴포넌트)
const GenreCard = ({ genre }) => {
  return (
    <Link
      to={`/genres/${genre.id}`} // 🌐 장르 상세 페이지 링크 (백엔드에서 장르 ID를 통해 상세 정보 제공)
      className="
        flex flex-col items-center justify-center p-4 rounded-lg bg-gray-800
        shadow-md hover:bg-gray-700 transition-colors duration-200
        cursor-pointer group relative overflow-hidden h-40 w-40 text-center
      "
    >
      <img
        src={genre.imageUrl || 'https://via.placeholder.com/150/333333/FFFFFF?text=Genre'}
        alt={genre.name}
        className="w-full h-full object-cover absolute inset-0 group-hover:scale-110 transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <h3 className="text-white text-lg font-semibold z-10">{genre.name}</h3>
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

// 아티스트 카드 컴포넌트 (RecommendPage 내에서만 사용될 수 있는 작은 컴포넌트)
const ArtistCard = ({ artist }) => {
  return (
    <Link
      to={`/artist/${artist.id}`} // 🌐 아티스트 상세 페이지 링크 (백엔드에서 아티스트 ID를 통해 상세 정보 제공)
      className="
        flex flex-col items-center p-4 rounded-lg bg-gray-800
        shadow-md hover:bg-gray-700 transition-colors duration-200
        cursor-pointer w-40 h-auto text-center
      "
    >
      <img
        src={artist.profileImageUrl || 'https://via.placeholder.com/100/333333/FFFFFF?text=Artist'}
        alt={artist.name}
        className="w-24 h-24 rounded-full object-cover mb-2"
      />
      <h3 className="text-white text-base font-semibold truncate w-full">{artist.name}</h3>
      {artist.genre && <p className="text-gray-400 text-xs truncate w-full">{artist.genre}</p>}
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


const ITEMS_PER_PAGE = 12; // 각 섹션의 페이지당 아이템 수
const HOT_NEW_FILTERS = [
  { label: '종합', value: 'all' },
  { label: '국내', value: 'domestic' },
  { label: '해외', value: 'international' },
];
const POPULAR_ARTIST_FILTERS = [
  { label: '종합', value: 'all' },
  { label: '국내', value: 'domestic' },
  { label: '해외', value: 'international' },
];


const RecommendPage = () => {
  // 🌐 MusicPlayerContext에서 음악 재생 함수를 가져옵니다.
  const { playSong } = useContext(MusicPlayerContext);

  // 1. 고음질 필터 상태 (SongFilterBar와 연동)
  const [filterHighQuality, setFilterHighQuality] = useState(false);

  // 2. 오늘 발매 음악 섹션 상태
  const [todayAlbums, setTodayAlbums] = useState([]);
  const [todayAlbumsLoading, setTodayAlbumsLoading] = useState(true);
  const [todayAlbumsError, setTodayAlbumsError] = useState(null);
  const [todayAlbumsCurrentPage, setTodayAlbumsCurrentPage] = useState(1);
  const [todayAlbumsTotal, setTodayAlbumsTotal] = useState(0); // 🌐 백엔드에서 받아올 총 아이템 수

  // 3. HOT & NEW 섹션 상태
  const [hotNewSongs, setHotNewSongs] = useState([]);
  const [hotNewLoading, setHotNewLoading] = useState(true);
  const [hotNewError, setHotNewError] = useState(null);
  const [hotNewCurrentPage, setHotNewCurrentPage] = useState(1);
  const [hotNewTotal, setHotNewTotal] = useState(0); // 🌐 백엔드에서 받아올 총 아이템 수
  const [hotNewFilter, setHotNewFilter] = useState('all'); // 국내/해외/종합 필터

  // 4. 장르 섹션 상태
  const [genres, setGenres] = useState([]);
  const [genresLoading, setGenresLoading] = useState(true);
  const [genresError, setGenresError] = useState(null);

  // 5. 인기 아티스트 섹션 상태
  const [popularArtists, setPopularArtists] = useState([]);
  const [popularArtistsLoading, setPopularArtistsLoading] = useState(true);
  const [popularArtistsError, setPopularArtistsError] = useState(null);
  const [popularArtistsCurrentPage, setPopularArtistsCurrentPage] = useState(1);
  const [popularArtistsTotal, setPopularArtistsTotal] = useState(0); // 🌐 백엔드에서 받아올 총 아이템 수
  const [popularArtistsFilter, setPopularArtistsFilter] = useState('all'); // 국내/해외/종합 필터


  // --- 데이터 페칭 로직 (useCallback으로 함수 안정화) ---

  // 🌐 오늘 발매 음악 페칭 (페이지네이션 적용)
  const fetchTodayAlbums = useCallback(async () => {
    setTodayAlbumsLoading(true);
    setTodayAlbumsError(null);
    try {
      // 🌐 백엔드 API 호출: 최신 발매 앨범 목록
      // 예시 엔드포인트: /api/albums/latest?page=1&limit=12
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/albums/latest`, {
        params: { page: todayAlbumsCurrentPage, limit: ITEMS_PER_PAGE },
      });
      setTodayAlbums(res.data.albums); // 🌐 백엔드 응답 구조: { albums: [...], total: N }
      setTodayAlbumsTotal(res.data.total);
    } catch (err) {
      console.error('🌐 오늘 발매 앨범 가져오기 실패:', err);
      setTodayAlbumsError('오늘 발매 앨범을 불러오는 데 실패했습니다.');
      setTodayAlbums([]);
    } finally {
      setTodayAlbumsLoading(false);
    }
  }, [todayAlbumsCurrentPage]); // 🌐 페이지 변경 시 다시 페칭

  // 🌐 HOT & NEW 곡 페칭 (페이지네이션 및 필터 적용)
  const fetchHotNewSongs = useCallback(async () => {
    setHotNewLoading(true);
    setHotNewError(null);
    try {
      // 🌐 백엔드 API 호출: HOT & NEW 곡 목록
      // 예시 엔드포인트: /api/songs/hot-new?page=1&limit=12&filter=all&highQuality=false
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/songs/hot-new`, {
        params: {
          page: hotNewCurrentPage,
          limit: ITEMS_PER_PAGE,
          filter: hotNewFilter, // 🌐 국내/해외/종합 필터 파라미터
          highQuality: filterHighQuality, // 🌐 고음질 필터 파라미터
        },
      });
      setHotNewSongs(res.data.songs); // 🌐 백엔드 응답 구조: { songs: [...], total: N }
      setHotNewTotal(res.data.total);
    } catch (err) {
      console.error('🌐 HOT & NEW 곡 가져오기 실패:', err);
      setHotNewError('HOT & NEW 곡을 불러오는 데 실패했습니다.');
      setHotNewSongs([]);
    } finally {
      setHotNewLoading(false);
    }
  }, [hotNewCurrentPage, hotNewFilter, filterHighQuality]); // 🌐 페이지, 필터, 고음질 필터 변경 시 다시 페칭

  // 🌐 장르 페칭 (페이지네이션 없음)
  const fetchGenres = useCallback(async () => {
    setGenresLoading(true);
    setGenresError(null);
    try {
      // 🌐 백엔드 API 호출: 모든 장르 목록
      // 예시 엔드포인트: /api/genres
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/genres`);
      setGenres(res.data);
    } catch (err) {
      console.error('🌐 장르 가져오기 실패:', err);
      setGenresError('장르를 불러오는 데 실패했습니다.');
      setGenres([]);
    } finally {
      setGenresLoading(false);
    }
  }, []); // 🌐 의존성 없음: 컴포넌트 마운트 시 한 번만 페칭

  // 🌐 인기 아티스트 페칭 (페이지네이션 및 필터 적용)
  const fetchPopularArtists = useCallback(async () => {
    setPopularArtistsLoading(true);
    setPopularArtistsError(null);
    try {
      // 🌐 백엔드 API 호출: 인기 아티스트 목록
      // 예시 엔드포인트: /api/artists/popular?page=1&limit=12&filter=all
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/artists/popular`, {
        params: {
          page: popularArtistsCurrentPage,
          limit: ITEMS_PER_PAGE,
          filter: popularArtistsFilter, // 🌐 국내/해외/종합 필터 파라미터
        },
      });
      setPopularArtists(res.data.artists); // 🌐 백엔드 응답 구조: { artists: [...], total: N }
      setPopularArtistsTotal(res.data.total);
    } catch (err) {
      console.error('🌐 인기 아티스트 가져오기 실패:', err);
      setPopularArtistsError('인기 아티스트를 불러오는 데 실패했습니다.');
      setPopularArtists([]);
    } finally {
      setPopularArtistsLoading(false);
    }
  }, [popularArtistsCurrentPage, popularArtistsFilter]); // 🌐 페이지, 필터 변경 시 다시 페칭


  // --- useEffect 호출 (각 페칭 함수가 변경될 때 실행) ---
  useEffect(() => { fetchTodayAlbums(); }, [fetchTodayAlbums]);
  useEffect(() => { fetchHotNewSongs(); }, [fetchHotNewSongs]);
  useEffect(() => { fetchGenres(); }, [fetchGenres]);
  useEffect(() => { fetchPopularArtists(); }, [fetchPopularArtists]);


  // --- 페이지네이션 및 필터 핸들러 ---
  // HOT & NEW 필터 변경 핸들러
  const handleHotNewFilterChange = (filterValue) => {
    setHotNewFilter(filterValue);
    setHotNewCurrentPage(1); // 필터 변경 시 1페이지로 리셋
  };
  // 인기 아티스트 필터 변경 핸들러
  const handlePopularArtistsFilterChange = (filterValue) => {
    setPopularArtistsFilter(filterValue);
    setPopularArtistsCurrentPage(1); // 필터 변경 시 1페이지로 리셋
  };


  // --- 총 페이지 수 계산 ---
  const todayAlbumsTotalPages = Math.ceil(todayAlbumsTotal / ITEMS_PER_PAGE);
  const hotNewTotalPages = Math.ceil(hotNewTotal / ITEMS_PER_PAGE);
  const popularArtistsTotalPages = Math.ceil(popularArtistsTotal / ITEMS_PER_PAGE);


  return (
    // 최상위 컨테이너 (MainPage에서 이미 bg-gray-900 등을 설정하므로 여기서는 max-w, mx-auto만 유지)
    <div className="text-white">
      {/* 🌐 고음질 필터 바 (앱 전역의 고음질 설정에 영향을 줍니다.) */}
      <SongFilterBar
        filterHighQuality={filterHighQuality}
        setFilterHighQuality={setFilterHighQuality}
      />

      {/* 1. 오늘 발매 음악 섹션 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">오늘 발매 음악</h2>
        {todayAlbumsLoading ? (
          <div className="text-center py-10 text-gray-400">불러오는 중...</div>
        ) : todayAlbumsError ? (
          <div className="text-center py-10 text-red-500">{todayAlbumsError}</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-items-center">
            {todayAlbums.length === 0 ? (
              <p className="col-span-full text-center text-gray-400">발매된 앨범이 없습니다.</p>
            ) : (
              todayAlbums.map((album) => (
                <AlbumCard key={album.id} album={album} size="md" />
              ))
            )}
          </div>
        )}
        {/* 🌐 페이지네이션 (총 페이지가 1보다 클 때만 표시) */}
        {todayAlbumsTotalPages > 1 && (
          <Pagination
            currentPage={todayAlbumsCurrentPage}
            totalPages={todayAlbumsTotalPages}
            onPageChange={setTodayAlbumsCurrentPage}
          />
        )}
      </section>

      {/* 2. HOT & NEW 섹션 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">HOT & NEW</h2>
        {/* 🌐 필터 버튼 (국내/해외/종합) */}
        <FilterButtons currentFilter={hotNewFilter} onFilterChange={handleHotNewFilterChange} filters={HOT_NEW_FILTERS} />
        {hotNewLoading ? (
          <div className="text-center py-10 text-gray-400">불러오는 중...</div>
        ) : hotNewError ? (
          <div className="text-center py-10 text-red-500">{hotNewError}</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-items-center">
            {hotNewSongs.length === 0 ? (
              <p className="col-span-full text-center text-gray-400">HOT & NEW 곡이 없습니다.</p>
            ) : (
              hotNewSongs.map((song) => (
                // 🌐 InteractiveSongCard는 playSong 함수를 prop으로 받습니다.
                <InteractiveSongCard key={song.id} song={song} onPlay={playSong} />
              ))
            )}
          </div>
        )}
        {/* 🌐 페이지네이션 (총 페이지가 1보다 클 때만 표시) */}
        {hotNewTotalPages > 1 && (
          <Pagination
            currentPage={hotNewCurrentPage}
            totalPages={hotNewTotalPages}
            onPageChange={setHotNewCurrentPage}
          />
        )}
      </section>

      {/* 3. 장르 섹션 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">장르</h2>
        {genresLoading ? (
          <div className="text-center py-10 text-gray-400">불러오는 중...</div>
        ) : genresError ? (
          <div className="text-center py-10 text-red-500">{genresError}</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-items-center">
            {genres.length === 0 ? (
              <p className="col-span-full text-center text-gray-400">장르가 없습니다.</p>
            ) : (
              genres.map((genre) => (
                <GenreCard key={genre.id} genre={genre} />
              ))
            )}
          </div>
        )}
      </section>

      {/* 4. 인기 아티스트 섹션 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">인기 아티스트</h2>
        {/* 🌐 필터 버튼 (국내/해외/종합) */}
        <FilterButtons currentFilter={popularArtistsFilter} onFilterChange={handlePopularArtistsFilterChange} filters={POPULAR_ARTIST_FILTERS} />
        {popularArtistsLoading ? (
          <div className="text-center py-10 text-gray-400">불러오는 중...</div>
        ) : popularArtistsError ? (
          <div className="text-center py-10 text-red-500">{popularArtistsError}</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-items-center">
            {popularArtists.length === 0 ? (
              <p className="col-span-full text-center text-gray-400">인기 아티스트가 없습니다.</p>
            ) : (
              popularArtists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))
            )}
          </div>
        )}
        {/* 🌐 페이지네이션 (총 페이지가 1보다 클 때만 표시) */}
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