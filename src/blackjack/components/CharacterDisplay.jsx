import React from 'react';

const CharacterDisplay = ({ characters }) => {
  if (!characters || Object.keys(characters).length === 0) return null;
  
  return (
    <div className="absolute inset-0 z-10 flex items-end justify-around">
      {Object.entries(characters).map(([position, character]) => {
        if (!character || !character.image) return null;
        
        // Calculate positioning based on position key
        let positionClass = "bottom-0 ";
        if (position === 'left') positionClass += "left-8";
        else if (position === 'center') positionClass += "left-1/2 transform -translate-x-1/2";
        else if (position === 'right') positionClass += "right-8";
        
        // Add animation class based on character state
        let animationClass = "";
        if (character.state === 'entering') animationClass = "animate-character-enter";
        else if (character.state === 'exiting') animationClass = "animate-character-exit";
        
        // Add emotion styling
        let emotionStyle = {};
        if (character.emotion === 'angry') emotionStyle = { filter: 'sepia(0.5) hue-rotate(300deg)' };
        else if (character.emotion === 'happy') emotionStyle = { filter: 'brightness(1.2)' };
        else if (character.emotion === 'sad') emotionStyle = { filter: 'grayscale(0.5)' };
        
        return (
          <div 
            key={position}
            className={`absolute ${positionClass} ${animationClass}`}
            style={{
              height: '80%',
              maxWidth: '40%',
              ...emotionStyle
            }}
          >
            <img 
              src={character.image} 
              alt={character.name} 
              className="h-full object-contain"
            />
          </div>
        );
      })}
    </div>
  );
};

export default CharacterDisplay;