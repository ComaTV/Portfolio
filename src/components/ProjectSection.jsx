import React, { useState, useMemo } from 'react';
import TechTogglePanel from './TechTogglePanel';
import CategoryTogglePanel from './CategoryTogglePanel';
import ProjectsView from './ProjectsView';
import { projectsData } from '../server/data';

const allTechnologies = Array.from(
  new Set(projectsData.flatMap(project => project.technologies))
).map(tech => ({
  label: tech,
  icon: `techno/${tech.toLowerCase().replace('.', '').replace(' ', '')}.webp`
}));

// Adaugă categoria "Special" la începutul listei
const allCategories = ['Special', ...Array.from(
  new Set(projectsData.map(project => project.category))
)];

const ProjectSection = () => {
  const [selectedTechs, setSelectedTechs] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Funcție pentru a calcula tehnologiile disponibile bazate pe categoriile selectate
  const availableTechnologies = useMemo(() => {
    if (selectedCategories.length === 0) {
      return allTechnologies;
    }
    
    const techsInSelectedCategories = new Set();
    projectsData.forEach(project => {
      // Verifică dacă proiectul este în categoria selectată sau dacă este special și categoria "Special" este selectată
      const isInSelectedCategory = selectedCategories.includes(project.category);
      const isSpecialAndSpecialSelected = project.special && selectedCategories.includes('Special');
      
      if (isInSelectedCategory || isSpecialAndSpecialSelected) {
        project.technologies.forEach(tech => techsInSelectedCategories.add(tech));
      }
    });
    
    return allTechnologies.filter(tech => techsInSelectedCategories.has(tech.label));
  }, [selectedCategories]);

  // Funcție pentru a calcula categoriile disponibile bazate pe tehnologiile selectate
  const availableCategories = useMemo(() => {
    if (selectedTechs.length === 0) {
      return allCategories;
    }
    
    const categoriesWithSelectedTechs = new Set();
    projectsData.forEach(project => {
      if (selectedTechs.some(tech => project.technologies.includes(tech))) {
        categoriesWithSelectedTechs.add(project.category);
        if (project.special) {
          categoriesWithSelectedTechs.add('Special');
        }
      }
    });
    
    return allCategories.filter(category => categoriesWithSelectedTechs.has(category));
  }, [selectedTechs]);

  const handleTechToggleChange = (tech, isChecked) => {
    setSelectedTechs(prev => {
      const newSelectedTechs = isChecked ? [...prev, tech] : prev.filter(t => t !== tech);
      
      // Dacă nu mai sunt tehnologii selectate, resetează și categoriile
      if (newSelectedTechs.length === 0) {
        setSelectedCategories([]);
      }
      
      return newSelectedTechs;
    });
  };

  const handleCategoryToggleChange = (category, isChecked) => {
    setSelectedCategories(prev => {
      const newSelectedCategories = isChecked ? [...prev, category] : prev.filter(c => c !== category);
      
      // Dacă nu mai sunt categorii selectate, resetează și tehnologiile
      if (newSelectedCategories.length === 0) {
        setSelectedTechs([]);
      }
      
      return newSelectedCategories;
    });
  };

  const filteredProjects = projectsData.filter(project => {
    const matchesTech = selectedTechs.length === 0 || 
      selectedTechs.some(tech => project.technologies.includes(tech));
    
    const matchesCategory = selectedCategories.length === 0 || 
      selectedCategories.includes(project.category) ||
      (project.special && selectedCategories.includes('Special'));
    
    return matchesTech && matchesCategory;
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-full w-full p-4 gap-4">
      <div className="lg:hidden flex flex-col gap-4">
        <CategoryTogglePanel
          allCategories={availableCategories}
          selectedCategories={selectedCategories}
          onToggleChange={handleCategoryToggleChange}
        />
        <TechTogglePanel
          allTechnologies={availableTechnologies}
          selectedTechs={selectedTechs}
          onToggleChange={handleTechToggleChange}
        />
      </div>
      
      <div className="hidden lg:flex lg:flex-row gap-4 w-full">
        <TechTogglePanel
          allTechnologies={availableTechnologies}
          selectedTechs={selectedTechs}
          onToggleChange={handleTechToggleChange}
        />
        <div className="flex-1">
          <ProjectsView projects={filteredProjects} />
        </div>
        <CategoryTogglePanel
          allCategories={availableCategories}
          selectedCategories={selectedCategories}
          onToggleChange={handleCategoryToggleChange}
        />
      </div>
      <div className="lg:hidden">
        <ProjectsView projects={filteredProjects} />
      </div>
    </div>
  );
};

export default ProjectSection; 