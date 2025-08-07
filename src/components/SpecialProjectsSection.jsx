import React from 'react';
import { Container, Scrollbar, ImageCard } from 'mc-ui-comatv';
import { projectsData } from '../server/data';

const SpecialProjectsSection = () => {
  const specialProjects = projectsData.filter(project => project.special);

  return (
    <Container className="w-full">
      <h2 className="text-2xl text-white mb-6 minecraft-font">Special Projects</h2>
      <Scrollbar 
        height="400px" 
        width="100%" 
        variant="horizontal" 
        grid={true} 
        gridCols={1}
        className="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        style={{ gap: 0, padding: 0, margin: 0 }}
      >
        {specialProjects.map((project) => {
          let iconImages = project.technologies.map(tech =>
            `techno/${tech.name.toLowerCase().replace('.', '').replace(' ', '')}.webp`
          );
          
          // Adaugă iconița specială la început
          iconImages = ['techno/special.webp', ...iconImages];
          
          return (
            <ImageCard
              key={project.id}
              imageSrc={project.image}
              label={project.title}
              description={project.description}
              iconImages={iconImages}
              onClick={() => alert(`Ai selectat proiectul special: ${project.title}`)}
            />
          );
        })}
      </Scrollbar>
    </Container>
  );
};

export default SpecialProjectsSection;

