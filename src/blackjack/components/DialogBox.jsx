import React, { useState, useEffect, useRef } from 'react';
import { getEmotionColor } from '../../utils/emotionColors';
import { applyTheme } from '../../utils/themeManager';

const DialogBox = ({ 
  dialog, 
  onNext, 
  choices, 
  onChoiceSelected, 
  theme = {},
  isAutoPlayEnabled = false, 
  isSkipEnabled = false,
  onTypingStateChange,
  characters = {} // Character data for portraits
}) => {
  if (!dialog) return null;
  
  const currentTheme = applyTheme(theme);
  const emotion = dialog.speaker && dialog.characters?.[dialog.speaker.toLowerCase()]?.emotion;
  const emotionColor = emotion ? getEmotionColor(emotion) : currentTheme.accentColor;

  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const textSpeed = dialog.textSpeed || 30;
  const typingInterval = Math.max(20, 1000 / textSpeed);
  
  const timerRef = useRef(null);
  const autoAdvanceTimerRef = useRef(null);
  const currentCharIndex = useRef(0);
  const isMountedRef = useRef(true);

  // Get character portrait data
  const getCharacterPortrait = () => {
    if (!dialog.speaker) return null;
    
    const speakerName = dialog.speaker;
    let characterData = null;
    
    // First, check if characters are organized by position (left, center, right)
    if (dialog.characters) {
      // Look through position-based characters
      Object.values(dialog.characters).forEach(char => {
        if (char.name === speakerName) {
          characterData = char;
        }
      });
    }
    
    // Fallback: check if characters are organized by name (existing logic)
    if (!characterData) {
      const speakerKey = speakerName.toLowerCase();
      characterData = dialog.characters?.[speakerKey] || 
                     characters[speakerKey] || 
                     characters[speakerName];
    }
    
    if (!characterData) {
      return null;
    }
    
    return {
      image: characterData.image || characterData.avatar || characterData.src,
      emotion: characterData.emotion || 'neutral',
      name: speakerName
    };
  };

  const characterPortrait = getCharacterPortrait();
  
  // Report typing state to parent
  useEffect(() => {
    if (onTypingStateChange) {
      onTypingStateChange(isTyping);
    }
  }, [isTyping, onTypingStateChange]);
  
  // Main effect for handling dialog changes and typing
  useEffect(() => {
    // Clear any existing timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    
    const fullText = dialog.text || '';
    
    if (!fullText) {
      setDisplayText('');
      setIsTyping(false);
      return;
    }
    
    // Reset state
    currentCharIndex.current = 0;
    setDisplayText('');
    
    // If skip is enabled, show all text immediately
    if (isSkipEnabled) {
      setDisplayText(fullText);
      setIsTyping(false);
      
      if (isAutoPlayEnabled && (!choices || choices.length === 0)) {
        autoAdvanceTimerRef.current = setTimeout(() => {
          if (onNext && isMountedRef.current) onNext();
        }, 500);
      }
      return;
    }
    
    // Start typing effect
    setIsTyping(true);
    
    const startTyping = () => {
      timerRef.current = setInterval(() => {
        if (!isMountedRef.current) return;
        
        const currentIndex = currentCharIndex.current;
        
        if (currentIndex < fullText.length) {
          const newText = fullText.substring(0, currentIndex + 1);
          setDisplayText(newText);
          currentCharIndex.current = currentIndex + 1;
        } else {
          // Typing complete
          clearInterval(timerRef.current);
          timerRef.current = null;
          setIsTyping(false);
          
          // Auto-advance if enabled
          if (isAutoPlayEnabled && (!choices || choices.length === 0)) {
            autoAdvanceTimerRef.current = setTimeout(() => {
              if (onNext && isMountedRef.current) onNext();
            }, 1500);
          }
        }
      }, typingInterval);
    };
    
    // Start typing immediately
    startTyping();
    
    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
    };
  }, [dialog.text, dialog.speaker, isSkipEnabled, typingInterval, isAutoPlayEnabled, choices, onNext]);
  
  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
    };
  }, []);
  
  const handleTextClick = () => {
    if (isTyping && timerRef.current) {
      // Skip typing - show full text immediately
      clearInterval(timerRef.current);
      timerRef.current = null;
      setDisplayText(dialog.text || '');
      setIsTyping(false);
      currentCharIndex.current = (dialog.text || '').length;
      
      if (isAutoPlayEnabled && (!choices || choices.length === 0)) {
        autoAdvanceTimerRef.current = setTimeout(() => {
          if (onNext && isMountedRef.current) onNext();
        }, 500);
      }
    } else if (!choices || choices.length === 0) {
      // Advance to next dialog
      if (onNext) onNext();
    }
  };
  
  const hasIframe = dialog.iframe && dialog.iframe.url;
  const iframePosition = dialog.iframe?.position || 'center';
  const iframeWidth = dialog.iframe?.width || '80%';
  const iframeHeight = dialog.iframe?.height || '300px';

  return (
    <div 
      className="w-full p-4 rounded-t-lg border-t-2 relative"
      style={{ 
        backgroundColor: `${currentTheme.secondaryColor}CC`,
        borderColor: emotionColor || currentTheme.accentColor,
        color: currentTheme.textColor,
        boxShadow: `0 -4px 20px ${emotionColor || currentTheme.accentColor}20`
      }}
    >
      {/* Enhanced Speaker Section with Portrait */}
      {dialog.speaker && (
        <div className="flex items-center mb-3">
          {/* Character Portrait */}
          {characterPortrait && (
            <div 
              className="w-12 h-12 rounded-full overflow-hidden border-2 mr-3 flex-shrink-0 relative"
              style={{ 
                borderColor: emotionColor || currentTheme.accentColor,
                boxShadow: `0 0 10px ${emotionColor || currentTheme.accentColor}40`
              }}
            >
              <img
                src={characterPortrait.image}
                alt={characterPortrait.name}
                className="w-full h-full object-cover"
                style={{
                  filter: characterPortrait.emotion === 'angry' ? 'hue-rotate(10deg) saturate(1.2)' :
                         characterPortrait.emotion === 'happy' ? 'brightness(1.1) saturate(1.1)' :
                         characterPortrait.emotion === 'sad' ? 'grayscale(0.3) brightness(0.9)' :
                         characterPortrait.emotion === 'embarrassed' ? 'hue-rotate(-10deg) saturate(1.3)' :
                         'none'
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/characters/default-avatar.png';
                }}
              />
              
              {/* Emotion Indicator */}
              {characterPortrait.emotion && characterPortrait.emotion !== 'neutral' && (
                <div 
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 flex items-center justify-center text-xs"
                  style={{ 
                    backgroundColor: emotionColor,
                    borderColor: currentTheme.secondaryColor,
                    color: currentTheme.textColor
                  }}
                >
                  {characterPortrait.emotion === 'happy' && '😊'}
                  {characterPortrait.emotion === 'sad' && '😢'}
                  {characterPortrait.emotion === 'angry' && '😠'}
                  {characterPortrait.emotion === 'embarrassed' && '😳'}
                  {characterPortrait.emotion === 'surprised' && '😮'}
                  {characterPortrait.emotion === 'love' && '💕'}
                </div>
              )}
            </div>
          )}
          
          {/* Speaker Name */}
          <div 
            className="font-bold text-lg flex-grow"
            style={{ 
              color: emotionColor || currentTheme.accentColor,
              textShadow: `0 0 8px ${emotionColor || currentTheme.accentColor}60`
            }}
          >
            {dialog.speaker}
          </div>
          
          {/* Speaking Indicator */}
          {isTyping && (
            <div className="flex space-x-1 mr-2">
              <div 
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: emotionColor || currentTheme.accentColor }}
              ></div>
              <div 
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ 
                  backgroundColor: emotionColor || currentTheme.accentColor,
                  animationDelay: '0.2s'
                }}
              ></div>
              <div 
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ 
                  backgroundColor: emotionColor || currentTheme.accentColor,
                  animationDelay: '0.4s'
                }}
              ></div>
            </div>
          )}
        </div>
      )}
     
      {/* Dialog Text */}
      <div 
        className="text-lg mb-4 cursor-pointer min-h-[2rem] leading-relaxed"
        style={{ color: currentTheme.textColor }}
        onClick={handleTextClick}
      >
        <span>{displayText}</span>
        {isTyping && (
          <span 
            className="animate-pulse ml-1"
            style={{ color: emotionColor || currentTheme.accentColor }}
          >
            ▋
          </span>
        )}
      </div>
      
      {/* Iframe Content */}
      {hasIframe && (
        <div className={`
          mb-4 overflow-hidden relative rounded-lg shadow-lg
          ${iframePosition === 'top' ? 'absolute -top-80 left-1/2 transform -translate-x-1/2' : ''}
          ${iframePosition === 'center' ? 'mx-auto' : ''}
        `}
        style={{
          width: iframeWidth,
          height: iframeHeight,
          borderColor: currentTheme.accentColor
        }}>
          <iframe
            src={dialog.iframe.url}
            className="w-full h-full rounded-lg border"
            style={{ borderColor: currentTheme.accentColor }}
            frameBorder="0"
            allowFullScreen={dialog.iframe.allowFullscreen !== false}
            allow={`${dialog.iframe.autoplay ? 'autoplay;' : ''} fullscreen; picture-in-picture`}
          ></iframe>
        </div>
      )}
     
      {/* Enhanced Choices */}
      {choices && choices.length > 0 ? (
        <div className="flex flex-col space-y-2 mt-4">
          {choices.map((choice, index) => (
            <button
              key={index}
              className="font-bold py-2 px-4 rounded-lg hover:scale-102 transition-all duration-200 relative overflow-hidden group text-left"
              style={{ 
                backgroundColor: currentTheme.primaryColor,
                color: currentTheme.textColor,
                border: `2px solid ${currentTheme.accentColor}`,
                boxShadow: `0 2px 8px ${currentTheme.accentColor}20`,
                maxWidth: 'fit-content',
                minWidth: '200px'
              }}
              onClick={() => onChoiceSelected(choice)}
              onMouseEnter={(e) => {
                e.target.style.boxShadow = `0 4px 16px ${currentTheme.accentColor}40`;
                e.target.style.borderColor = emotionColor || currentTheme.accentColor;
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = `0 2px 8px ${currentTheme.accentColor}20`;
                e.target.style.borderColor = currentTheme.accentColor;
              }}
            >
              {/* Choice Number Badge */}
              <span 
                className="inline-block w-5 h-5 rounded-full text-xs font-bold mr-3 text-center leading-5"
                style={{ 
                  backgroundColor: emotionColor || currentTheme.accentColor,
                  color: currentTheme.secondaryColor
                }}
              >
                {index + 1}
              </span>
              
              {/* Choice Text */}
              <span className="inline">{choice.text}</span>
              
              {/* Hover Effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-200"
                style={{ backgroundColor: emotionColor || currentTheme.accentColor }}
              ></div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex justify-end">
          {!isTyping && (
            <button
              className="font-bold py-2 px-6 rounded-lg flex items-center hover:scale-105 transition-all duration-200"
              style={{ 
                backgroundColor: currentTheme.primaryColor,
                color: currentTheme.textColor,
                border: `2px solid ${currentTheme.accentColor}`,
                boxShadow: `0 2px 8px ${currentTheme.accentColor}30`
              }}
              onClick={onNext}
              onMouseEnter={(e) => {
                e.target.style.boxShadow = `0 4px 16px ${currentTheme.accentColor}50`;
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = `0 2px 8px ${currentTheme.accentColor}30`;
              }}
            >
              <span>Continue</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      )}
      
      {/* Status Indicators */}
      <div className="absolute bottom-2 left-2 flex items-center space-x-4 text-xs opacity-75">
        {isTyping && (
          <span style={{ color: currentTheme.accentColor }}>
            Speed: {textSpeed}x
          </span>
        )}
        
        {isAutoPlayEnabled && !isTyping && (!choices || choices.length === 0) && (
          <span style={{ color: currentTheme.accentColor }}>
            Auto-advance...
          </span>
        )}
      </div>
    </div>
  );
};

export default DialogBox;