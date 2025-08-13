import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MusicPlayerContext } from '../context/MusicPlayerContext';
import { AuthContext } from '../context/AuthContext';
import { loadMusicListFromDB, loadPlaylistsFromDB, getAllSongsFromDB, toggleLike, handleAction } from '../services/indexDB';
import { Play, Heart, Share2, MoreVertical, Clock, ArrowLeft } from 'lucide-react';
import '../styles/AlbumDetailPage.css';

const AlbumDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playSong, addToQueue } = useContext(MusicPlayerContext);
  const { user } = useContext(AuthContext);
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [recommendations, setRecommendations] = useState([]);
  const [isPurchased, setIsPurchased] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlbumDataFromDB = async () => {
      setLoading(true);
      setError(null);

      try {
        // IndexedDB에서 플레이리스트와 음악 데이터 가져오기
        const playlists = await loadPlaylistsFromDB();
        const musicList = await loadMusicListFromDB();
        const allSongs = await getAllSongsFromDB();

        // ID로 앨범/플레이리스트 찾기
        let albumData = playlists.find(playlist => playlist.id === id);
        
        if (!albumData) {
          // 플레이리스트에서 찾지 못한 경우, 음악 리스트에서 찾기
          albumData = musicList.find(music => music.id === id);
          
          if (albumData) {
            // 단일 곡을 앨범 형태로 변환
            albumData = {
              ...albumData,
              songs: [albumData],
              title: albumData.albumTitle || albumData.title,
              artist: albumData.artist,
              coverUrl: albumData.coverUrl || albumData.albumArt,
              songCount: 1
            };
          }
        }

        if (!albumData) {
          // 아티스트 이름으로 관련 곡들 묶어서 가상 앨범 생성
          const artistSongs = allSongs.filter(song => song.artist === id || song.id === id);
          if (artistSongs.length > 0) {
            const firstSong = artistSongs[0];
            albumData = {
              id: id,
              title: firstSong.albumTitle || `${firstSong.artist} Collection`,
              artist: firstSong.artist,
              coverUrl: firstSong.coverUrl || firstSong.albumArt,
              songs: artistSongs,
              genre: firstSong.genre,
              releaseDate: firstSong.updatedAt || new Date().toISOString(),
              songCount: artistSongs.length,
              description: `${firstSong.artist}의 수록곡 모음`
            };
          }
        }

        if (!albumData) {
          throw new Error('앨범 정보를 찾을 수 없습니다.');
        }

        // 앨범 설정
        setAlbum(albumData);
        
        // 총 재생시간 계산
        const duration = albumData.songs?.reduce((total, song) => total + (song.duration || 180), 0) || 0;
        setTotalDuration(duration);

        // 좋아요 상태 계산 (임시로 songs 배열에서 liked가 true인 비율로)
        const likedSongs = albumData.songs?.filter(song => song.isLiked) || [];
        setLikeCount(likedSongs.length);
        setIsLiked(likedSongs.length > albumData.songs?.length / 2);

        // 구매 상태 (IndexedDB에 있다면 이미 구매한 것으로 간주)
        setIsPurchased(true);

        // 추천 앨범 생성 (같은 장르나 아티스트)
        const recommendedData = allSongs
          .filter(song => 
            song.id !== albumData.id && 
            (song.genre === albumData.genre || song.artist === albumData.artist)
          )
          .slice(0, 4)
          .map(song => ({
            id: song.id,
            title: song.albumTitle || song.title,
            artist: song.artist,
            coverUrl: song.coverUrl || song.albumArt,
            genre: song.genre
          }));
        
        setRecommendations(recommendedData);

      } catch (error) {
        console.error('IndexedDB에서 앨범 데이터 가져오기 실패:', error);
        setError(error.message);
        setAlbum(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAlbumDataFromDB();
    }
  }, [id]);

  const handleLikeToggle = async () => {
    if (!user) {
      alert('로그인 후 이용할 수 있는 기능입니다.');
      return;
    }

    try {
      // IndexedDB의 handleAction을 사용하여 좋아요 상태 변경
      await handleAction('toggle_like', { id: album.id, isLiked: !isLiked });
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
      
      // 앨범의 모든 곡에 좋아요 상태 적용
      if (album.songs) {
        const updatePromises = album.songs.map(song => 
          toggleLike(song.id, !isLiked)
        );
        await Promise.all(updatePromises);
      }

      window.showToast?.(`앨범을 ${isLiked ? '좋아요 취소' : '좋아요'}했습니다.`, 'success');
    } catch (error) {
      console.error('좋아요 토글 실패:', error);
      window.showToast?.('좋아요 상태 변경에 실패했습니다.', 'error');
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      alert('로그인 후 이용할 수 있는 기능입니다.');
      return;
    }

    if (isPurchased) {
      alert('이미 보유하고 있는 앨범입니다.');
      return;
    }

    // IndexedDB에 있는 데이터는 이미 구매한 것으로 간주
    setIsPurchased(true);
    window.showToast?.('앨범이 라이브러리에 추가되었습니다!', 'success');
  };

  const handlePlayAll = () => {
    if (album?.songs?.length > 0) {
      addToQueue(album.songs);
      playSong(album.songs[0]);
      navigate('/art'); // 전체화면 플레이어로 이동
    }
  };

  const handleSongClick = (song) => {
    playSong(song);
    navigate('/art'); // 전체화면 플레이어로 이동
  };

  const handleAddToQueue = (song) => {
    addToQueue([song]);
    window.showToast?.(`${song.title}이(가) 재생목록에 추가되었습니다.`, 'success');
  };

  const handleShareAlbum = async () => {
    const shareData = {
      title: album.title,
      text: `${album.artist}의 앨범 "${album.title}"을 들어보세요!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log(error , '공유 취소됨');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      window.showToast?.('앨범 링크가 클립보드에 복사되었습니다.', 'success');
    }
  };

  const handleRecommendationClick = (rec) => {
    navigate(`/album/${rec.id}`);
  };

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0 
      ? `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}` 
      : `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return (
    <div className="album-detail-container">
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>앨범 정보를 불러오는 중...</p>
      </div>
    </div>
  );

  if (error || !album) return (
    <div className="album-detail-container">
      <div className="error">
        <p>{error || '앨범 정보를 찾을 수 없습니다.'}</p>
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft /> 뒤로 가기
        </button>
      </div>
    </div>
  );

  return (
    <div className="album-detail-container">
      {/* 네비게이션 헤더 */}
      <div className="album-nav">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={20} />
        </button>
        <span>앨범</span>
      </div>

      {/* 앨범 헤더 */}
      <div className="album-header">
        <img 
          src={album.coverUrl || '/default-cover.jpg'} 
          alt={album.title} 
          className="album-cover"
          onError={(e) => {
            e.target.src = '/default-cover.jpg';
          }}
        />
        <div className="album-info">
          <h1 className="album-title">{album.title}</h1>
          <p className="album-artist">아티스트: {album.artist}</p>
          <p className="album-likes">좋아요: {likeCount}</p>
          <p className="album-tracks">{album.songs?.length || 0}곡 • {formatDuration(totalDuration)}</p>
          {album.genre && <p className="album-genre">장르: {album.genre}</p>}
          {album.releaseDate && (
            <p className="album-release">발매일: {new Date(album.releaseDate).toLocaleDateString()}</p>
          )}
          {album.description && <p className="album-description">{album.description}</p>}
        </div>
      </div>

      {/* 앨범 액션 버튼 */}
      <div className="album-actions">
        <button onClick={handlePlayAll} className="play-all-btn">
          <Play size={16} /> 전체 재생
        </button>
        <button 
          onClick={handleLikeToggle} 
          className={`like-btn ${isLiked ? 'liked' : ''}`}
        >
          <Heart size={16} /> {isLiked ? '좋아요 취소' : '좋아요'}
        </button>
        <button onClick={handleShareAlbum} className="share-btn">
          <Share2 size={16} /> 공유
        </button>
        <button className="more-btn">
          <MoreVertical size={16} />
        </button>
        <button 
          onClick={handlePurchase} 
          className="purchase-btn" 
          disabled={isPurchased}
        >
          {isPurchased ? '보유 중' : '라이브러리 추가'}
        </button>
      </div>

      {/* 수록곡 목록 */}
      <div className="tracks-list">
        <h2>수록곡</h2>
        {album.songs?.length > 0 ? (
          album.songs.map((song, index) => (
            <div key={song.id || index} className="track-item">
              <span className="track-number">{index + 1}</span>
              <div className="track-info" onClick={() => handleSongClick(song)}>
                <img 
                  src={song.coverUrl || song.albumArt || album.coverUrl || '/default-cover.jpg'} 
                  alt={song.title}
                  className="track-cover"
                />
                <div className="track-details">
                  <span className="track-title">{song.title}</span>
                  <span className="track-artist">{song.artist}</span>
                </div>
              </div>
              <span className="track-duration">
                <Clock size={12} /> {formatDuration(song.duration || 180)}
              </span>
              <button 
                onClick={() => handleAddToQueue(song)}
                className="add-to-queue-btn"
                title="재생목록에 추가"
              >
                담기
              </button>
            </div>
          ))
        ) : (
          <p className="no-tracks">수록곡이 없습니다.</p>
        )}
      </div>

      {/* 추천 앨범 */}
      {recommendations.length > 0 && (
        <div className="recommendations">
          <h2>추천 앨범</h2>
          <div className="rec-list">
            {recommendations.map(rec => (
              <div 
                key={rec.id} 
                className="rec-item"
                onClick={() => handleRecommendationClick(rec)}
              >
                <img 
                  src={rec.coverUrl || '/default-cover.jpg'} 
                  alt={rec.title}
                  onError={(e) => {
                    e.target.src = '/default-cover.jpg';
                  }}
                />
                <div className="rec-info">
                  <p className="rec-title">{rec.title}</p>
                  <p className="rec-artist">{rec.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlbumDetailPage;