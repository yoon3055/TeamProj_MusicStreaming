import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { MusicPlayerContext } from '../context/MusicPlayerContext';
import { loadMusicListFromDB, loadPlaylistsFromDB, getAllSongsFromDB, handleAction } from '../services/indexDB';
import { ArrowLeft, Play, Heart, Share2, Users, Music, Disc, MoreVertical } from 'lucide-react';
import '../styles/ArtistPage.css';
import artistPlaceholder from '../assets/default-cover.jpg';

const ArtistPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { playSong, addToQueue } = useContext(MusicPlayerContext);
  
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [_, setPlaylists] = useState([]);
  const [__, setMusicList] = useState([]);
  const [___, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [albums, setAlbums] = useState([]);
  const [topSongs, setTopSongs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchArtistDataFromDB = useCallback(async () => {
    setLoading(true);
    try {
      const allSongs = await getAllSongsFromDB();
      const playlists = await loadPlaylistsFromDB();
      const musicList = await loadMusicListFromDB();

      setPlaylists(playlists);
      setMusicList(musicList);

      const artistSongs = allSongs.filter(song => 
        song.artist === id || 
        song.artist?.toLowerCase().includes(id.toLowerCase()) ||
        song.id === id
      );

      if (artistSongs.length === 0) {
        throw new Error('해당 아티스트의 곡을 찾을 수 없습니다.');
      }

      const firstSong = artistSongs[0];
      const artistInfo = {
        id: id,
        name: firstSong.artist || id,
        profileImage: firstSong.coverUrl || firstSong.albumArt || artistPlaceholder,
        backgroundImage: firstSong.coverUrl || firstSong.albumArt,
        genre: firstSong.genre || 'Various',
        bio: `${firstSong.artist}의 음악을 감상해보세요.`,
        followerCount: Math.floor(Math.random() * 1000) + 100,
        socialLinks: null
      };

      setArtist(artistInfo);
      setFollowerCount(artistInfo.followerCount);

      const sortedSongs = artistSongs.sort((a, b) => {
        if (b.playCount && a.playCount) return b.playCount - a.playCount;
        if (b.isLiked && !a.isLiked) return 1;
        if (!b.isLiked && a.isLiked) return -1;
        return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
      });
      
      setTopSongs(sortedSongs);

      const albumsMap = {};
      artistSongs.forEach(song => {
        const albumKey = song.albumTitle || song.title;
        if (!albumsMap[albumKey]) {
          albumsMap[albumKey] = {
            id: song.id + '_album',
            title: albumKey,
            artist: song.artist,
            coverUrl: song.coverUrl || song.albumArt,
            releaseDate: song.updatedAt || new Date().toISOString(),
            trackCount: 0,
            songs: []
          };
        }
        albumsMap[albumKey].trackCount++;
        albumsMap[albumKey].songs.push(song);
      });

      const albumsList = Object.values(albumsMap);
      setAlbums(albumsList);

      setIsFollowing(Math.random() > 0.5);

    } catch (err) {
      setError(err.message || '아티스트 정보를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchArtistDataFromDB();
    }
  }, [fetchArtistDataFromDB, id]);

  const handleFollowToggle = useCallback(async () => {
    if (!user) {
      alert('로그인 후 이용할 수 있는 기능입니다.');
      return;
    }
    
    try {
      await handleAction('toggle_follow', { id: artist.id, isFollowing: !isFollowing });
      setIsFollowing(!isFollowing);
      setFollowerCount(prev => isFollowing ? prev - 1 : prev + 1);
      window.showToast?.(`${artist.name}을(를) ${isFollowing ? '언팔로우' : '팔로우'}했습니다.`, 'success');
    } catch (err) {
      window.showToast?.(err.message || '팔로우 상태 변경에 실패했습니다.', 'error');
    }
  }, [user, isFollowing, artist]);

  const handlePlayTopSongs = () => {
    if (topSongs.length > 0) {
      addToQueue(topSongs);
      playSong(topSongs[0]);
      navigate('/art');
    }
  };

  const handleSongClick = (song) => {
    playSong(song);
    navigate('/art');
  };

  const handleAlbumClick = (album) => {
    if (album.songs && album.songs.length > 0) {
      addToQueue(album.songs);
      playSong(album.songs[0]);
      navigate('/art');
    }
  };

  const handleShareArtist = async () => {
    if (!artist) return;

    const shareData = {
      title: artist.name,
      text: `아티스트 ${artist.name}의 음악을 들어보세요!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // 공유 취소됨
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      window.showToast?.('아티스트 링크가 클립보드에 복사되었습니다.', 'success');
    }
  };

  const handleAddToQueue = (song) => {
    addToQueue([song]);
    window.showToast?.(`${song.title}이(가) 재생목록에 추가되었습니다.`, 'success');
  };

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="artist-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>아티스트 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (___) {
    return (
      <div className="artist-page">
        <div className="error-message">
          <p>{___}</p>
          <button onClick={fetchArtistDataFromDB} className="retry-btn">다시 시도</button>
          <button onClick={() => navigate(-1)} className="back-btn">뒤로 가기</button>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="artist-page">
        <div className="no-data">
          <p>아티스트 정보를 찾을 수 없습니다.</p>
          <button onClick={() => navigate(-1)} className="back-btn">뒤로 가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="artist-page">
      <div className="artist-nav">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={20} />
        </button>
        <span>아티스트</span>
      </div>

      <div className="artist-header">
        <div className="artist-background">
          <img 
            src={artist.backgroundImage || artist.profileImage || artistPlaceholder} 
            alt={artist.name}
            className="background-image"
            onError={(e) => { e.target.src = artistPlaceholder; }}
          />
          <div className="header-overlay">
            <div className="artist-main-info">
              <img 
                src={artist.profileImage || artistPlaceholder} 
                alt={artist.name} 
                className="artist-image"
                onError={(e) => { e.target.src = artistPlaceholder; }}
              />
              <div className="artist-details">
                <h1 className="artist-name">{artist.name}</h1>
                <div className="artist-stats">
                  <span className="stat-item">
                    <Users size={16} />
                    {followerCount.toLocaleString()} 팔로워
                  </span>
                  <span className="stat-item">
                    <Music size={16} />
                    {topSongs.length}곡
                  </span>
                  {artist.genre && (
                    <span className="stat-item">
                      <Music size={16} />
                      {artist.genre}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="artist-actions">
          <button onClick={handlePlayTopSongs} className="btn btn-primary play-btn">
            <Play size={16} />
            재생
          </button>
          
          <button 
            onClick={handleFollowToggle} 
            className={`btn ${isFollowing ? 'btn-secondary' : 'btn-accent'} follow-btn`}
            disabled={!user}
          >
            <Heart size={16} />
            {isFollowing ? '팔로잉' : '팔로우'}
          </button>
          
          <button onClick={handleShareArtist} className="btn btn-secondary share-btn">
            <Share2 size={16} />
            공유
          </button>
          
          <button className="btn btn-secondary more-btn">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      <div className="artist-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          개요
        </button>
        <button 
          className={`tab-btn ${activeTab === 'songs' ? 'active' : ''}`}
          onClick={() => setActiveTab('songs')}
        >
          인기곡
        </button>
        <button 
          className={`tab-btn ${activeTab === 'albums' ? 'active' : ''}`}
          onClick={() => setActiveTab('albums')}
        >
          앨범
        </button>
      </div>

      <div className="artist-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {artist.bio && (
              <div className="artist-bio-section">
                <h2 className="section-title">소개</h2>
                <p className="artist-bio">{artist.bio}</p>
              </div>
            )}

            {topSongs.length > 0 && (
              <div className="popular-songs-section">
                <h2 className="section-title">인기곡</h2>
                <div className="songs-list">
                  {topSongs.slice(0, 5).map((song, index) => (
                    <div key={song.id} className="song-item">
                      <span className="song-rank">{index + 1}</span>
                      <img 
                        src={song.albumArt || song.coverUrl || artistPlaceholder}
                        alt={song.title}
                        className="song-image"
                        onError={(e) => { e.target.src = artistPlaceholder; }}
                      />
                      <div className="song-info" onClick={() => handleSongClick(song)}>
                        <span className="song-title">{song.title}</span>
                        <span className="song-plays">
                          {song.playCount?.toLocaleString() || Math.floor(Math.random() * 10000)} 재생
                        </span>
                      </div>
                      <span className="song-duration">{formatDuration(song.duration || 180)}</span>
                    </div>
                  ))}
                </div>
                {topSongs.length > 5 && (
                  <button className="show-more-btn" onClick={() => setActiveTab('songs')}>
                    더 보기
                  </button>
                )}
              </div>
            )}

            {albums.length > 0 && (
              <div className="recent-albums-section">
                <h2 className="section-title">앨범</h2>
                <div className="albums-grid">
                  {albums.slice(0, 4).map(album => (
                    <div key={album.id} className="album-card" onClick={() => handleAlbumClick(album)}>
                      <img 
                        src={album.coverUrl || artistPlaceholder}
                        alt={album.title}
                        className="album-cover"
                        onError={(e) => { e.target.src = artistPlaceholder; }}
                      />
                      <div className="album-info">
                        <h3 className="album-title">{album.title}</h3>
                        <p className="album-year">{album.releaseDate ? new Date(album.releaseDate).getFullYear() : ''}</p>
                        <p className="album-tracks">{album.trackCount}곡</p>
                      </div>
                    </div>
                  ))}
                </div>
                {albums.length > 4 && (
                  <button className="show-more-btn" onClick={() => setActiveTab('albums')}>
                    더 보기
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'songs' && (
          <div className="songs-tab">
            <h2 className="section-title">인기곡</h2>
            {topSongs.length > 0 ? (
              <div className="full-songs-list">
                {topSongs.map((song, index) => (
                  <div key={song.id} className="song-item">
                    <span className="song-rank">{index + 1}</span>
                    <img 
                      src={song.albumArt || song.coverUrl || artistPlaceholder}
                      alt={song.title}
                      className="song-image"
                      onError={(e) => { e.target.src = artistPlaceholder; }}
                    />
                    <div className="song-info" onClick={() => handleSongClick(song)}>
                      <span className="song-title">{song.title}</span>
                      <div className="song-meta">
                        <span className="song-album">{song.albumTitle || song.title}</span>
                        <span className="song-plays">
                          {song.playCount?.toLocaleString() || Math.floor(Math.random() * 10000)} 재생
                        </span>
                      </div>
                    </div>
                    <span className="song-duration">{formatDuration(song.duration || 180)}</span>
                    <button className="add-to-queue-btn" onClick={() => handleAddToQueue(song)} title="재생목록에 추가">+</button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">인기곡 정보가 없습니다.</p>
            )}
          </div>
        )}

        {activeTab === 'albums' && (
          <div className="albums-tab">
            <h2 className="section-title">앨범</h2>
            {albums.length > 0 ? (
              <div className="full-albums-grid">
                {albums.map(album => (
                  <div key={album.id} className="album-card" onClick={() => handleAlbumClick(album)}>
                    <img 
                      src={album.coverUrl || artistPlaceholder}
                      alt={album.title}
                      className="album-cover"
                      onError={(e) => { e.target.src = artistPlaceholder; }}
                    />
                    <div className="album-info">
                      <h3 className="album-title">{album.title}</h3>
                      <div className="album-meta">
                        <span className="album-year">{album.releaseDate ? new Date(album.releaseDate).getFullYear() : ''}</span>
                        <span className="album-tracks"><Disc size={12} />{album.trackCount || 0}곡</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">앨범 정보가 없습니다.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistPage;
