// src/component/FilterButtons.jsx
import React from 'react';
import PropTypes from 'prop-types';

import '../styles/FilterButtons.css'; // ✨ CSS 파일 임포트

const FilterButtons = ({ currentFilter, onFilterChange, filters }) => {
  return (
    <div className="filter-buttons-container"> {/* ✨ 클래스 적용 */}
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`
            filter-button
            ${currentFilter === filter.value ? 'filter-button-active' : ''} /* ✨ 클래스 적용 */
          `}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

FilterButtons.propTypes = {
  currentFilter: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  filters: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })).isRequired,
};

export default FilterButtons;