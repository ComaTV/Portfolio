import React from 'react';
import ProfileInfo from './Profile_section/ProfileInfo';
import RightContainer from './Profile_section/RightContainer';

const ProfileSection = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="w-full flex justify-center mt-10 mb-10">
        <img 
          src="/text/name.webp" 
          alt="Name" 
          className="max-w-full h-auto"
        />
      </div>
      
      {/* Content area */}
      <div className="w-full flex flex-col lg:flex-row items-start justify-start flex-1 gap-2">
        <div className="w-full lg:w-1/3 flex flex-col">
          <ProfileInfo />
        </div>
        <RightContainer />
      </div>
    </div>
  );
};

export default ProfileSection; 