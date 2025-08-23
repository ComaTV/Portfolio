import React, { useEffect, useRef } from 'react';
import { Container } from 'mc-ui-comatv';
import { projectsData, profileData } from '../../server/data.jsx';
import * as skinview3d from 'skinview3d';

const ProfileInfo = () => {
  const skinViewerRef = useRef(null);
  const canvasRef = useRef(null);

  const socialArray = Array.isArray(profileData.social) ? profileData.social : [];
  const iconPathFor = (name) => {
    const key = String(name || '').toLowerCase().replace(/\s+/g, '').replace(/\./g, '');
    return `techno/${key}.webp`;
  };

  useEffect(() => {
    if (canvasRef.current && !skinViewerRef.current) {
      try {
        skinViewerRef.current = new skinview3d.SkinViewer({
          canvas: canvasRef.current,
          width: 300,
          height: 400,
          skin: `https://mc-heads.net/skin/${profileData.name}`
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
    <div className="w-full">
      <Container>
        <div className="flex flex-col-reverse md:flex-row items-start md:space-x-6 space-y-6 md:space-y-0 w-full">
          <div className="w-full md:flex-1 flex flex-col space-y-4">
            <div className="flex items-start space-x-4">
              <div className="relative">
                <div className="w-24 h-24 bg-black p-0.5">
                  <img src={profileData.avatar} alt={profileData.name} className="w-full h-full object-cover" />
                </div>
                {profileData.status && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 border-2 border-green-300"></div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl text-white mb-1">{profileData.name}</h1>
                <p className={`text-sm ${profileData.status ? 'text-green-500' : 'text-red-500'}`}>
                  {profileData.status ? 'Online' : 'Offline'}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                  <span className="flex items-center space-x-1">
                    <img src="techno/internet.webp" alt="Location" className="w-4 h-4 object-contain" />
                    <span>{profileData.location}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <img src="techno/chest.webp" alt="Experience" className="w-4 h-4 object-contain" />
                    <span>{profileData.experience}</span>
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-300 break-words">{profileData.description}</p>
            <div className="flex items-center justify-start gap-3 flex-wrap">
              {socialArray.map((s, i) => {
                const isUrl = !!(s?.link && /^https?:\/\//i.test(s.link));
                const iconSrc = iconPathFor(s?.name);
                const iconImg = (
                  <img
                    src={iconSrc}
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'techno/internet.webp'; }}
                    alt={s?.name || 'link'}
                    className="w-5 h-5 object-contain"
                    title={s?.name}
                  />
                );
                return (
                  <span key={i} className="flex items-center gap-1 text-xs text-gray-300">
                    {isUrl ? (
                      <a href={s.link} target="_blank" rel="noopener noreferrer" className="hover:opacity-90" title={s?.name}>
                        {iconImg}
                      </a>
                    ) : (
                      <>{iconImg}</>
                    )}
                    {!isUrl && s?.link ? <span>{s.link}</span> : null}
                  </span>
                );
              })}
            </div>
            <div className="border-t border-gray-600"/>
            <div>
              <h3 className="text-sm text-white mb-2">Technologies I use:</h3>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const allTechnologies = projectsData.flatMap(project => project.technologies);
                  const uniqueTechnologies = [...new Set(allTechnologies.map(tech => tech.name))];
                  return uniqueTechnologies.map((techName) => {
                    const iconSrc = `techno/${techName.toLowerCase().replace('.', '').replace(' ', '')}.webp`;
                    return (
                      <img 
                        key={techName}
                        src={iconSrc} 
                        alt={techName} 
                        className="w-6 h-6 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    );
                  });
                })()}
              </div>
            </div>
            <div>
              <h3 className="text-sm text-white mb-2">Platforms I develop on:</h3>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  // Default mapping for backward compatibility when project.category is a string
                  const defaultCategoryColors = {
                    'Web Development': 'cyan',
                    'Mobile App': 'white',
                    'Desktop App': 'blue',
                    'Minecraft Java': 'orange',
                    'Minecraft Bedrock': 'green',
                    'Discord Bot': 'purple',
                  };

                  // Normalize categories to { name, color }
                  const normalized = projectsData.map((project) => {
                    const cat = project.category;
                    if (cat && typeof cat === 'object') return { name: cat.name, color: cat.color };
                    const name = cat || 'Unknown';
                    const color = defaultCategoryColors[name] || 'gray';
                    return { name, color };
                  });
                  const uniqueByName = Array.from(new Map(normalized.map(c => [c.name, c])).values());
                  return uniqueByName.map(({ name, color }) => {
                    const colorClass = {
                      cyan: 'text-cyan-400',
                      white: 'text-gray-200',
                      blue: 'text-blue-400',
                      orange: 'text-amber-400',
                      green: 'text-green-400',
                      purple: 'text-purple-400',
                      yellow: 'text-yellow-400',
                      gray: 'text-gray-400',
                    }[color] || 'text-gray-300';
                    return (
                      <span key={name} className={`flex items-center gap-1 rounded ${colorClass}`}>
                        <span className="text-xs font-medium">{name}</span>
                      </span>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
          <Container 
            variant="transparent" 
            className="flex justify-center w-full mb-6 md:mb-0 md:ml-6 md:w-auto md:justify-start" 
            style={{ minWidth: 300 }}
          >
            <canvas ref={canvasRef} className="mx-auto"/>
          </Container>
        </div>
      </Container>
    </div>
  );
};

export default ProfileInfo; 