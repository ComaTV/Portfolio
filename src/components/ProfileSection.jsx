import React from 'react';
import { projectsData } from '../server/data.jsx';
import TechnologyStats from './TechnologyStats';
import ProfileInfo from './ProfileInfo';

const ProfileSection = () => {
  return (
    <div className="min-h-screen flex items-start justify-start">
      <ProfileInfo />
      <TechnologyStats projectsData={projectsData} />
    </div>
  );
};

export default ProfileSection; 