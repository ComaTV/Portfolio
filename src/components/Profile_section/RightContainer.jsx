import React, { useState } from 'react';
import { Container, Button } from 'mc-ui-comatv';

const RightContainer = () => {
  const [activeTab, setActiveTab] = useState('newProjects');
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);

  // Mock data for projects
  const projectsData = [
    {
      id: 1,
      title: "Minecraft Adventure",
      image: "/public/panorama/panorama_0.png",
      description: "An epic adventure in a fantasy world with dragons and castles",
      rating: 4.8,
      price: 1200
    },
    {
      id: 2,
      title: "Dragon Quest",
      image: "/public/panorama/panorama_1.png", 
      description: "Explore mystical lands and battle fierce dragons",
      rating: 4.6,
      price: 950
    },
    {
      id: 3,
      title: "Castle Builder",
      image: "/public/panorama/panorama_2.png",
      description: "Build magnificent castles and fortresses",
      rating: 4.7,
      price: 800
    },
    {
      id: 4,
      title: "Nature Explorer",
      image: "/public/panorama/panorama_3.png",
      description: "Discover beautiful landscapes and hidden treasures",
      rating: 4.5,
      price: 650
    }
  ];

  const CustomImageCard = ({ project }) => (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 hover:border-gray-500 transition-colors max-w-md">
      <div className="relative">
        <img 
          src={project.image} 
          alt={project.title}
          className="w-full h-48 object-cover rounded mb-3"
        />
      </div>
      
      <h3 className="text-white font-bold text-lg mb-2">{project.title}</h3>
      <p className="text-gray-300 text-sm mb-3">{project.description}</p>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-1">
          <span className="text-yellow-400">★</span>
          <span className="text-white text-sm">{project.rating}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-yellow-400">🪙</span>
          <span className="text-white text-sm">{project.price}</span>
        </div>
      </div>
    </div>
  );

  const handlePrevious = () => {
    setCurrentProjectIndex((prev) => 
      prev === 0 ? projectsData.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentProjectIndex((prev) => 
      prev === projectsData.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <Container variant="transparent" className="h-[75vh] w-full">
      <div className="flex flex-col">
        {/* Tab Buttons */}
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

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'newProjects' && (
            <div className="flex items-center justify-between h-[70vh] w-full">
              {/* Previous Button */}
              <Button 
                label="‹"
                width={60}
                onClick={handlePrevious}
              />
              
              {/* Center ImageCard */}
              <CustomImageCard project={projectsData[currentProjectIndex]} />
              
              {/* Next Button */}
              <Button 
                label="›"
                width={60}                
                height={'90%'}
                onClick={handleNext}
              />
            </div>
          )}
          
          {activeTab === 'bigProjects' && (
            <div className="flex items-center justify-between h-[70vh] w-full">
              {/* Previous Button */}
              <Button 
                label="‹"
                width={60}
                height={'90%'}
                onClick={handlePrevious}
              />
              
              {/* Center ImageCard */}
              <CustomImageCard project={projectsData[currentProjectIndex]} />
              
              {/* Next Button */}
              <Button 
                label="›"
                width={60}
                height={'90%'}
                onClick={handleNext}
              />
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default RightContainer;
