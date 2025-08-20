import { Scrollbar, ImageCard,Container } from 'mc-ui-comatv';
import { collaborators } from '../server/data';

const CollaboratorsSection = () => {
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
            const social = c.social || {};
            const iconMap = {
              github: 'techno/github.webp',
              linkedin: 'techno/linkdl.webp',
              discord: 'techno/discord.webp',
              instagram: 'techno/instagram.webp',
              website: 'techno/internet.webp'
            };
            const iconImages = Object.keys(social)
              .filter((k) => iconMap[k])
              .map((k) => iconMap[k]);
            return (
              <ImageCard
                key={c.id}
                imageSrc={c.image}
                label={c.title}
                description={c.description}
                iconImages={iconImages}
                onClick={() => alert(`Colaborare: ${c.title}`)}
              />
            );
          })}
        </Scrollbar>
      </Container>
    </div>
  );
};

export default CollaboratorsSection;
