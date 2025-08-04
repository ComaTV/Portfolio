import React from 'react';
import TechnologyStats from './TechnologyStats';
import ProfileInfo from './ProfileInfo';

const ProfileSection = () => {
  return (
    <div className="min-h-screen flex items-start justify-start">
      <ProfileInfo />
      <TechnologyStats/>
    </div>
  );
};

export default ProfileSection; 