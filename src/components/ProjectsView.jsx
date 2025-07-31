import { Scrollbar, ImageCard } from 'mc-ui-comatv';

const ProjectsView = ({ projects }) => {
  return (
      <Scrollbar height="95vh" width="80%"  variant="vertical" grid={true} gridCols={3}>
        {projects.map((project) => (
          <ImageCard
            key={project.id}
            imageSrc={project.image}
            label={project.title}
            description={project.description}
            iconImages={project.technologies.map(tech =>
              `techno/${tech.toLowerCase().replace('.', '').replace(' ', '')}.webp`
            )}
            onClick={() => alert(`Ai selectat proiectul: ${project.title}`)}
          />
        ))}
      </Scrollbar>
  );
};

export default ProjectsView;
