import { Scrollbar, ImageCard,Container } from 'mc-ui-comatv';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Api, toPublicUrl } from './apiClient';

const checkImageExists = (url) => {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

const CollaboratorsSection = () => {
  const navigate = useNavigate();
  const [collaborators, setCollaborators] = useState([]);
  const [iconsMap, setIconsMap] = useState({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const json = await Api.getCollaborators().catch(() => []);
        if (!mounted) return;
        setCollaborators(Array.isArray(json) ? json : []);
        // Check icons existence
        const icons = {};
        for (const c of json) {
          const socialArr = Array.isArray(c.social) ? c.social : [];
          icons[c.id] = [];
          for (const s of socialArr) {
            const key = String(s?.name || '').toLowerCase().replace(/\s+/g, '').replace(/\./g, '');
            const iconPath = `techno/${key}.webp`;
            const url = toPublicUrl(iconPath);
            // eslint-disable-next-line no-await-in-loop
            if (await checkImageExists(url)) {
              icons[c.id].push(iconPath);
            }
          }
        }
        if (mounted) setIconsMap(icons);
      } catch {
        if (!mounted) return;
        setCollaborators([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="w-full flex justify-center mt-40">
        <img 
          src="/text/collaborations.webp" 
          alt="collaborations" 
          className="max-w-full h-auto"
        />
      </div>
      <Container
        variant="transparent"
        className="flex-1 min-w-0"
      >
        <Scrollbar 
          height="75vh" 
          width="100%" 
          variant="vertical" 
          grid={true} 
          gridCols={1}
          className="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          style={{ gap: 0, padding: 0, margin: 0 }}
        >
          {collaborators.map((c) => (
            <ImageCard
              key={c.id}
              imageSrc={toPublicUrl(c.image)}
              label={c.title}
              description={c.description.length > 100 ? `${c.description.substring(0, 100)}...` : c.description}
              iconImages={(iconsMap[c.id] || []).map(toPublicUrl)}
              onClick={() => navigate(`/collaborators/${c.id}`)}
            />
          ))}
        </Scrollbar>
      </Container>
    </div>
  );
};

export default CollaboratorsSection;