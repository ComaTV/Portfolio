import React, { useState } from 'react';
import PanoramaBackground from './components/PanoramaBackground';
import TechTogglePanel from './components/TechTogglePanel';
import ProjectsView from './components/ProjectsView';
import { projectsData } from './server/data';

const allTechnologies = Array.from(
  new Set(projectsData.flatMap(project => project.technologies))
).map(tech => ({
  label: tech,
  icon: `techno/${tech.toLowerCase().replace('.', '').replace(' ', '')}.webp`
}));

function App() {
  const [selectedTechs, setSelectedTechs] = useState([]);

  const handleToggleChange = (tech, isChecked) => {
    setSelectedTechs(prev =>
      isChecked ? [...prev, tech] : prev.filter(t => t !== tech)
    );
  };

  const filteredProjects = selectedTechs.length
    ? projectsData.filter(project =>
        selectedTechs.some(tech => project.technologies.includes(tech))
      )
    : projectsData;

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <PanoramaBackground />

      <div className="absolute inset-0 p-4 flex justify-between items-start gap-4">
        <TechTogglePanel
          allTechnologies={allTechnologies}
          selectedTechs={selectedTechs}
          onToggleChange={handleToggleChange}
        />
        <ProjectsView projects={filteredProjects} />
      </div>
    </div>
  );
}

export default App;
