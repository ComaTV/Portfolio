import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collaborators, projectsData } from '../server/data';
import { Container, Button, ImageCard, Scrollbar } from 'mc-ui-comatv';

const CollaboratorDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const collabId = Number(id);

  const [mediaIndex, setMediaIndex] = useState(0);

  const collaborator = useMemo(() => collaborators.find(c => c.id === collabId), [collabId]);

  if (!collaborator) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Colaboratorul nu a fost găsit.</p>
          <Button label="Back" variant="green" width={140} height={44} onClick={() => navigate('/')} />
        </div>
      </div>
    );
  }

  const social = collaborator.social || {};
  const socialEntries = Object.entries(social)
    .filter(([, url]) => typeof url === 'string' && url.trim().length > 0);

  const projects = projectsData.filter(p => p.collaboration === collaborator.title);

  const openUrl = (url) => window.open(url, '_blank', 'noreferrer');
  const asPublic = (p) => (typeof p === 'string' && !p.startsWith('/') && !p.startsWith('http') ? `/${p}` : p);

  // Build media array similar to ProjectDetail (fallback to single image)
  const media = Array.isArray(collaborator.media) && collaborator.media.length > 0
    ? collaborator.media
    : [collaborator.image].filter(Boolean);

  const handlePrev = () => {
    if (media.length === 0) return;
    setMediaIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };
  const handleNext = () => {
    if (media.length === 0) return;
    setMediaIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative h-full w-full overflow-auto">
      <div className="absolute top-4 left-4 z-20">
        <Button label="< Back" variant="green" width={140} height={44} onClick={() => navigate(-1)} />
      </div>

      <div className="w-full h-full flex items-start justify-center pt-20 px-4">
        <Container className="w-full ">
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 flex flex-col gap-4">

              {/* Media carousel (same style as ProjectDetail) */}
              <Container variant="dark">
                <div className="flex items-center justify-between h-[60vh] w-full">
                  <Button 
                    variant="green"
                    label="‹"
                    width={60}
                    height={'90%'}
                    onClick={handlePrev}
                  />
                  <div className="relative h-[90%] w-[80%] overflow-hidden border-2 border-white">
                    <img
                      src={asPublic(media[mediaIndex])}
                      alt={`${collaborator.title} - media ${mediaIndex + 1}`}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  </div>
                  <Button 
                    variant="green"
                    label="›"
                    width={60}
                    height={'90%'}
                    onClick={handleNext}
                  />
                </div>
              </Container>
            </div>

            <Container variant="dark" className="flex flex-col justify-between h-full">
              {/* Top: Social buttons + meta */}
              <div>
                
                <div className="flex flex-col gap-2 pb-4">
                  <h1 className="minecraft-ten text-3xl text-white">{collaborator.title}</h1>
                </div>
                {collaborator.date && (
                  <span className="minecraft-font text-green-500">
                    {new Date(collaborator.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })}
                  </span>
                )}
                {collaborator.description && (
                  <p className="text-gray-200 text-sm leading-relaxed mt-2 pb-4">{collaborator.description}</p>
                )}
                {socialEntries.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {socialEntries.map(([name, url]) => (
                      <Button
                        key={name}
                        label={name.charAt(0).toUpperCase() + name.slice(1)}
                        variant="purple"
                        onClick={() => openUrl(url)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom: Title image + projects list */}
             
            </Container>
          </div>
        </Container>
        
      </div>
      <div>
                {projects.length > 0 && (
                  <div className="mt-4">
                    <div className="w-full flex justify-center mb-2">
                      <img src="/text/Project.webp" alt="Projects" className="max-w-full h-auto" />
                    </div>
                    <Container variant="transparent">
                      <Scrollbar 
                        height="40vh" 
                        width="100%" 
                        variant="vertical"
                        grid
                        gridCols={1}
                        className="sm:grid-cols-2"
                        style={{ gap: 0, padding: 0, margin: 0 }}
                      >
                        {projects.map((p) => (
                          <ImageCard
                            key={p.id}
                            imageSrc={asPublic(p.image)}
                            label={p.title}
                            description={p.description}
                            onClick={() => navigate(`/projects/${p.id}`)}
                          />
                        ))}
                      </Scrollbar>
                    </Container>
                  </div>
                )}
              </div>
    </div>
  );
};

export default CollaboratorDetail;
