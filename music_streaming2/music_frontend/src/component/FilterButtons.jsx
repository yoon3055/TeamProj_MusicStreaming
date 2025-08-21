// src/component/FilterButtons.jsx
import React from 'react';
import PropTypes from 'prop-types';

import '../styles/FilterButtons.css'; // ✨ CSS 파일 임포트

const FilterButtons = ({ currentFilter, onFilterChange, filters }) => (
  <div className="filter-buttons-container">
    {filters.map(filter => (
      <button
        key={filter.value}
        className={`filter-button ${currentFilter === filter.value ? 'active' : ''}`}
        onClick={() => onFilterChange(filter.value)}
      >
        {filter.label}
      </button>
    ))}
  </div>
);
FilterButtons.propTypes = {
  currentFilter: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })
  ).isRequired,
};
export default FilterButtons;