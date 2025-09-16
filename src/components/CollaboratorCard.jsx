import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { toPublicUrl } from './apiClient';

function useExistingIcons(social) {
  const [existingIcons, setExistingIcons] = useState([]);

  useEffect(() => {
    let mounted = true;
    const checkImageExists = (url) => {
      return new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });
    };

    (async () => {
      const icons = [];
      for (const s of social || []) {
        const key = String(s?.name || '').toLowerCase().replace(/\s+/g, '').replace(/\./g, '');
        const icon = key ? `techno/${key}.webp` : 'techno/internet.webp';
        const url = toPublicUrl(icon);
        if (await checkImageExists(url)) {
          icons.push({ ...s, iconUrl: url });
        }
      }
      if (mounted) setExistingIcons(icons);
    })();

    return () => { mounted = false; };
  }, [social]);

  return existingIcons;
}

const CollaboratorCard = ({ collaborator, href, onClick }) => {
  const existingIcons = useExistingIcons(social); 
  
  if (!collaborator) return null;
  const { title, description, image, social } = collaborator;
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
        {existingIcons.length > 0 && (
          <div className="mt-3 flex items-center gap-4">
            {existingIcons.map((s, i) => {
              const isUrl = typeof s?.link === 'string' && /^https?:\/\//i.test(s.link);
              const img = (
                <img
                  src={s.iconUrl}
                  alt={s?.name || 'link'}
                  className="h-6 w-6 object-contain"
                  title={s?.name}
                />
              );
              return isUrl ? (
                <a key={`${s.iconUrl}-${i}`} href={s.link} target="_blank" rel="noreferrer" aria-label={s?.name || 'link'}>
                  {img}
                </a>
              ) : (
                <span key={`${s.iconUrl}-${i}`} aria-label={s?.name || 'text'} title={s?.link || ''}>
                  {img}
                </span>
              );
            })}
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
    social: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      link: PropTypes.string,
    })),
  }),
  href: PropTypes.string,
  onClick: PropTypes.func,
};

export default CollaboratorCard;