import React from 'react';
import PanoramaBackground from './components/PanoramaBackground';
import ProfileSection from './components/ProfileSection';
import ProjectSection from './components/ProjectSection';
import { Scrollbar } from 'mc-ui-comatv';
import CollaboratorsSection from './components/CollaboratorsSection';
import { Routes, Route } from 'react-router-dom';
import ProjectDetail from './components/ProjectDetail';
import CollaboratorDetail from './components/CollaboratorDetail';
import AdminPage from './admin/AdminPage';

function App() {

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <PanoramaBackground />
      <div className="absolute inset-0">
        <Routes>
          <Route
            path="/"
            element={
              <Scrollbar height="100%" width="100%" variant="vertical" style={{ padding: 0, margin: 0, gap: 0, transform: 'translateX(0)' }}>
                <ProfileSection />
                <ProjectSection />
                <CollaboratorsSection />
              </Scrollbar>
            }
          />
          <Route 
            path="/projects/:id" 
            element={
              <Scrollbar height="100%" width="100%" variant="vertical" style={{ padding: 0, margin: 0, gap: 0, transform: 'translateX(0)' }}>
                <ProjectDetail />
              </Scrollbar>
            } 
          />
          <Route 
            path="/collaborators/:id" 
            element={
              <Scrollbar height="100%" width="100%" variant="vertical" style={{ padding: 0, margin: 0, gap: 0, transform: 'translateX(0)' }}>
                <CollaboratorDetail />
              </Scrollbar>
            }
          />
          <Route 
            path="/admin" 
            element={
              <Scrollbar height="100%" width="100%" variant="vertical" style={{ padding: 0, margin: 0, gap: 0, transform: 'translateX(0)' }}>
                <AdminPage />
              </Scrollbar>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
