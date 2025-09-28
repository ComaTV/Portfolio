import { Scrollbar, ImageCard,Container } from 'mc-ui-comatv';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
const asPublic = (p) => {
  if (!p) return p;
  if (typeof p === 'string' && p.startsWith('/uploads/')) return `${API_BASE}${p}`;
  if (typeof p === 'string' && !p.startsWith('/') && !p.startsWith('http')) return `/${p}`;
  return p;
};

const ProjectsView = ({ projects }) => {
  const navigate = useNavigate();
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
        {[...projects]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map((project) => {
          let iconImages = project.technologies.map(tech =>
            `techno/${tech.name.toLowerCase().replace('.', '').replace(' ', '')}.webp`
          );
          
          if (project.special) {
            iconImages = ['techno/special.webp', ...iconImages];
          }
          
          return (
            <ImageCard
              key={project.id}
              imageSrc={asPublic(project.image)}
              label={project.title}
              description={project.description.length > 100 ? `${project.description.substring(0, 100)}...` : project.description}
              iconImages={iconImages}
              onClick={() => navigate(`/projects/${project.id}`)}
            />
          );
        })}
      </Scrollbar>
    </Container>
  );
};

export default ProjectsView;
