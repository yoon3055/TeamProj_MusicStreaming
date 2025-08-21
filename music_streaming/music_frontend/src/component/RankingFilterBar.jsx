import React, { useRef } from 'react';
import '../styles/RankingPage.css';

const REGION_OPTIONS = [
  { label: '종합', value: 'all' },
  { label: '국내', value: 'domestic' },
  { label: '해외', value: 'international' },
];

const GENRE_OPTIONS = [
  'all', '발라드', '댄스', '힙합', '재즈', '락', '트로트', '팝', 'R&B', '클래식', 'EDM', '컨트리', '레게'
];

const RankingFilterBar = ({ genreFilter, regionFilter, onGenreChange, onRegionChange }) => {
  const genreRef = useRef(null);

  const currentIndex = GENRE_OPTIONS.indexOf(genreFilter);

  const scrollLeft = () => {
    if (currentIndex > 0) {
      onGenreChange(GENRE_OPTIONS[currentIndex - 1]);
    }
  };

  const scrollRight = () => {
    if (currentIndex < GENRE_OPTIONS.length - 1) {
      onGenreChange(GENRE_OPTIONS[currentIndex + 1]);
    }
  };

  return (
    <div className="ranking-filter-container">
      <div className="genre-filter-wrapper">
        <button
          className="scroll-btn left"
          onClick={scrollLeft}
          aria-label="이전 장르"
          disabled={currentIndex === 0}
        >
          &#8592;
        </button>

        <div className="genre-filter-scroll" ref={genreRef}>
          {GENRE_OPTIONS.map((genre) => (
            <button
              key={genre}
              className={`filter-button ${genreFilter === genre ? 'active' : ''}`}
              onClick={() => onGenreChange(genre)}
            >
              {genre === 'all' ? '전체 장르' : genre}
            </button>
          ))}
        </div>

        <button
          className="scroll-btn right"
          onClick={scrollRight}
          aria-label="다음 장르"
          disabled={currentIndex === GENRE_OPTIONS.length - 1}
        >
          &#8594;
        </button>
      </div>

      <div className="region-filter-group">
        {REGION_OPTIONS.map((region) => (
          <button
            key={region.value}
            className={`filter-button region-button ${regionFilter === region.value ? 'active' : ''}`}
            onClick={() => onRegionChange(region.value)}
          >
            {region.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RankingFilterBar;
