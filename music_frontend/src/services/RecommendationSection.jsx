import React, { useEffect, useState } from 'react';
import API from './api'; // axios instance

const RecommendationSection = () => {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    API.get('/recommendations')
      .then(res => setSongs(res.data))
      .catch(err => console.error("추천 실패", err));
  }, []);

  return (
    <section>
      <h2>추천 음악</h2>
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
        {songs.map(song => (
          <div key={song.id} style={{ minWidth: '200px', padding: '10px', border: '1px solid #ccc' }}>
            <img src={song.imageUrl} alt={song.title} style={{ width: '100%' }} />
            <h4>{song.title}</h4>
            <p>{song.artistName} - {song.albumTitle}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecommendationSection;
