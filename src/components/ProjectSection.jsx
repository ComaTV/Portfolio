import React, { useState, useMemo, useEffect } from 'react';
import { Api } from './apiClient';
import TechTogglePanel from './Project_section/TechTogglePanel';
import CategoryTogglePanel from './Project_section/CategoryTogglePanel';
import ProjectsView from './Project_section/ProjectsView';
// Data now fetched from backend

function buildAllTechnologies(projectsData) {
  return Array.from(
    new Set((projectsData || []).flatMap(project => (project.technologies || []).map(tech => tech.name)))
  ).map(techName => ({
    label: techName,
    icon: `techno/${techName.toLowerCase().replace('.', '').replace(' ', '')}.webp`
  }));
}

function buildAllCategories(projectsData) {
  return ['Special', ...Array.from(
    new Set((projectsData || []).map(project => (typeof project.category === 'object' ? project.category.name : project.category)))
  )];
}

const ProjectSection = () => {
  const [selectedTechs, setSelectedTechs] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [projectsData, setProjectsData] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const json = await Api.getProjects().catch(() => []);
        if (!mounted) return;
        setProjectsData(Array.isArray(json) ? json : []);
      } catch {
        if (!mounted) return;
        setProjectsData([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const availableTechnologies = useMemo(() => {
    const allTechnologies = buildAllTechnologies(projectsData);
    if (selectedCategories.length === 0) {
      return allTechnologies;
    }
    const techsInSelectedCategories = new Set();
    (projectsData || []).forEach(project => {
      const catName = typeof project.category === 'object' ? project.category.name : project.category;
      const isInSelectedCategory = selectedCategories.includes(catName);
      const isSpecialAndSpecialSelected = project.special && selectedCategories.includes('Special');
      if (isInSelectedCategory || isSpecialAndSpecialSelected) {
        project.technologies.forEach(tech => techsInSelectedCategories.add(tech.name));
      }
    });

    return allTechnologies.filter(tech => techsInSelectedCategories.has(tech.label));
  }, [selectedCategories, projectsData]);

  const availableCategories = useMemo(() => {
    const allCategories = buildAllCategories(projectsData);
    if (selectedTechs.length === 0) {
      return allCategories;
    }
    const categoriesWithSelectedTechs = new Set();
    (projectsData || []).forEach(project => {
      if (selectedTechs.some(tech => project.technologies.some(projectTech => projectTech.name === tech))) {
        const catName = typeof project.category === 'object' ? project.category.name : project.category;
        categoriesWithSelectedTechs.add(catName);
        if (project.special) {
          categoriesWithSelectedTechs.add('Special');
        }
      }
    });

    return allCategories.filter(category => categoriesWithSelectedTechs.has(category));
  }, [selectedTechs, projectsData]);

  const handleTechToggleChange = (tech, isChecked) => {
    setSelectedTechs(prev => {
      const newSelectedTechs = isChecked ? [...prev, tech] : prev.filter(t => t !== tech);
      if (newSelectedTechs.length === 0) {
        setSelectedCategories([]);
      }
      return newSelectedTechs;
    });
  };

  const handleCategoryToggleChange = (category, isChecked) => {
    setSelectedCategories(prev => {
      const newSelectedCategories = isChecked ? [...prev, category] : prev.filter(c => c !== category);
      if (newSelectedCategories.length === 0) {
        setSelectedTechs([]);
      }
      return newSelectedCategories;
    });
  };

  const filteredProjects = (projectsData || []).filter(project => {
    const matchesTech = selectedTechs.length === 0 || 
      selectedTechs.some(tech => project.technologies.some(projectTech => projectTech.name === tech));
    const catName = typeof project.category === 'object' ? project.category.name : project.category;
    const matchesCategory = selectedCategories.length === 0 || 
      selectedCategories.includes(catName) ||
      (project.special && selectedCategories.includes('Special'));
    return matchesTech && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col">
      
      <div className="w-full flex justify-center mt-40">
        <img 
          src="/text/Project.webp" 
          alt="Projects" 
          className="max-w-full h-auto"
        />
      </div>
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
    </div>
  );
};

export default ProjectSection;