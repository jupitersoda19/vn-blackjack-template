import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'; // Added useMemo, useCallback
import { getEmotionColor } from '../../utils/emotionColors';
import { applyTheme } from '../../utils/themeManager';

// Constants
const DEFAULT_AVATAR_PATH = '/assets/characters/default-avatar.png';
const AUTO_ADVANCE_SKIP_DELAY = 500;
const AUTO_ADVANCE_TYPE_DELAY = 1500;
const MIN_TYPING_INTERVAL = 20;
const BASE_TYPING_INTERVAL_DIVISOR = 1000;

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

  // Memoize theme application
  const currentTheme = useMemo(() => applyTheme(theme), [theme]);

  // Memoize emotion and color calculation
  const speakerName = dialog.speaker;
  const speakerKey = useMemo(() => speakerName?.toLowerCase(), [speakerName]);

  const characterDataForEmotion = useMemo(() => {
    if (!speakerKey || !dialog.characters) return null;
    return dialog.characters[speakerKey];
  }, [speakerKey, dialog.characters]);

  const emotion = useMemo(() => characterDataForEmotion?.emotion, [characterDataForEmotion]);

  const emotionColor = useMemo(() => {
    return emotion ? getEmotionColor(emotion) : currentTheme.accentColor;
  }, [emotion, currentTheme.accentColor]);


  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Memoize typingInterval calculation
  const textSpeed = dialog.textSpeed || 30; // Default speed of 30 (arbitrary unit, higher is faster)
  const typingInterval = useMemo(() => {
    // Ensure textSpeed is positive to avoid division by zero or negative interval
    const safeSpeed = Math.max(1, textSpeed);
    return Math.max(MIN_TYPING_INTERVAL, BASE_TYPING_INTERVAL_DIVISOR / safeSpeed);
  }, [textSpeed]);

  const timerRef = useRef(null);
  const autoAdvanceTimerRef = useRef(null);
  const currentCharIndex = useRef(0);
  const isMountedRef = useRef(true); // To prevent state updates on unmounted component

  // Memoize character portrait data retrieval
  const characterPortrait = useMemo(() => {
    if (!speakerName) return null;

    let characterData = null;

    // 1. Check position-based characters in current dialog data
    if (dialog.characters) {
      const positionedChar = Object.values(dialog.characters).find(char => char.name === speakerName);
      if (positionedChar) {
        characterData = positionedChar;
      }
    }

    // 2. Fallback: Check name-based characters in current dialog data or global characters prop
    if (!characterData && speakerKey) {
      characterData = dialog.characters?.[speakerKey] ||
                      characters[speakerKey] ||
                      characters[speakerName]; // Allow case-sensitive original name match as last resort
    }

    if (!characterData) return null;

    return {
      image: characterData.image || characterData.avatar || characterData.src || DEFAULT_AVATAR_PATH,
      emotion: characterData.emotion || 'neutral',
      name: characterData.name || speakerName, // Prefer name from data if available
    };
  }, [speakerName, speakerKey, dialog.characters, characters]);


  // Report typing state to parent
  useEffect(() => {
    if (onTypingStateChange) {
      onTypingStateChange(isTyping);
    }
  }, [isTyping, onTypingStateChange]); // onTypingStateChange should be stable (memoized by parent if needed)

  // Main effect for handling dialog changes and typing
  useEffect(() => {
    // Clear any existing timers
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    timerRef.current = null;
    autoAdvanceTimerRef.current = null;

    const fullText = dialog.text || '';

    if (!fullText) {
      setDisplayText('');
      setIsTyping(false);
      return;
    }

    currentCharIndex.current = 0;
    setDisplayText('');

    if (isSkipEnabled) {
      setDisplayText(fullText);
      setIsTyping(false);

      if (isAutoPlayEnabled && (!choices || choices.length === 0) && onNext) {
        autoAdvanceTimerRef.current = setTimeout(() => {
          if (isMountedRef.current) onNext();
        }, AUTO_ADVANCE_SKIP_DELAY);
      }
      return;
    }

    setIsTyping(true);

    timerRef.current = setInterval(() => {
      if (!isMountedRef.current) return;

      const currentIndex = currentCharIndex.current;
      if (currentIndex < fullText.length) {
        setDisplayText(prev => fullText.substring(0, prev.length + 1)); // More robust substring
        currentCharIndex.current += 1;
      } else {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setIsTyping(false);

        if (isAutoPlayEnabled && (!choices || choices.length === 0) && onNext) {
          autoAdvanceTimerRef.current = setTimeout(() => {
            if (isMountedRef.current) onNext();
          }, AUTO_ADVANCE_TYPE_DELAY);
        }
      }
    }, typingInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    };
  }, [dialog.text, dialog.speaker, isSkipEnabled, typingInterval, isAutoPlayEnabled, choices, onNext]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Redundant cleanup if main effect already handles it, but good for safety
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    };
  }, []);

  // Memoize event handler
  const handleTextClick = useCallback(() => {
    if (isTyping && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setDisplayText(dialog.text || '');
      setIsTyping(false);
      currentCharIndex.current = (dialog.text || '').length;

      if (isAutoPlayEnabled && (!choices || choices.length === 0) && onNext) {
        autoAdvanceTimerRef.current = setTimeout(() => {
          if (isMountedRef.current) onNext();
        }, AUTO_ADVANCE_SKIP_DELAY);
      }
    } else if ((!choices || choices.length === 0) && onNext) {
      onNext();
    }
  }, [isTyping, dialog.text, isAutoPlayEnabled, choices, onNext]); // Added relevant dependencies

  // Memoize iframe details
  const iframeDetails = useMemo(() => {
    if (!dialog.iframe || !dialog.iframe.url) return null;
    return {
      url: dialog.iframe.url,
      position: dialog.iframe.position || 'center',
      width: dialog.iframe.width || '80%',
      height: dialog.iframe.height || '300px',
      allowFullscreen: dialog.iframe.allowFullscreen !== false,
      autoplay: dialog.iframe.autoplay || false,
    };
  }, [dialog.iframe]);


  const handleChoiceSelected = useCallback((choice) => {
    if (onChoiceSelected) {
        onChoiceSelected(choice);
    }
  }, [onChoiceSelected]);


  // Memoize portrait image error handler
  const handlePortraitError = useCallback((e) => {
    if (e.target.src !== DEFAULT_AVATAR_PATH) { // Prevent infinite loop if default also fails
        e.target.onerror = null; // Prevent future error calls on this attempt
        e.target.src = DEFAULT_AVATAR_PATH;
    }
  }, []);


  // Styles (can be further memoized if they become complex and don't change often)
  const dialogBoxStyle = useMemo(() => ({
    backgroundColor: `${currentTheme.secondaryColor}CC`,
    borderColor: emotionColor, // emotionColor already includes currentTheme.accentColor fallback
    color: currentTheme.textColor,
    boxShadow: `0 -4px 20px ${emotionColor}20`
  }), [currentTheme, emotionColor]);

  const portraitBorderStyle = useMemo(() => ({
    borderColor: emotionColor,
    boxShadow: `0 0 10px ${emotionColor}40`
  }), [emotionColor]);

  const speakerNameStyle = useMemo(() => ({
    color: emotionColor,
    textShadow: `0 0 8px ${emotionColor}60`
  }), [emotionColor]);

  // ... (other styles can be memoized similarly if beneficial)

  return (
    <div
      className="w-full p-4 rounded-t-lg border-t-2 relative"
      style={dialogBoxStyle}
    >
      {dialog.speaker && (
        <div className="flex items-center mb-3">
          {characterPortrait && characterPortrait.image && ( // Check image existence
            <div
              className="w-12 h-12 rounded-full overflow-hidden border-2 mr-3 flex-shrink-0 relative"
              style={portraitBorderStyle}
            >
              <img
                src={characterPortrait.image}
                alt={characterPortrait.name}
                className="w-full h-full object-cover"
                style={{
                  filter:
                    characterPortrait.emotion === 'angry' ? 'hue-rotate(10deg) saturate(1.2)' :
                    characterPortrait.emotion === 'happy' ? 'brightness(1.1) saturate(1.1)' :
                    characterPortrait.emotion === 'sad' ? 'grayscale(0.3) brightness(0.9)' :
                    characterPortrait.emotion === 'embarrassed' ? 'hue-rotate(-10deg) saturate(1.3)' :
                    'none'
                }}
                onError={handlePortraitError}
              />
              {characterPortrait.emotion && characterPortrait.emotion !== 'neutral' && (
                <div
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 flex items-center justify-center text-xs"
                  style={{
                    backgroundColor: emotionColor,
                    borderColor: currentTheme.secondaryColor,
                    color: currentTheme.textColor
                  }}
                >
                  {/* Could be a map for cleaner rendering */}
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
          <div
            className="font-bold text-lg flex-grow"
            style={speakerNameStyle}
          >
            {dialog.speaker}
          </div>
          {isTyping && (
            <div className="flex space-x-1 mr-2">
              {[0, 0.2, 0.4].map((delay, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{
                    backgroundColor: emotionColor,
                    animationDelay: `${delay}s`
                  }}
                ></div>
              ))}
            </div>
          )}
        </div>
      )}

      <div
        className="text-lg mb-4 cursor-pointer min-h-[2rem] leading-relaxed"
        style={{ color: currentTheme.textColor }}
        onClick={handleTextClick}
      >
        <span>{displayText}</span>
        {isTyping && (
          <span
            className="animate-pulse ml-1"
            style={{ color: emotionColor }}
          >
            ▋
          </span>
        )}
      </div>

      {iframeDetails && (
        <div className={`
          mb-4 overflow-hidden relative rounded-lg shadow-lg
          ${iframeDetails.position === 'top' ? 'absolute -top-80 left-1/2 transform -translate-x-1/2' : ''}
          ${iframeDetails.position === 'center' ? 'mx-auto' : ''}
        `}
        style={{
          width: iframeDetails.width,
          height: iframeDetails.height,
          borderColor: currentTheme.accentColor // Or emotionColor if you want it themed
        }}>
          <iframe
            src={iframeDetails.url}
            className="w-full h-full rounded-lg border"
            style={{ borderColor: currentTheme.accentColor }} // Or emotionColor
            title={dialog.speaker || 'iframe content'} // Add title for accessibility
            frameBorder="0"
            allowFullScreen={iframeDetails.allowFullscreen}
            allow={`${iframeDetails.autoplay ? 'autoplay;' : ''} fullscreen; picture-in-picture`}
          ></iframe>
        </div>
      )}

      {choices && choices.length > 0 ? (
        <div className="flex flex-col space-y-2 mt-4">
          {choices.map((choice, index) => (
            <button
              key={choice.id || index} // Prefer a stable `id` from choice data if available
              className="font-bold py-2 px-4 rounded-lg hover:scale-102 transition-all duration-200 relative overflow-hidden group text-left"
              style={{
                backgroundColor: currentTheme.primaryColor,
                color: currentTheme.textColor,
                border: `2px solid ${currentTheme.accentColor}`,
                boxShadow: `0 2px 8px ${currentTheme.accentColor}20`,
                maxWidth: 'fit-content',
                minWidth: '200px'
              }}
              onClick={() => handleChoiceSelected(choice)}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 4px 16px ${emotionColor}40`; // Use emotionColor for hover
                e.currentTarget.style.borderColor = emotionColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = `0 2px 8px ${currentTheme.accentColor}20`;
                e.currentTarget.style.borderColor = currentTheme.accentColor;
              }}
            >
              <span
                className="inline-block w-5 h-5 rounded-full text-xs font-bold mr-3 text-center leading-5"
                style={{
                  backgroundColor: emotionColor,
                  color: currentTheme.secondaryColor
                }}
              >
                {index + 1}
              </span>
              <span className="inline">{choice.text}</span>
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-200"
                style={{ backgroundColor: emotionColor }}
              ></div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex justify-end">
          {!isTyping && onNext && ( // Ensure onNext is provided before rendering button
            <button
              className="font-bold py-2 px-6 rounded-lg flex items-center hover:scale-105 transition-all duration-200"
              style={{
                backgroundColor: currentTheme.primaryColor,
                color: currentTheme.textColor,
                border: `2px solid ${currentTheme.accentColor}`,
                boxShadow: `0 2px 8px ${currentTheme.accentColor}30`
              }}
              onClick={onNext} // No need to wrap onNext in useCallback here if it's stable from parent
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 4px 16px ${currentTheme.accentColor}50`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = `0 2px 8px ${currentTheme.accentColor}30`;
              }}
            >
              <span>Continue</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"> {/* aria-hidden */}
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      )}

      <div className="absolute bottom-2 left-2 flex items-center space-x-4 text-xs opacity-75">
        {isTyping && (
          <span style={{ color: currentTheme.accentColor }}>
            Speed: {textSpeed}x {/* Using the textSpeed variable directly */}
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