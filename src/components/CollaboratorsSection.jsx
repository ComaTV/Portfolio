import { Scrollbar, ImageCard,Container } from 'mc-ui-comatv';
import { collaborators } from '../server/data';
import { useNavigate } from 'react-router-dom';

const CollaboratorsSection = () => {
  const navigate = useNavigate();
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
                imageSrc={c.image}
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
