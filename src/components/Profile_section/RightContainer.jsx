import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Container, Button } from 'mc-ui-comatv';
import { useNavigate } from 'react-router-dom';
import { Api, toPublicUrl } from '../apiClient';

const CustomImageCard = ({ project }) => {
  const navigate = useNavigate();
  let techIcons = (project.technologies || []).map((tech) => ({
    name: tech.name,
    src: `techno/${tech.name.toLowerCase().replace('.', '').replace(' ', '')}.webp`,
  }));

  if (project.special) {
    techIcons = [{ name: 'special', src: 'techno/special.webp' }, ...techIcons];
  }

  return (
    <div
      className="relative h-5/6 w-5/6 overflow-hidden cursor-pointer"
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <img
        src={toPublicUrl(project.image)}
        alt={project.title}
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      <div className="absolute inset-0 z-10 p-4 flex flex-col justify-between">
        <div className="flex flex-col items-start">
          <h3 className="minecraft-ten text-white text-3xl">{project.title}</h3>
          <p className="w-[30%] mt-1 text-lg">{project.description}</p>
          {project.date && (
            <span className="mt-2 text-green-500">
              {new Date(project.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })}
            </span>
          )}
        </div>

        <div className="mt-2">
          <div className="mb-2">
            <span className="text-xs text-gray-300 uppercase tracking-wide">Platform</span>
            <div className="mt-1">
              <span className="inline-block bg-gray-500 text-white text-xs px-2 py-1">
                {typeof project.category === 'object' ? (project.category?.name || '') : (project.category || '')}
              </span>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {techIcons.map((icon, index) => (
                <img
                  key={index}
                  src={icon.src}
                  alt={icon.name}
                  title={icon.name}
                  className="h-6 w-6 object-contain drop-shadow"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

CustomImageCard.propTypes = {
  project: PropTypes.shape({
    image: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    category: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({ name: PropTypes.string, color: PropTypes.string })
    ]),
    technologies: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
      })
    ),
  }).isRequired,
};

const RightContainer = () => {
  const [activeTab, setActiveTab] = useState('newProjects');
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
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

  const recentProjects = useMemo(() => {
    const now = new Date();
    const twoMonthsAgo = new Date(now);
    twoMonthsAgo.setMonth(now.getMonth() - 2);

    const sorted = [...projectsData]
      .filter(p => p.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const lastTwoMonths = sorted.filter(p => new Date(p.date) >= twoMonthsAgo);
    if (lastTwoMonths.length > 0) return lastTwoMonths;

    return sorted.slice(0, 5);
  }, [projectsData]);

  const bigProjects = useMemo(() => {
    return projectsData.filter(p => p.special);
  }, [projectsData]);

  const displayedProjects = activeTab === 'newProjects' ? recentProjects : bigProjects;

  useEffect(() => {
    setCurrentProjectIndex(0);
  }, [activeTab]);

  const handlePrevious = () => {
    if (displayedProjects.length === 0) return;
    setCurrentProjectIndex((prev) => (prev === 0 ? displayedProjects.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (displayedProjects.length === 0) return;
    setCurrentProjectIndex((prev) => (prev === displayedProjects.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="h-[75vh] w-full">
      <div className="flex flex-col">
        <div className="flex space-x-4">
          <Button 
            label="New Projects" 
            width={150} 
            height={45} 
            font={activeTab === 'newProjects' ? 'MinecraftTen' : 'MinecraftRegular'}
            variant="green"
            onClick={() => setActiveTab('newProjects')} 
          />
          <Button 
            label="Big Projects" 
            width={150} 
            height={45} 
            font={activeTab === 'bigProjects' ? 'MinecraftTen' : 'MinecraftRegular'}
            variant="purple"
            onClick={() => setActiveTab('bigProjects')} 
          />
        </div>
        <Container variant="transparent" className="flex-1 overflow-y-auto">
          {activeTab === 'newProjects' && (
            <div className="flex items-center justify-between h-[70vh] w-full">
              <Button 
                variant="green"
                label="‹"
                width={60}       
                height={'90%'}
                onClick={handlePrevious}
              />
              {displayedProjects.length > 0 ? (
                <CustomImageCard project={displayedProjects[currentProjectIndex]} />
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">No projects</div>
              )}
              <Button 
                variant="green"
                label="›"
                width={60}                
                height={'90%'}
                onClick={handleNext}
              />
            </div>
          )}
          
          {activeTab === 'bigProjects' && (
            <div className="flex items-center justify-between h-[70vh] w-full">
              <Button
                variant="purple"
                label="‹"
                width={60}
                height={'90%'}
                onClick={handlePrevious}
              />
              {displayedProjects.length > 0 ? (
                <CustomImageCard project={displayedProjects[currentProjectIndex]} />
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">No big projects</div>
              )}
              <Button 
                variant="purple"
                label="›"
                width={60}
                height={'90%'}
                onClick={handleNext}
              />
            </div>
          )}
        </Container>
      </div>
    </div>
  );
};

export default RightContainer;
