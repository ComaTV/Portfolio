import React from 'react';
import TechnologyStats from './TechnologyStats';
import ProfileInfo from './ProfileInfo';

const ProfileSection = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row items-start justify-start gap-8">
      <ProfileInfo />
      <TechnologyStats/>
    </div>
  );
};

export default ProfileSection; 