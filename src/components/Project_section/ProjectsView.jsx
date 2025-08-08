import { Scrollbar, ImageCard,Container } from 'mc-ui-comatv';

const ProjectsView = ({ projects }) => {
  return (
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
        {projects.map((project) => {
          let iconImages = project.technologies.map(tech =>
            `techno/${tech.name.toLowerCase().replace('.', '').replace(' ', '')}.webp`
          );
          
          if (project.special) {
            iconImages = ['techno/special.webp', ...iconImages];
          }
          
          return (
            <ImageCard
              key={project.id}
              imageSrc={project.image}
              label={project.title}
              description={project.description}
              iconImages={iconImages}
              onClick={() => alert(`Ai selectat proiectul: ${project.title}`)}
            />
          );
        })}
      </Scrollbar>
    </Container>
  );
};

export default ProjectsView;
