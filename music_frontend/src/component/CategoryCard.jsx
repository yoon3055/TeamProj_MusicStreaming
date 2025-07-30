// src/component/CategoryCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import '../styles/CategoryCard.css';

const CategoryCard = ({ item, type }) => {
  const imageUrl = type === 'genre' ? item.imageUrl : item.profileImageUrl;
  const title = item.name || item.title;
  const subtitle = type === 'artist' ? item.genre : null;

  return (
    <div className="category-card">
      <img src={imageUrl} alt={title} className="category-card-image" />
      <div className="category-card-overlay"></div>
      <div className="category-card-title">{title}</div>
      {subtitle && <div className="category-card-subtitle">{subtitle}</div>}
    </div>
  );
};

CategoryCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    title: PropTypes.string,
    imageUrl: PropTypes.string,
    profileImageUrl: PropTypes.string,
    genre: PropTypes.string,
  }).isRequired,
  type: PropTypes.oneOf(['genre', 'artist']).isRequired,
};

export default CategoryCard;