import React from 'react';
import PropTypes from 'prop-types';
import { toPublicUrl } from './apiClient';

const CollaboratorCard = ({ collaborator, href, onClick }) => {
  if (!collaborator) return null;
  const { title, description, image } = collaborator;
  const clickable = Boolean(href || onClick);

  const content = (
    <div className={`relative w-[90%] max-w-md mx-auto h-48 border-white border-2 ${clickable ? 'cursor-pointer' : ''}`}>
      <img
        src={toPublicUrl(image)}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      <div className="absolute inset-0 p-4 flex flex-col justify-end">
        <h3 className="minecraft-ten text-white text-2xl">{title}</h3>
        <p className="minecraft-font text-gray-200">{description.length > 100 ? `${description.substring(0, 100)}...` : description}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className="block group">
        {content}
      </a>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="block w-full text-left group">
        {content}
      </button>
    );
  }
  return content;
};

CollaboratorCard.propTypes = {
  collaborator: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    image: PropTypes.string.isRequired,
    social: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      link: PropTypes.string,
    })),
  }),
  href: PropTypes.string,
  onClick: PropTypes.func,
};

export default CollaboratorCard;