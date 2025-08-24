import { Scrollbar, ImageCard,Container } from 'mc-ui-comatv';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
const asPublic = (p) => {
  if (!p) return p;
  if (typeof p === 'string' && p.startsWith('/uploads/')) return `${API_BASE}${p}`;
  if (typeof p === 'string' && !p.startsWith('/') && !p.startsWith('http')) return `/${p}`;
  return p;
};

const CollaboratorsSection = () => {
  const navigate = useNavigate();
  const [collaborators, setCollaborators] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/collaborators');
        const json = res.ok ? await res.json() : [];
        if (!mounted) return;
        setCollaborators(Array.isArray(json) ? json : []);
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
          {collaborators.map((c) => {
            const socialArr = Array.isArray(c.social) ? c.social : [];
            const iconPathFor = (name) => {
              const key = String(name || '').toLowerCase().replace(/\s+/g, '').replace(/\./g, '');
              return `techno/${key}.webp`;
            };
            const iconImages = socialArr
              .map((s) => iconPathFor(s?.name))
              .filter(Boolean);
            return (
              <ImageCard
                key={c.id}
                imageSrc={asPublic(c.image)}
                label={c.title}
                description={c.description}
                iconImages={iconImages}
                onClick={() => navigate(`/collaborators/${c.id}`)}
              />
            );
          })}
        </Scrollbar>
      </Container>
    </div>
  );
};

export default CollaboratorsSection;
