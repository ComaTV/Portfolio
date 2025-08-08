import React from 'react';
import PanoramaBackground from './components/PanoramaBackground';
import ProfileSection from './components/ProfileSection';
import ProjectSection from './components/ProjectSection';
import SpecialProjectsSection from './components/SpecialProjectsSection';
import { Scrollbar } from 'mc-ui-comatv';

function App() {

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <PanoramaBackground />
      
      <div className="absolute inset-0">
        <Scrollbar height="100%" width="100%" variant="vertical" style={{ padding: 0, margin: 0, gap: 0, transform: 'translateX(0)' }}>
          <ProfileSection />
          <SpecialProjectsSection />
          <ProjectSection />
        </Scrollbar>
      </div>
      </div>
  );
}

export default App;
