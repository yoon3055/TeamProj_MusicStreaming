// src/pages/RecommendPage.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import SongFilterBar from '../component/SongFilterBar';
import FilterButtons from '../component/FilterButtons';
import PlaylistDrawer from '../component/PlaylistDrawer';
import { MusicPlayerContext } from '../context/MusicPlayerContext';
import { loadMusicListFromDB, getAllSongsFromDB } from '../services/indexDB';
import { artistApi } from '../api/artistApi';
import { songApi } from '../api/songApi';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

import '../styles/RecommendPage.css';

// 장르 데이터는 서버에서 가져오도록 수정 예정

// 아티스트 데이터는 서버 API와 로컬 DB에서 가져옴

// 앨범 데이터는 로컬 DB에서 가져옴

// 곡 데이터는 로컬 DB에서 가져옴

// 플레이리스트 데이터는 로컬 DB에서 가져옴

const HOT_NEW_FILTERS = [
  { label: '종합', value: 'all' },
  { label: '국내', value: '국내' },
  { label: '해외', value: '해외' },
];

const BACKGROUND_SCHEMES = [
  'gradient-scheme-1',
  'gradient-scheme-2',
  'gradient-scheme-3',
  'gradient-scheme-4',
  'gradient-scheme-5',
];

const RecommendPage = () => {
  const { playSong } = useContext(MusicPlayerContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [filterHighQuality, setFilterHighQuality] = useState(false);
  const [genreFilter, setGenreFilter] = useState('');
  const [isFilterOptionsVisible, setIsFilterOptionsVisible] = useState(false);
  const [hotNewFilter, setHotNewFilter] = useState('all');


  const [todayAlbums, setTodayAlbums] = useState([]);
  const [hotNewSongs, setHotNewSongs] = useState([]);
  const [popularArtists, setPopularArtists] = useState([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState([]);

  const [currentBgSchemeIndex, setCurrentBgSchemeIndex] = useState(0);

  // 고음질 필터 적용
  const applyHighQualityFilter = useCallback(
    (data) => (filterHighQuality ? data.filter((item) => item.isHighQuality) : data),
    [filterHighQuality]
  );

  // 아티스트 데이터 로드
  // 로컬 데이터베이스에서 아티스트 추출하는 함수
  const fetchArtistsFromLocalDB = async () => {
    try {
      const allSongs = await getAllSongsFromDB();
      
      // 아티스트별로 그룹화
      const artistsMap = {};
      allSongs.forEach(song => {
        const artistName = song.artist || song.artistName;
        if (artistName && typeof artistName === 'string') {
          if (!artistsMap[artistName]) {
            artistsMap[artistName] = {
              id: `local_${artistName}`,
              name: artistName,
              profileImageUrl: song.coverUrl || song.albumArt || '/images/default-artist.jpg',
              genre: song.genre || 'Various',
              origin: '국내',
              likeCount: Math.floor(Math.random() * 100) + 50,
              followerCount: Math.floor(Math.random() * 200) + 100,
              isLiked: false,
              isFollowed: false,
              songs: []
            };
          }
          artistsMap[artistName].songs.push(song);
        }
      });
      
      const localArtists = Object.values(artistsMap);
      
      if (localArtists.length > 0) {
        setPopularArtists(localArtists);
      } else {
        // 로컬 데이터도 없으면 빈 배열
        setPopularArtists([]);
      }
    } catch (error) {
      setPopularArtists([]);
    }
  };

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const artists = await artistApi.getAllArtists();
        
        if (artists && artists.length > 0) {
          // 사용자별 좋아요/팔로우 상태 확인
          const transformedArtists = await Promise.all(
            artists.map(async (artist) => {
              let likeCount = 0;
              let isLiked = false;
              let isFollowed = false;

              try {
                // 좋아요 수 조회
                likeCount = await artistApi.getLikeCount(artist.id);
                
                // 사용자가 로그인한 경우 좋아요/팔로우 상태 확인
                if (user?.id) {
                  isLiked = await artistApi.isLiked(artist.id, user.id);
                  // 팔로우 상태는 별도 API가 필요 (현재는 기본값)
                }
              } catch (error) {
                // 상태 조회 실패 시 기본값 사용
              }

              return {
                id: artist.id,
                name: artist.name,
                profileImageUrl: artist.profileImage || '/images/default-artist.jpg',
                genre: artist.genre,
                origin: '국내', // 기본값, 필요시 백엔드에서 추가
                likeCount,
                followerCount: 0, // 팔로우 API로 별도 조회 필요
                isLiked,
                isFollowed, // 팔로우 API로 별도 조회 필요
              };
            })
          );
          
          setPopularArtists(transformedArtists);
        } else {
          // 서버에 아티스트가 없으면 로컬 DB에서 가져오기
          await fetchArtistsFromLocalDB();
        }
      } catch (error) {
        // 실패시 로컬 데이터베이스에서 아티스트 추출
        await fetchArtistsFromLocalDB();
      }
    };

    fetchArtists();
  }, []); // 빈 배열로 변경하여 컴포넌트 마운트 시에만 실행

  // 사용자 로그인 상태 변경 시 좋아요/팔로우 상태만 업데이트
  useEffect(() => {
    if (popularArtists.length > 0) {
      const updateUserStates = async () => {
        try {
          const updatedArtists = await Promise.all(
            popularArtists.map(async (artist) => {
              let isLiked = false;
              let isFollowed = false;

              if (user?.id) {
                try {
                  isLiked = await artistApi.isLiked(artist.id, user.id);
                  // 팔로우 상태는 별도 API가 필요 (현재는 기본값)
                } catch (error) {
                  // 사용자 상태 조회 실패 시 기본값 사용
                }
              }

              return {
                ...artist,
                isLiked,
                isFollowed,
              };
            })
          );
          
          setPopularArtists(updatedArtists);
        } catch (error) {
          // 사용자 상태 업데이트 실패 시 기존 상태 유지
        }
      };

      updateUserStates();
    }
  }, [user]);

  useEffect(() => {
    async function fetchMusicData() {
      try {
        // 서버에서 실제 노래 데이터 가져오기
        const recentSongs = await songApi.getRecentSongs(7); // 최근 7일간 업로드된 노래
        const allSongs = await songApi.getAllSongs();
        
        // 장르 필터 적용
        const filteredRecentSongs = recentSongs.filter((song) => !genreFilter || song.genre === genreFilter);
        const filteredAllSongs = allSongs.filter((song) => !genreFilter || song.genre === genreFilter);
        
        // 오늘 발매 음악: 최근 업로드된 노래들에 좋아요 수 추가
        const todayAlbumsWithLikes = await Promise.all(
          filteredRecentSongs.map(async (song) => {
            try {
              const likeCount = await songApi.getSongLikeCount(song.id);
              let isLiked = false;
              
              // 사용자가 로그인한 경우 좋아요 여부 확인
              if (user?.id) {
                isLiked = await songApi.isLikedByUser(song.id, user.id);
              }
              
              return {
                ...song,
                likeCount,
                isLiked
              };
            } catch (error) {
              return {
                ...song,
                likeCount: 0,
                isLiked: false
              };
            }
          })
        );
        
        setTodayAlbums(applyHighQualityFilter(todayAlbumsWithLikes));
        
        // HOT & NEW: 전체 노래에서 최신순으로 정렬
        const sortedSongs = filteredAllSongs.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        setHotNewSongs(applyHighQualityFilter(sortedSongs.slice(0, 20)));
        
        // 추천 플레이리스트: 인기 노래들로 구성
        setFeaturedPlaylists(applyHighQualityFilter(sortedSongs.slice(0, 15)));
        
      } catch (error) {
        // 서버 음악 데이터 불러오기 실패, 로컬 데이터 시도
        
        // 서버 실패 시 로컬 데이터 사용
        try {
          const localMusicList = await loadMusicListFromDB();
          if (localMusicList && localMusicList.length > 0) {
            const filteredToday = localMusicList.filter((item) => !genreFilter || item.genre === genreFilter);
            const filteredHotNew = localMusicList.filter((item) => !genreFilter || item.genre === genreFilter);
            const filteredFeatured = localMusicList.filter((item) => !genreFilter || item.genre === genreFilter);

            setTodayAlbums(applyHighQualityFilter(filteredToday));
            setHotNewSongs(applyHighQualityFilter(filteredHotNew));
            setFeaturedPlaylists(applyHighQualityFilter(filteredFeatured));
          }
        } catch (localError) {
          // 로컬 음악 데이터도 불러오기 실패
        }
      }
    }
    fetchMusicData();
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
    playSong({
      id: item.id,
      title: item.title,
      artist: item.artist || 'Various Artists',
      coverUrl: item.coverUrl,
      url: item.audioUrl || item.url || '',
    });
    window.showToast && window.showToast(`${item.title} - ${item.artist || 'Various Artists'} 재생 시작!`, 'success');
  };

  // 배경 색상 변경 기능 제거
  // const handleNextBackgroundScheme = useCallback(() => {
  //   setCurrentBgSchemeIndex((prev) => (prev + 1) % BACKGROUND_SCHEMES.length);
  // }, []);

  const handleToggleLikeForArtist = async (artistId) => {
    if (!user?.id) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      // API 호출하여 좋아요 토글
      const isLiked = await artistApi.toggleLike(artistId, user.id);
      
      // 좋아요 수 다시 조회
      const likeCount = await artistApi.getLikeCount(artistId);
      
      // UI 업데이트
      setPopularArtists((prev) =>
        prev.map((artist) =>
          artist.id === artistId
            ? {
                ...artist,
                isLiked,
                likeCount,
              }
            : artist
        )
      );
      
    } catch (error) {
      window.showToast && window.showToast('좋아요 처리에 실패했습니다. 다시 시도해주세요.', 'error');
    }
  };

  const handleToggleFollowForArtist = async (artistId) => {
    if (!user?.id) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      // 현재는 팔로우 API가 구현되지 않았으므로 임시로 로컬 상태만 업데이트
      // TODO: 백엔드에 아티스트 팔로우 API 구현 후 연동
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
      
      window.showToast && window.showToast('팔로우 기능은 현재 개발 중입니다.', 'info');
    } catch (error) {
      window.showToast && window.showToast('팔로우 처리에 실패했습니다.', 'error');
    }
  };

  const handleToggleLikeForSong = async (songId) => {
    if (!user?.id) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      // API 호출하여 좋아요 토글
      const result = await songApi.toggleSongLike(songId, user.id);
      
      // 좋아요 수 다시 조회
      const likeCount = await songApi.getSongLikeCount(songId);
      const isLiked = await songApi.isLikedByUser(songId, user.id);
      
      // 오늘 발매 음악 UI 업데이트
      setTodayAlbums((prev) =>
        prev.map((song) =>
          song.id === songId
            ? {
                ...song,
                likeCount,
                isLiked,
              }
            : song
        )
      );
      
    } catch (error) {
      window.showToast && window.showToast('좋아요 처리에 실패했습니다. 다시 시도해주세요.', 'error');
    }
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
              {/* 장르 필터는 서버 API 구현 후 활성화 예정 */}
            </div>
          </div>
        )}

        <SongFilterBar filterHighQuality={filterHighQuality} setFilterHighQuality={setFilterHighQuality} />
      </div>

{/* 추천 테마 플레이리스트 섹션 임시 숨김 */}
      {/* <PlaylistDrawer
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
        onPageChange={null}
      /> */}

      <PlaylistDrawer
        title="오늘 발매 음악"
        sectionType="todayAlbums"
        initialData={filterSectionData(todayAlbums, hotNewFilter, 'todayAlbums')}
        filterButtons={null}
        onPlayTheme={handlePlayTheme}
        cardType="song"
        cardsPerPage={4}
        containerClassName={BACKGROUND_SCHEMES[currentBgSchemeIndex]}
        onPageChange={null}
        onToggleLike={handleToggleLikeForSong}
      />

{/* HOT & NEW 섹션 임시 숨김 */}
      {/* <PlaylistDrawer
        title="HOT & NEW"
        sectionType="hotNewSongs"
        initialData={filterSectionData(hotNewSongs, hotNewFilter, 'hotNewSongs')}
        filterButtons={<FilterButtons currentFilter={hotNewFilter} onFilterChange={setHotNewFilter} filters={HOT_NEW_FILTERS} />}
        onPlayTheme={handlePlayTheme}
        cardType="album"
        containerClassName={BACKGROUND_SCHEMES[currentBgSchemeIndex]}
        onPageChange={null}
      /> */}

      {/* 장르 섹션은 서버 API 구현 후 활성화 예정 */}
      {/* <PlaylistDrawer
        title="장르"
        sectionType="genres"
        initialData={[]}
        filterButtons={null}
        onPlayTheme={null}
        cardType="genre"
        containerClassName={BACKGROUND_SCHEMES[currentBgSchemeIndex]}
        onPageChange={null}
      /> */}

      <PlaylistDrawer
        title="인기 아티스트"
        sectionType="popularArtists"
        initialData={popularArtists}
        filterButtons={null}
        onPlayTheme={null}
        cardType="artist"
        gridLayout={true}
        cardsPerPage={6}
        className="popular-artists"
        containerClassName={BACKGROUND_SCHEMES[currentBgSchemeIndex]}
        onPageChange={null}
        onToggleLike={handleToggleLikeForArtist}
      />
      
    </div>
  );
};

export default RecommendPage;
