import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Button } from 'mc-ui-comatv';
import CollaboratorCard from './CollaboratorCard';

const ProjectDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const projectId = Number(id);

  const [projectsData, setProjectsData] = useState([]);
  const [collaboratorsData, setCollaboratorsData] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [pRes, cRes] = await Promise.all([fetch('/projects'), fetch('/collaborators')]);
        const [pJson, cJson] = await Promise.all([
          pRes.ok ? pRes.json() : [],
          cRes.ok ? cRes.json() : []
        ]);
        if (!mounted) return;
        setProjectsData(Array.isArray(pJson) ? pJson : []);
        setCollaboratorsData(Array.isArray(cJson) ? cJson : []);
      } catch {
        if (!mounted) return;
        setProjectsData([]);
        setCollaboratorsData([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const project = useMemo(() => (projectsData || []).find(p => p.id === projectId), [projectId, projectsData]);
  // Hooks must not be after an early return
  const [mediaIndex, setMediaIndex] = useState(0);

  if (!project) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Proiectul nu a fost găsit.</p>
          <Button label="Back" variant="green" width={140} height={44} onClick={() => navigate('/')} />
        </div>
      </div>
    );
  }

  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
  const asPublic = (p) => {
    if (!p) return p;
    if (typeof p === 'string' && p.startsWith('/uploads/')) return `${API_BASE}${p}`;
    if (typeof p === 'string' && !p.startsWith('/') && !p.startsWith('http')) return `/${p}`;
    return p;
  };
  const techIcons = (project.technologies || []).map((tech) => ({
    name: tech.name,
    src: asPublic(`techno/${tech.name.toLowerCase().replace('.', '').replace(' ', '')}.webp`),
  }));

  // Build media list: use provided media, otherwise derive a few from the base image so we have multiple slides
  const media = (() => {
    if (Array.isArray(project.media) && project.media.length > 0) return project.media;
    if (typeof project.image === 'string' && project.image.length > 0) return [project.image];
    return [];
  })();
  const youtubeLink = (project.linksList || []).find(l => typeof l?.url === 'string' && l.name?.toLowerCase() === 'youtube')?.url;
  const hasYouTube = Boolean(youtubeLink);
  const slidesCount = media.length + (hasYouTube ? 1 : 0);

  const handlePrev = () => {
    if (slidesCount === 0) return;
    setMediaIndex((prev) => (prev === 0 ? slidesCount - 1 : prev - 1));
  };
  const handleNext = () => {
    if (slidesCount === 0) return;
    setMediaIndex((prev) => (prev === slidesCount - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative h-full w-full overflow-auto">
      <div className="absolute top-4 left-4 z-20">
        <Button label="< Back" variant="green" width={140} height={44} onClick={() => navigate(-1)} />
      </div>

      <div className="w-full h-full flex items-start justify-center pt-20 px-4">
        <Container className="w-full">
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="md:col-span-2 flex flex-col gap-4">
              {/* Title/top */}
              <div className="flex flex-col gap-1">
                <h1 className="minecraft-ten text-3xl text-white">{project.title}</h1>
              </div>

              {/* Media carousel */}
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
                    {hasYouTube && mediaIndex === 0 ? (
                      <button
                        type="button"
                        onClick={() => window.open(youtubeLink, '_blank', 'noreferrer')}
                        className="absolute inset-0 group"
                        aria-label="Open YouTube"
                      >
                        <img
                          src={asPublic(project.image || media[0])}
                          alt={`${project.title} - YouTube preview`}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img
                            src={asPublic('text/play.webp')}
                            alt="Play"
                            className="h-20 w-20 object-contain [image-rendering:crisp-edges]"
                          />
                        </div>
                      </button>
                    ) : (
                      <>
                        <img
                          src={asPublic(media[hasYouTube ? mediaIndex - 1 : mediaIndex])}
                          alt={`${project.title} - media ${(hasYouTube ? mediaIndex : mediaIndex + 1)}`}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      </>
                    )}
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
              <Container variant="dark">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="inline-block bg-gray-600 text-white text-xs px-2 py-1">{typeof project.category === 'object' ? (project.category?.name || '') : (project.category || '')}</span>
                  {project.special && (
                    <img src={asPublic('techno/special.webp')} alt="special" title="special" className="h-6 w-6 object-contain drop-shadow" />
                  )}
                </div>
                {project.date && (
                  <span className="text-green-400">
                    {new Date(project.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })}
                  </span>
                )}
                {project.description && (
                  <div>
                    <p className="text-gray-200 text-sm leading-relaxed">{project.description}</p>
                  </div>
                )}

                {(techIcons && techIcons.length > 0) && (
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      {techIcons.map((icon, idx) => (
                        <img key={idx} src={asPublic(icon.src)} alt={icon.name} title={icon.name} className="h-7 w-7 object-contain drop-shadow" />
                      ))}
                    </div>
                  </div>
                )}
                {(() => {
                  const otherLinks = (project.linksList || []).filter(l => l?.name?.toLowerCase() !== 'youtube');
                  if (otherLinks.length === 0) return null;
                  return (
                    <div className="mt-4 flex items-center gap-3 flex-wrap">
                      {otherLinks.map((l) => (
                        <Button
                          label={l.name}
                          variant="purple"
                          onClick={() => window.open(l.url, '_blank', 'noreferrer')}
                        />
                      ))}
                    </div>
                  );
                })()}
                
              </Container>
          </div>

        </Container>
      </div>
      {project.collaboration && (() => {
        const collaborator = (collaboratorsData || []).find(c => c.title === project.collaboration);
        if (!collaborator) return null;
        return (
          <div className="w-full flex flex-col items-center mt-8 gap-3 px-4 pb-10">
            <img src={asPublic('text/collaborations.webp')} alt="Collaborations" className="pb-10"/>
            <div className="w-full max-w-xl">
              <CollaboratorCard
                collaborator={collaborator}
                onClick={() => navigate(`/collaborators/${collaborator.id}`)}
              />
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default ProjectDetail;
