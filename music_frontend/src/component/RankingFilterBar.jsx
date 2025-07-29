import React from 'react';

const REGION_OPTIONS = [
  { label: '종합', value: 'all' },
  { label: '국내', value: 'domestic' },
  { label: '해외', value: 'international' },
];

const GENRE_OPTIONS = [
  '발라드', '팝', '댄스', '힙합', '트로트', '알앤비', '인디', '클래식', 'OST', 'J-POP', 'K-POP'
];

const RankingFilterBar = ({ regionFilter, genreFilter, onRegionChange, onGenreChange }) => {
  return (
    <div className="ranking-filter-bar">
      <div className="region-filters">
        {REGION_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={`filter-button ${regionFilter === opt.value ? 'active' : ''}`}
            onClick={() => onRegionChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="genre-filters">
        {GENRE_OPTIONS.map(genre => (
          <button
            key={genre}
            className={`filter-button ${genreFilter === genre ? 'active' : ''}`}
            onClick={() => onGenreChange(genre)}
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RankingFilterBar;