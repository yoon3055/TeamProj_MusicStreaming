// src/component/GenreCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const GenreCard = ({ genre }) => {
  return (
    <Link to={`/genres/${genre.id}`} className="genre-card">
      <img src={genre.imageUrl || '/images/default.jpg'} alt={genre.name} className="genre-card-image" />
      <div className="genre-card-overlay">
        <h3 className="genre-card-title">{genre.name}</h3>
      </div>
    </Link>
  );
};

GenreCard.propTypes = {
  genre: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
  }).isRequired,
};

export default GenreCard;