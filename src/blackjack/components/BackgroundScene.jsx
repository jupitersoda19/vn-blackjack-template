
// components/BackgroundScene.js
import React from 'react';

const BackgroundScene = ({ background }) => {
  return (
    <div 
      className="absolute inset-0 bg-cover bg-center z-0"
      style={{ 
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  );
};

export default BackgroundScene;