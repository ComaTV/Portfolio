import { Scrollbar, ImageCard } from 'mc-ui-comatv';

const ProjectsView = ({ projects }) => {
  return (
    <div className="max-w-[80%]">
      <Scrollbar height="95vh" variant="vertical" grid={true} gridCols={3}>
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
    </div>
  );
};

export default ProjectsView;
