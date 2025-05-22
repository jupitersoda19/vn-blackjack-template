import { useState, useEffect, useCallback, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useLocalStorage } from 'react-use';

export const useVisualNovelHelpers = ({
  onNext,
  onChoiceSelected,
  playerChoices,
  dialogIndex,
  totalDialogs,
  onOpenMenu,
  onSave,
  onLoad,
  onToggleAuto,
  onToggleSkip,
  onAdjustTextSpeed,
  isAutoAdvanceEnabled,
  isSkipEnabled,
  showBlackjack,
  gameId,
  currentDialog
}) => {
  const handleNext = onNext || (() => {});
  const handleChoiceSelected = onChoiceSelected || (() => {});
  const currentChoices = playerChoices || [];
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [textSpeed, setTextSpeed] = useState(30);
  const [readDialogs, setReadDialogs] = useLocalStorage(`${gameId || 'game'}-read-dialogs`, {});
  const autoAdvanceTimer = useRef(null);
  const [autoAdvanceDelay, setAutoAdvanceDelay] = useState(2000);
  const [dialogHistory, setDialogHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const [settings, setSettings] = useLocalStorage(`${gameId || 'game'}-settings`, {
    autoAdvance: false,
    skipRead: false,
    textSpeed: 30,
    volume: 100,
    sfxVolume: 100
  });

  const saveGameState = useCallback((slotId = 'auto') => {
    if (!onSave) return;
    
    const saveData = onSave();
    if (!saveData) return;
    
    localStorage.setItem(`${gameId || 'game'}-save-${slotId}`, JSON.stringify({
      timestamp: new Date().toISOString(),
      data: saveData
    }));
    
    return true;
  }, [onSave, gameId]);
  
  const loadGameState = useCallback((slotId = 'auto') => {
    if (!onLoad) return false;
    
    const savedGame = localStorage.getItem(`${gameId || 'game'}-save-${slotId}`);
    if (!savedGame) return false;
    
    try {
      const { data } = JSON.parse(savedGame);
      onLoad(data);
      return true;
    } catch (e) {
      console.error('Failed to load saved game:', e);
      return false;
    }
  }, [onLoad, gameId]);
  
  useEffect(() => {
    if (dialogIndex !== undefined && !showBlackjack) {
      saveGameState('auto');
      
      setReadDialogs(prev => ({
        ...prev,
        [`${dialogIndex}`]: true
      }));
      
      if (currentDialog && Array.isArray(currentDialog) && dialogIndex < currentDialog.length) {
        setDialogHistory(prev => [...prev.slice(-50), currentDialog[dialogIndex]]);
      }
    }
  }, [dialogIndex, showBlackjack, saveGameState, currentDialog]);
  
  useEffect(() => {
    if (isAutoAdvanceEnabled && !showBlackjack && !currentChoices.length) {
      if (autoAdvanceTimer.current) {
        clearTimeout(autoAdvanceTimer.current);
      }
      
      autoAdvanceTimer.current = setTimeout(() => {
        if (handleNext) handleNext();
      }, autoAdvanceDelay);
      
      return () => {
        if (autoAdvanceTimer.current) {
          clearTimeout(autoAdvanceTimer.current);
          autoAdvanceTimer.current = null;
        }
      };
    }
  }, [isAutoAdvanceEnabled, showBlackjack, currentChoices, handleNext, dialogIndex, autoAdvanceDelay]);
  
  useEffect(() => {
    if (isSkipEnabled && !showBlackjack && !currentChoices.length) {
      if (readDialogs[`${dialogIndex}`]) {
        handleNext();
      }
    }
  }, [isSkipEnabled, showBlackjack, currentChoices, readDialogs, dialogIndex, handleNext]);
  
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);
  
  const toggleAutoAdvance = useCallback(() => {
    if (onToggleAuto) {
      onToggleAuto();
    } else {
      setSettings(prev => ({
        ...prev,
        autoAdvance: !prev.autoAdvance
      }));
    }
  }, [onToggleAuto, setSettings]);
  
  const toggleSkipRead = useCallback(() => {
    if (onToggleSkip) {
      onToggleSkip();
    } else {
      setSettings(prev => ({
        ...prev,
        skipRead: !prev.skipRead
      }));
    }
  }, [onToggleSkip, setSettings]);
  
  const adjustTextSpeed = useCallback((speed) => {
    if (onAdjustTextSpeed) {
      onAdjustTextSpeed(speed);
    } else {
      setTextSpeed(speed);
      setSettings(prev => ({
        ...prev,
        textSpeed: speed
      }));
    }
  }, [onAdjustTextSpeed, setSettings]);
  
  useHotkeys('space, enter', (e) => {
    e.preventDefault();
    if (!showBlackjack && !isMenuOpen) {
      if (currentChoices.length === 0) {
        handleNext();
      }
    }
  }, { enabled: !showBlackjack && !isMenuOpen }, [handleNext, currentChoices, showBlackjack, isMenuOpen]);
  
  useHotkeys('1,2,3,4,5,6,7,8,9', (e) => {
    e.preventDefault();
    if (!showBlackjack && !isMenuOpen && currentChoices.length > 0) {
      const choiceIndex = parseInt(e.key) - 1;
      if (choiceIndex >= 0 && choiceIndex < currentChoices.length) {
        handleChoiceSelected(currentChoices[choiceIndex]);
      }
    }
  }, { enabled: !showBlackjack && !isMenuOpen && currentChoices.length > 0 }, [handleChoiceSelected, currentChoices, showBlackjack, isMenuOpen]);
  
  useHotkeys('escape', (e) => {
    e.preventDefault();
    if (showHistory) {
      setShowHistory(false);
    } else if (isMenuOpen) {
      setIsMenuOpen(false);
    } else {
      toggleMenu();
    }
  }, {}, [toggleMenu, isMenuOpen, showHistory]);
  
  useHotkeys('a', () => toggleAutoAdvance(), { enabled: !showBlackjack }, [toggleAutoAdvance, showBlackjack]);
  useHotkeys('s', () => toggleSkipRead(), { enabled: !showBlackjack }, [toggleSkipRead, showBlackjack]);
  useHotkeys('h', () => setShowHistory(prev => !prev), { enabled: !showBlackjack && !isMenuOpen }, [showBlackjack, isMenuOpen]);
  useHotkeys('f5', () => saveGameState('quick'), { enabled: !showBlackjack }, [saveGameState, showBlackjack]);
  useHotkeys('f9', () => loadGameState('quick'), { enabled: !showBlackjack }, [loadGameState, showBlackjack]);
  
  return {
    isMenuOpen,
    showHistory,
    dialogHistory,
    autoAdvanceDelay,
    textSpeed,
    settings,
    
    handleNext,
    handleChoiceSelected,
    toggleMenu,
    toggleAutoAdvance,
    toggleSkipRead,
    adjustTextSpeed,
    saveGameState,
    loadGameState,
    setIsMenuOpen,
    setShowHistory,
    setAutoAdvanceDelay,
    
    MenuComponent: ({ onClose }) => (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4" style={{ 
          backgroundColor: settings.customTheme?.menuBgColor || '#1F2937', 
          color: settings.customTheme?.menuTextColor || '#F3F4F6'
        }}>
          <h2 className="text-xl font-bold mb-4">Menu</h2>
          <div className="space-y-3">
            <button 
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
              onClick={() => { 
                saveGameState('manual'); 
                onClose(); 
              }}
            >
              Save Game
            </button>
            <button 
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
              onClick={() => { 
                loadGameState('manual'); 
                onClose(); 
              }}
            >
              Load Game
            </button>
            
            <div className="pt-2 border-t border-gray-600">
              <label className="flex items-center cursor-pointer hover:bg-gray-700 p-2 rounded">
                <input 
                  type="checkbox" 
                  checked={isAutoAdvanceEnabled || settings.autoAdvance} 
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleAutoAdvance();
                  }}
                  className="mr-3"
                />
                <span>Auto-Advance (A)</span>
              </label>
            </div>
            
            <div>
              <label className="flex items-center cursor-pointer hover:bg-gray-700 p-2 rounded">
                <input 
                  type="checkbox" 
                  checked={isSkipEnabled || settings.skipRead} 
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleSkipRead();
                  }}
                  className="mr-3"
                />
                <span>Skip Read Text (S)</span>
              </label>
            </div>
            
            <div className="pt-2">
              <label className="block mb-2 text-sm font-medium">Text Speed: {settings.textSpeed || textSpeed}</label>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={settings.textSpeed || textSpeed} 
                onChange={(e) => {
                  e.stopPropagation();
                  adjustTextSpeed(parseInt(e.target.value));
                }}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div className="pt-2 border-t border-gray-600">
              <button 
                className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 rounded transition-colors"
                onClick={() => { 
                  setShowHistory(true); 
                  onClose(); 
                }}
              >
                View History (H)
              </button>
            </div>
            
            <div className="pt-2 border-t border-gray-600">
              <button 
                className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 rounded transition-colors"
                onClick={() => {
                  if (confirm('Return to main menu? Unsaved progress will be lost.')) {
                    window.location.reload();
                  }
                }}
              >
                Return to Main Menu
              </button>
            </div>
            
            <button 
              className="mt-4 w-full py-2 px-4 bg-gray-700 hover:bg-gray-800 rounded transition-colors"
              onClick={onClose}
            >
              Close Menu
            </button>
          </div>
        </div>
      </div>
    ),
    
    HistoryComponent: ({ onClose }) => (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg p-4 max-w-2xl w-full mx-4 h-3/4 flex flex-col" style={{ 
          backgroundColor: settings.customTheme?.menuBgColor || '#1F2937', 
          color: settings.customTheme?.menuTextColor || '#F3F4F6'
        }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Dialog History</h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-white transition-colors text-xl w-8 h-8 flex items-center justify-center rounded hover:bg-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto pr-2">
            {dialogHistory.length === 0 ? (
              <div className="text-center text-gray-400 my-8">
                No dialog history yet.
              </div>
            ) : (
              <div className="space-y-4">
                {dialogHistory.map((dialog, idx) => (
                  <div key={idx} className="border-b border-gray-700 pb-3 last:border-b-0">
                    {dialog.speaker && (
                      <div className="font-bold text-blue-400 mb-1">
                        {dialog.speaker}
                      </div>
                    )}
                    <div className="text-gray-200 leading-relaxed">
                      {dialog.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="pt-4 border-t border-gray-600">
            <button 
              onClick={onClose}
              className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-800 rounded transition-colors"
            >
              Close History
            </button>
          </div>
        </div>
      </div>
    ),
    
    KeyboardHelpComponent: ({ onClose }) => (
      <div className="fixed right-4 bottom-24 bg-black bg-opacity-80 text-white p-3 rounded shadow-lg z-40 max-w-xs">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold">Keyboard Shortcuts</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-sm">✕</button>
        </div>
        <ul className="text-sm space-y-1 text-gray-300">
          <li><span className="text-yellow-400">Space/Enter</span> - Advance dialog</li>
          <li><span className="text-yellow-400">1-9</span> - Select choices</li>
          <li><span className="text-yellow-400">Esc</span> - Open/close menu</li>
          <li><span className="text-yellow-400">A</span> - Toggle auto-advance</li>
          <li><span className="text-yellow-400">S</span> - Toggle skip read text</li>
          <li><span className="text-yellow-400">H</span> - View history</li>
          <li><span className="text-yellow-400">F5</span> - Quick save</li>
          <li><span className="text-yellow-400">F9</span> - Quick load</li>
        </ul>
      </div>
    ),
  };
};

export const useAutoSave = ({ gameId, onSave, onLoad }) => {
  const [autoSaves, setAutoSaves] = useState([]);
  
  useEffect(() => {
    const saves = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(`${gameId || 'game'}-save-`)) {
        try {
          const saveData = JSON.parse(localStorage.getItem(key));
          saves.push({
            id: key.replace(`${gameId || 'game'}-save-`, ''),
            timestamp: saveData.timestamp,
            date: new Date(saveData.timestamp)
          });
        } catch (e) {
          console.error('Failed to load save:', key, e);
        }
      }
    }
    
    saves.sort((a, b) => b.date - a.date);
    setAutoSaves(saves);
  }, [gameId]);
  
  const createSave = useCallback((slotId = 'auto') => {
    if (!onSave) return false;
    
    const saveData = onSave();
    if (!saveData) return false;
    
    localStorage.setItem(`${gameId || 'game'}-save-${slotId}`, JSON.stringify({
      timestamp: new Date().toISOString(),
      data: saveData
    }));
    
    setAutoSaves(prev => {
      const newSaves = [...prev.filter(s => s.id !== slotId)];
      newSaves.unshift({
        id: slotId,
        timestamp: new Date().toISOString(),
        date: new Date()
      });
      return newSaves;
    });
    
    return true;
  }, [onSave, gameId]);
  
  const loadSave = useCallback((slotId = 'auto') => {
    if (!onLoad) return false;
    
    const savedGame = localStorage.getItem(`${gameId || 'game'}-save-${slotId}`);
    if (!savedGame) return false;
    
    try {
      const { data } = JSON.parse(savedGame);
      onLoad(data);
      return true;
    } catch (e) {
      console.error('Failed to load saved game:', e);
      return false;
    }
  }, [onLoad, gameId]);
  
  const deleteSave = useCallback((slotId) => {
    localStorage.removeItem(`${gameId || 'game'}-save-${slotId}`);
    setAutoSaves(prev => prev.filter(s => s.id !== slotId));
    return true;
  }, [gameId]);
  
  return {
    autoSaves,
    createSave,
    loadSave,
    deleteSave
  };
};

export const formatDate = (date) => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString(undefined, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const generateGameId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const KeyboardShortcutTooltip = ({ children, shortcut, placement = 'right' }) => {
  return (
    <div className="group relative inline-block">
      {children}
      <div className={`absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black text-white text-xs px-2 py-1 rounded pointer-events-none ${
        placement === 'top' ? 'bottom-full mb-1 left-1/2 transform -translate-x-1/2' :
        placement === 'bottom' ? 'top-full mt-1 left-1/2 transform -translate-x-1/2' :
        placement === 'left' ? 'right-full mr-1 top-1/2 transform -translate-y-1/2' :
        'left-full ml-1 top-1/2 transform -translate-y-1/2'
      }`}>
        {shortcut}
      </div>
    </div>
  );
};