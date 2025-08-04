import React, { useEffect, useRef } from 'react';
import { Container } from 'mc-ui-comatv';
import { projectsData, profileData } from '../server/data.jsx';
import * as skinview3d from 'skinview3d';

const ProfileInfo = () => {
  const skinViewerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && !skinViewerRef.current) {
      try {
        skinViewerRef.current = new skinview3d.SkinViewer({
          canvas: canvasRef.current,
          width: 300,
          height: 400,
          skin: "https://mc-heads.net/skin/ComaTV"
        });

        skinViewerRef.current.animation = new skinview3d.IdleAnimation();
        skinViewerRef.current.animation.speed = 2;
        skinViewerRef.current.zoom = 0.8;
        skinViewerRef.current.fov = 60;
      } catch (error) {
        console.error('Error initializing skin viewer:', error);
      }
    }

    return () => {
      skinViewerRef.current = null;
    };
  }, []);

  return (
    <div>
      <Container>
        <div className="flex items-start space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-black p-0.5">
              <img src={profileData.avatar} alt={profileData.name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 border-2 border-green-300"></div>
          </div>
          <div className="flex-1">
            <div className="mb-4">
              <h1 className="text-2xl text-white mb-1">{profileData.name}</h1>
              <p className="text-sm text-gray-400">{profileData.status}</p>
              <p className="text-sm text-gray-300 mt-1">{profileData.description}</p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                <span>📍 {profileData.location}</span>
                <span>💼 {profileData.experience}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <canvas ref={canvasRef}/>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-600">
          <h3 className="text-lg text-white mb-3">Specialization</h3>
          <p className="text-sm text-gray-300 mb-4">{profileData.specialization}</p>
          
          <h3 className="text-lg text-white mb-3">Technologies</h3>
          <div className="flex flex-wrap gap-3">
            {(() => {
              const allTechnologies = projectsData.flatMap(project => project.technologies);
              const uniqueTechnologies = [...new Set(allTechnologies)];
              
              return uniqueTechnologies.map((tech) => {
                const iconSrc = `techno/${tech.toLowerCase().replace('.', '').replace(' ', '')}.webp`;
                return (
                  <img 
                    key={tech}
                    src={iconSrc} 
                    alt={tech} 
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                );
              });
            })()}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ProfileInfo; 