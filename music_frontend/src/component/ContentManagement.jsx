import React, { useState, useEffect } from 'react';
import LoadingToast from '../component/LoadingToast';
import '../styles/ContentManagement.css';
import axios from 'axios';

const dbName = 'musicPlayerDB';
const lyricsStoreName = 'lyrics';

const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 2);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(lyricsStoreName)) {
                db.createObjectStore(lyricsStoreName, { keyPath: 'id' });
            }
        };
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

const saveLyricsToDB = async (lyricsObj) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(lyricsStoreName, 'readwrite');
        const store = transaction.objectStore(lyricsStoreName);
        const request = store.put(lyricsObj);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
};

const getAllLyricsFromDB = async () => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(lyricsStoreName, 'readonly');
        const store = transaction.objectStore(lyricsStoreName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

const deleteLyricsFromDB = async (id) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(lyricsStoreName, 'readwrite');
        const store = transaction.objectStore(lyricsStoreName);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
};

const ContentManagement = () => {
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [songId, setSongId] = useState('');
  const [language, setLanguage] = useState('ko');
  const [lyricsInput, setLyricsInput] = useState('');
  const [editingLyricsId, setEditingLyricsId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        window.showToast('콘텐츠 데이터를 불러오는 중...', 'info');
        const token = localStorage.getItem('token');
        const [albumResponse, artistResponse, songResponse] = await Promise.all([
          axios.get('http://localhost:8080/api/albums', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:8080/api/artists', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:8080/api/songs', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setAlbums(albumResponse.data.sort((a, b) => b.likes - a.likes));
        setArtists(artistResponse.data.sort((a, b) => b.followers - a.followers));
        setSongs(songResponse.data);
        
        // 서버 가사와 로컬 가사 병합
        const localLyrics = await getAllLyricsFromDB();
        const lyricsBySong = {};
        localLyrics.forEach(lyric => {
          if (!lyricsBySong[lyric.songId]) {
            lyricsBySong[lyric.songId] = [];
          }
          lyricsBySong[lyric.songId].push({
            id: lyric.id,
            language: lyric.language,
            lyrics: lyric.lyrics
          });
        });
        setSongs(prevSongs => prevSongs.map(song => ({
          ...song,
          lyrics: lyricsBySong[song.id] || song.lyrics || []
        })));
        
        setLoading(false);
        window.showToast('콘텐츠 데이터를 성공적으로 불러왔습니다.', 'success');
      } catch (err) {
        setError(err.message || '콘텐츠 데이터를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
        window.showToast('콘텐츠 데이터를 불러오지 못했습니다.', 'error');
      }
    };
    fetchData();
  }, []);

  const handleLike = (id, type) => {
    if (type === 'album') {
      setAlbums(prevAlbums => prevAlbums.map(album => 
        album.id === id ? { ...album, likes: album.likes + 1 } : album
      ));
      window.showToast('앨범에 좋아요를 눌렀습니다.', 'success');
    } else if (type === 'artist') {
      setArtists(prevArtists => prevArtists.map(artist =>
        artist.id === id ? { ...artist, likes: artist.likes + 1 } : artist
      ));
      window.showToast('아티스트에 좋아요를 눌렀습니다.', 'success');
    }
  };

  const handleFollow = (id) => {
    setArtists(prevArtists => prevArtists.map(artist =>
      artist.id === id ? { ...artist, followers: artist.followers + 1 } : artist
    ));
    window.showToast('아티스트를 팔로우했습니다.', 'success');
  };

  const handleLyricsSubmit = async () => {
    if (!songId || !lyricsInput) {
      window.showToast('곡과 가사는 필수입니다.', 'error');
      return;
    }

    const lyricsData = { songId: parseInt(songId), language, lyrics: lyricsInput };
    const lyricsId = editingLyricsId || `${songId}-${language}`;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios({
        method: editingLyricsId ? 'PUT' : 'POST',
        url: editingLyricsId ? `http://localhost:8080/api/lyrics/admin/${editingLyricsId}` : 'http://localhost:8080/api/lyrics/admin',
        headers: { Authorization: `Bearer ${token}` },
        data: lyricsData
      });
      window.showToast(response.data.message || '가사가 저장되었습니다.', 'success');
      setSongs(prevSongs => prevSongs.map(song => 
        song.id === parseInt(songId) ? {
          ...song,
          lyrics: editingLyricsId 
            ? (song.lyrics || []).map(l => l.id === editingLyricsId ? { id: editingLyricsId, language, lyrics: lyricsInput } : l)
            : [...(song.lyrics || []), { id: lyricsId, language, lyrics: lyricsInput }]
        } : song
      ));
    } catch (err) {
      window.showToast(err , '서버에 가사를 저장하지 못했습니다. 로컬에 저장합니다.', 'warning');
      await saveLyricsToDB({
        id: lyricsId,
        songId: parseInt(songId),
        language,
        lyrics: lyricsInput
      });
      setSongs(prevSongs => prevSongs.map(song => 
        song.id === parseInt(songId) ? {
          ...song,
          lyrics: editingLyricsId 
            ? (song.lyrics || []).map(l => l.id === editingLyricsId ? { id: editingLyricsId, language, lyrics: lyricsInput } : l)
            : [...(song.lyrics || []), { id: lyricsId, language, lyrics: lyricsInput }]
        } : song
      ));
      window.showToast('가사가 로컬에 저장되었습니다.', 'success');
    }

    setSongId('');
    setLanguage('ko');
    setLyricsInput('');
    setEditingLyricsId(null);
  };

  const handleEditLyrics = async (songId, lyricsId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/lyrics/admin/song/${songId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const lyricsData = response.data.find(lyric => lyric.id === lyricsId);
      if (lyricsData) {
        setEditingLyricsId(lyricsId);
        setSongId(songId);
        setLanguage(lyricsData.language);
        setLyricsInput(lyricsData.lyrics);
      } else {
        throw new Error('서버에서 가사를 찾을 수 없습니다.');
      }
    } catch (err) {
      const localLyrics = await getAllLyricsFromDB();
      const lyricsData = localLyrics.find(lyric => lyric.id === lyricsId);
      if (lyricsData) {
        setEditingLyricsId(lyricsId);
        setSongId(songId);
        setLanguage(lyricsData.language);
        setLyricsInput(lyricsData.lyrics);
      } else {
        window.showToast(err , '가사 데이터를 불러오지 못했습니다.', 'error');
      }
    }
  };

  const handleDeleteLyrics = async (lyricsId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/lyrics/admin/${lyricsId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.showToast('가사가 삭제되었습니다.', 'success');
      setSongs(prevSongs => prevSongs.map(song => ({
        ...song,
        lyrics: song.lyrics ? song.lyrics.filter(lyric => lyric.id !== lyricsId) : []
      })));
    } catch (err) {
      await deleteLyricsFromDB(lyricsId);
      window.showToast(err , '로컬 가사가 삭제되었습니다.', 'success');
      setSongs(prevSongs => prevSongs.map(song => ({
        ...song,
        lyrics: song.lyrics ? song.lyrics.filter(lyric => lyric.id !== lyricsId) : []
      })));
    }
  };

  return (
    <div className="content-management-container">
      <h2 className="content-management-title">콘텐츠 관리</h2>
      <LoadingToast isLoading={loading} onDismiss={() => setLoading(false)} />
      {error && <p className="content-management-error">{error}</p>}

      <div className="content-ranking-section">
        <h3>가사 관리</h3>
        <div className="lyrics-form">
          <div>
            <label>곡 선택</label>
            <select value={songId} onChange={(e) => setSongId(e.target.value)}>
              <option value="">곡을 선택하세요</option>
              {songs.map(song => (
                <option key={song.id} value={song.id}>{song.title} - {song.artistName}</option>
              ))}
            </select>
          </div>
          <div>
            <label>언어</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="ko">한국어</option>
              <option value="en">영어</option>
            </select>
          </div>
          <div>
            <label>가사 (한 줄씩 입력)</label>
            <textarea
              value={lyricsInput}
              onChange={(e) => setLyricsInput(e.target.value)}
              placeholder="가사를 줄 단위로 입력하세요"
              rows={10}
            />
          </div>
          <button onClick={handleLyricsSubmit}>
            {editingLyricsId ? '가사 수정' : '가사 추가'}
          </button>
        </div>
        <h4>저장된 가사</h4>
        <div className="ranking-list song-list">
          {songs.length === 0 ? (
            <p>노래 데이터가 없습니다.</p>
          ) : (
            songs.map((song, index) => (
              <div key={song.id} className="ranking-item">
                <div className="ranking-number">{index + 1}</div>
                <div className="item-info">
                  <p className="item-title">{song.title}</p>
                  <p className="item-subtitle">{song.artistName || 'Unknown'}</p>
                  {song.lyrics && song.lyrics.map(lyric => (
                    <div key={lyric.id}>
                      <p>언어: {lyric.language}</p>
                      <button onClick={() => handleEditLyrics(song.id, lyric.id)} className="action-btn">수정</button>
                      <button onClick={() => handleDeleteLyrics(lyric.id)} className="action-btn">삭제</button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="content-ranking-section">
        <h3>최근 인기 급상승 앨범 랭킹</h3>
        <div className="ranking-list album-list">
          {albums.length === 0 ? (
            <p>앨범 데이터가 없습니다.</p>
          ) : (
            albums.map((album, index) => (
              <div key={album.id} className="ranking-item">
                <div className="ranking-number">{index + 1}</div>
                <img src={album.cover} alt={album.title} className="item-cover" />
                <div className="item-info">
                  <p className="item-title">{album.title}</p>
                  <p className="item-subtitle">{album.artist}</p>
                  <div className="item-stats">
                    <span>❤ {album.likes}</span>
                    <span>👀 {album.followers}</span>
                  </div>
                </div>
                <button onClick={() => handleLike(album.id, 'album')} className="action-btn">좋아요</button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="content-ranking-section">
        <h3>최근 인기 급상승 아티스트 랭킹</h3>
        <div className="ranking-list artist-list">
          {artists.length === 0 ? (
            <p>아티스트 데이터가 없습니다.</p>
          ) : (
            artists.map((artist, index) => (
              <div key={artist.id} className="ranking-item">
                <div className="ranking-number">{index + 1}</div>
                <img src={artist.avatar} alt={artist.name} className="item-avatar" />
                <div className="item-info">
                  <p className="item-title">{artist.name}</p>
                  <div className="item-stats">
                    <span>❤ {artist.likes}</span>
                    <span>👀 {artist.followers}</span>
                  </div>
                </div>
                <button onClick={() => handleFollow(artist.id)} className="action-btn">팔로우</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;