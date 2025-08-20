import React from 'react';
import PropTypes from 'prop-types';

const CollaboratorCard = ({ collaborator, href, onClick }) => {
  if (!collaborator) return null;
  const { title, description, image, social } = collaborator;

  const asPublic = (p) => (typeof p === 'string' && !p.startsWith('/') && !p.startsWith('http') ? `/${p}` : p);

  const clickable = Boolean(href || onClick);
  const content = (
      <div className={`relative w-[90%] max-w-md mx-auto h-48 border-white border-2 ${clickable ? 'cursor-pointer' : ''}`}>
        <img
          src={asPublic(image)}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 p-4 flex flex-col justify-end">
          <h3 className="minecraft-ten text-white text-2xl">{title}</h3>
          <p className="minecraft-font text-gray-200">{description}</p>
          {social && (
            <div className="mt-3 flex items-center gap-4">
              {social.github && (
                <a href={social.github} target="_blank" rel="noreferrer" aria-label="GitHub">
                  <img src={asPublic('techno/github.webp')} alt="GitHub" className="h-6 w-6 object-contain" />
                </a>
              )}
              {social.linkedin && (
                <a href={social.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                  <img src={asPublic('techno/linkdl.webp')} alt="LinkedIn" className="h-6 w-6 object-contain" />
                </a>
              )}
              {social.discord && (
                typeof social.discord === 'string' && social.discord.startsWith('http') ? (
                  <a href={social.discord} target="_blank" rel="noreferrer" aria-label="Discord">
                    <img src={asPublic('techno/discord.webp')} alt="Discord" className="h-6 w-6 object-contain" />
                  </a>
                ) : (
                  <span aria-label="Discord" title={typeof social.discord === 'string' ? social.discord : 'Discord'}>
                    <img src={asPublic('techno/discord.webp')} alt="Discord" className="h-6 w-6 object-contain" />
                  </span>
                )
              )}
            </div>
          )}
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
    social: PropTypes.shape({
      github: PropTypes.string,
      linkedin: PropTypes.string,
      discord: PropTypes.string,
    }),
  }),
  href: PropTypes.string,
  onClick: PropTypes.func,
};

export default CollaboratorCard;
