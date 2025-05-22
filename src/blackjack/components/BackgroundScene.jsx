import React, { useState, useEffect } from 'react';

const BackgroundScene = ({ background, transition = 'none', effects = null }) => {
  const [currentBg, setCurrentBg] = useState(background);
  const [prevBg, setPrevBg] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  useEffect(() => {
    // If background has changed, trigger a transition
    if (background !== currentBg) {
      setPrevBg(currentBg);
      setCurrentBg(background);
      setIsTransitioning(true);
      
      // End transition after animation completes
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setPrevBg(null);
      }, 1000); // Match this with CSS transition duration
      
      return () => clearTimeout(timer);
    }
  }, [background, currentBg]);
  
  // Apply background effects
  const getBackgroundEffects = () => {
    if (!effects) return {};
    
    const styleObj = {};
    
    if (effects.type === 'particles') {
      // This would ideally be implemented with a particle library
      styleObj.backgroundBlendMode = 'screen';
      styleObj.opacity = 0.9;
    }
    
    if (effects.weather) {
      // Add a weather overlay
      switch (effects.weather) {
        case 'rain':
          styleObj.backgroundBlendMode = 'darken';
          styleObj.opacity = 0.85;
          break;
        case 'clearnight':
          styleObj.filter = 'brightness(0.7) saturate(1.2)';
          break;
        default:
          break;
      }
    }
    
    return styleObj;
  };
  
  // Get transition styles based on transition type
  const getTransitionClasses = () => {
    if (!isTransitioning) return '';
    
    switch (transition) {
      case 'fade':
        return 'transition-opacity duration-1000';
      case 'slide':
        return 'transition-transform duration-1000';
      default:
        return 'transition-all duration-500';
    }
  };
  
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Previous background for transition */}
      {isTransitioning && prevBg && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${prevBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: transition === 'fade' ? 0 : 1,
            transform: transition === 'slide' ? 'translateX(-100%)' : 'none',
            zIndex: 1
          }}
        />
      )}
      
      {/* Current background */}
      <div 
        className={`absolute inset-0 bg-cover bg-center ${getTransitionClasses()}`}
        style={{ 
          backgroundImage: `url(${currentBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 2,
          ...getBackgroundEffects()
        }}
      />
    </div>
  );
};

export default BackgroundScene;