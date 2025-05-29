import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import BlackjackGameComponent from '../blackjack/BlackjackGameComponent';
import DialogBox from '../blackjack/components/DialogBox';
import BackgroundScene from '../blackjack/components/BackgroundScene';
import CharacterDisplay from '../blackjack/components/CharacterDisplay';
import defaultEventData from '../data/gameData.json';
import { applyTheme, defaultTheme } from '../utils/themeManager';
import {
  useVisualNovelHelpers,
  useAutoSave,
  generateGameId,
  KeyboardShortcutTooltip
} from '../utils/visualNovelHelpers';
import { useMacroProcessor } from '../utils/MacroProcessor';

const VisualNovelEngine = ({ playerData, selectedCharacters = {}, gameMetadata = {} }) => {
  const themeSettings = gameMetadata?.titleScreenTheme || {};
  const theme = applyTheme(themeSettings);
  const gameId = useRef(gameMetadata?.gameId || generateGameId());

  const playerIndex = selectedCharacters?.playerIndex ?? 0;
  const dealerIndex = selectedCharacters?.dealerIndex ?? 1;

  // Parse game data (either array format or new unified format)
  const [gameData, setGameData] = useState(() => {
    console.log('Initializing gameData with playerData:', playerData);

    if (Array.isArray(playerData)) {
      // Legacy array format
      return {
        events: playerData,
        macros: {},
        conditionalTemplates: {}
      };
    } else if (playerData && typeof playerData === 'object') {
      // Check if this is the new metadata format
      if (playerData.metadata && (playerData.macros || playerData.events)) {
        console.log('Detected metadata format JSON');
        return {
          events: playerData.events || [],
          macros: playerData.macros || {},
          conditionalTemplates: playerData.conditionalTemplates || {},
          metadata: playerData.metadata // Store metadata too
        };
      }
      // Legacy unified format (no metadata wrapper)
      else if (playerData.events || playerData.macros) {
        console.log('Detected unified format JSON');
        return {
          events: playerData.events || [],
          macros: playerData.macros || {},
          conditionalTemplates: playerData.conditionalTemplates || {}
        };
      }
    }

    // Default fallback
    console.log('Using default fallback data');
    return {
      events: defaultEventData.events || [],
      macros: defaultEventData.macros || {},
      conditionalTemplates: defaultEventData.conditionalTemplates || {}
    };
  });

  // Initialize macro processor
  const {
    processMacros,
    processConditions,
    getVariableValue,
    processSingleMacro,
    getAvailableMacros,
    getMacroDefinition
  } = useMacroProcessor(gameData);

  // Enhanced game state with custom variables
  const [gameState, setGameState] = useState({
    // Existing functionality
    playerMoney: 1000,
    playerInitialMoney: 1000,
    profit: 0,
    completedEvents: [],
    totalHandsPlayed: 0,

    // New custom variables (now managed by MacroProcessor)
    customVariables: {
      victoriaRelationship: 0,
      rachelRelationship: 0,
      sophiaRelationship: 0,
      jasmineRelationship: 0,

      playerPersonality: "neutral",
      charmPoints: 0,
      aggressionPoints: 0,

      casinoReputation: 0,
      visitCount: 0,
      dateCount: 0,
      gamesPlayed: 0,
      blackjackGamesPlayed: 0,

      totalWinnings: 0,
      totalLosses: 0,

      achievements: []
    }
  });

  const [currentEvent, setCurrentEvent] = useState(null);
  const [currentDialog, setCurrentDialog] = useState(null);
  const [dialogIndex, setDialogIndex] = useState(0);
  const [showBlackjack, setShowBlackjack] = useState(false);
  const [blackjackParams, setBlackjackParams] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [characters, setCharacters] = useState({});
  const [background, setBackground] = useState(gameMetadata?.backgroundImage || '/backgrounds/default.png');
  const [playerChoices, setPlayerChoices] = useState(null);
  const [backgroundTransition, setBackgroundTransition] = useState('none');
  const [backgroundEffects, setBackgroundEffects] = useState(null);

  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [skipReadDialog, setSkipReadDialog] = useState(false);
  const [textSpeed, setTextSpeed] = useState(30);

  // Update game data when playerData changes
  useEffect(() => {
    if (playerData) {
      let newGameData;
      if (Array.isArray(playerData)) {
        newGameData = {
          events: playerData,
          macros: {},
          conditionalTemplates: {}
        };
      } else {
        newGameData = {
          events: playerData.events || [],
          macros: playerData.macros || {},
          conditionalTemplates: playerData.conditionalTemplates || {}
        };
      }
      setGameData(newGameData);
    }
  }, [playerData]);

  useEffect(() => {
    if (gameData.events?.length > 0) {
      startEvent('intro');
    }
  }, [gameData.events]);

  // Process conditional text using new system
  const processConditionalText = useCallback((conditionalText) => {
    if (!conditionalText || typeof conditionalText !== 'object') return '';

    let additionalText = '';

    Object.entries(conditionalText).forEach(([conditionKey, text]) => {
      // Handle multiple conditions with + separator
      const conditions = conditionKey.split(' + ');
      let allConditionsMet = true;

      for (const condition of conditions) {
        let conditionMet = false;

        if (condition.includes(':')) {
          // Template condition like "likesYou:rachel"
          const [templateName, character] = condition.split(':');
          const template = gameData.conditionalTemplates[templateName];
          if (template) {
            let variableName = template.variable.replace('{character}', character);
            const currentValue = getVariableValue(variableName, gameState);
            conditionMet = evaluateCondition(currentValue, template.operator, template.value);
          }
        } else if (condition.includes(' ')) {
          // Inline condition like "playerMoney >= 1000"
          const parts = condition.split(' ');
          if (parts.length === 3) {
            const [variable, operator, value] = parts;
            const currentValue = getVariableValue(variable, gameState);
            const numValue = isNaN(parseFloat(value)) ? value.replace(/"/g, '') : parseFloat(value);
            conditionMet = evaluateCondition(currentValue, operator, numValue);
          }
        } else {
          // Simple template condition
          const template = gameData.conditionalTemplates[condition];
          if (template) {
            const currentValue = getVariableValue(template.variable, gameState);
            conditionMet = evaluateCondition(currentValue, template.operator, template.value);
          }
        }

        if (!conditionMet) {
          allConditionsMet = false;
          break;
        }
      }

      if (allConditionsMet) {
        additionalText += text;
      }
    });

    return additionalText;
  }, [gameData.conditionalTemplates, getVariableValue, gameState]);

  // Helper function to evaluate conditions
  const evaluateCondition = useCallback((currentValue, operator, conditionValue) => {
    switch (operator) {
      case '>=': return currentValue >= conditionValue;
      case '<=': return currentValue <= conditionValue;
      case '>': return currentValue > conditionValue;
      case '<': return currentValue < conditionValue;
      case '==': return currentValue == conditionValue;
      case '!=': return currentValue != conditionValue;
      default: return false;
    }
  }, []);

  const handleToggleSkipRead = useCallback(() => {
    setSkipReadDialog(prev => !prev);
  }, []);

  const handleAdjustTextSpeed = useCallback((speed) => {
    setTextSpeed(speed);
  }, []);

  const handleToggleAutoAdvance = useCallback(() => {
    setAutoAdvance(prev => !prev);
  }, []);

  const getCostForEvent = useCallback((eventName, playerData, characterIndex) => {
    const defaultCost = 1000;

    try {
      const character = playerData?.[characterIndex];
      if (!character?.blackjackevents) return defaultCost;

      const event = character.blackjackevents.find(e => e.name === eventName);
      return event?.cost || defaultCost;
    } catch (error) {
      return defaultCost;
    }
  }, []);

  const updateSceneFromDialog = useCallback((dialog) => {
    if (dialog.background) {
      setBackground(dialog.background);
      setBackgroundTransition(dialog.backgroundTransition || 'none');
      setBackgroundEffects(dialog.backgroundEffects || null);
    }

    if (dialog.characters) {
      setCharacters(dialog.characters);
    }

    // Filter choices based on conditions before setting them
    if (dialog.choices) {
      const validChoices = dialog.choices.filter(choice => {
        if (!choice.requiresCondition) {
          return true; // No condition required, always show
        }

        // Check condition using new system
        if (typeof choice.requiresCondition === 'string') {
          if (choice.requiresCondition.includes(':')) {
            const [templateName, character] = choice.requiresCondition.split(':');
            const template = gameData.conditionalTemplates[templateName];
            if (template) {
              let variableName = template.variable.replace('{character}', character);
              const currentValue = getVariableValue(variableName, gameState);
              return evaluateCondition(currentValue, template.operator, template.value);
            }
          } else {
            const template = gameData.conditionalTemplates[choice.requiresCondition];
            if (template) {
              const currentValue = getVariableValue(template.variable, gameState);
              return evaluateCondition(currentValue, template.operator, template.value);
            }
          }
        }
        return false;
      });

      setPlayerChoices(validChoices.length > 0 ? validChoices : null);
    } else {
      setPlayerChoices(null);
    }
  }, [gameData.conditionalTemplates, getVariableValue, gameState, evaluateCondition]);

  const processDialogText = useCallback((dialogList, gameResult = null) => {
    return dialogList.map(dialog => {
      if (!dialog.text || typeof dialog.text !== 'string') return dialog;

      // Get current values (existing functionality)
      const moneyValue = gameResult?.playerMoney || gameState.playerMoney;
      const profitValue = gameResult?.profit || gameState.profit;
      const resultText = gameResult?.message || '';

      // Process macros if present using new system
      if (dialog.macros) {
        processMacros(dialog.macros, gameState, setGameState);
      }

      // Start with base text replacement (existing functionality)
      let processedText = dialog.text
        .replace('{money}', moneyValue)
        .replace('{profit}', profitValue)
        .replace('{result}', resultText);

      // Replace custom variables using new system
      Object.entries(gameState.customVariables || {}).forEach(([key, value]) => {
        processedText = processedText.replace(`{${key}}`, value);
      });

      // Process conditions using new system
      if (dialog.conditions) {
        processedText += processConditions(dialog.conditions, gameState);
      }

      // Process conditional text object using new system
      if (dialog.conditionalText) {
        processedText += processConditionalText(dialog.conditionalText);
      }

      return {
        ...dialog,
        text: processedText,
        textSpeed: textSpeed,
        textAnimation: dialog.textAnimation || 'typewriter'
      };
    });
  }, [gameState, textSpeed, processMacros, processConditions, processConditionalText]);

  const startBlackjackGame = useCallback(() => {
    setShowBlackjack(true);
  }, []);

  const startEvent = useCallback((eventKey, previousGameResult = null) => {
    if (!gameData.events?.length) return;

    const event = gameData.events.find(e => e.key === eventKey);
    if (!event) return;

    setCurrentEvent(event);
    setShowBlackjack(false);
    setGameCompleted(false);

    if (previousGameResult) {
      setGameState(prevState => ({
        ...prevState,
        playerMoney: previousGameResult.playerMoney,
        profit: previousGameResult.profit,
        totalHandsPlayed: prevState.totalHandsPlayed + previousGameResult.handsPlayed,
        completedEvents: [...prevState.completedEvents, currentEvent?.key].filter(Boolean)
      }));

      setBlackjackParams(prevParams => {
        const baseParams = prevParams || {
          playerIndex,
          dealerIndex,
          playerEvent: "Default Event",
          dealerEvent: "Default Event"
        };

        return {
          ...baseParams,
          playerCost: previousGameResult.playerMoney,
          dealerCost: previousGameResult.opponentsMoney?.[0] || 5000
        };
      });
    } else {
      const shouldUsePersistentMoney = event.usePreviousMoney === true;

      if (!shouldUsePersistentMoney) {
        setBlackjackParams(null);
      } else {
        setBlackjackParams({
          playerIndex,
          dealerIndex,
          playerEvent: event.playerEvent || "Default Event",
          dealerEvent: event.dealerEvent || "Default Event",
          playerCost: gameState.playerMoney,
          dealerCost: 5000,
          specialRules: event.specialRules
        });
      }
    }

    if (event.preDialog?.length) {
      const processedDialog = processDialogText(event.preDialog, previousGameResult);
      setCurrentDialog(processedDialog);
      setDialogIndex(0);

      if (processedDialog[0]) {
        updateSceneFromDialog(processedDialog[0]);
      }
    } else {
      startBlackjackGame();
    }
  }, [currentEvent, dealerIndex, gameData.events, gameState.playerMoney, playerIndex, processDialogText, startBlackjackGame, updateSceneFromDialog]);

  const handleNext = useCallback(() => {
    if (!showBlackjack) {
      if (dialogIndex < currentDialog.length - 1) {
        const nextIndex = dialogIndex + 1;
        setDialogIndex(nextIndex);

        if (currentDialog[nextIndex]) {
          updateSceneFromDialog(currentDialog[nextIndex]);
        }
      } else {
        if (!gameCompleted) {
          if (blackjackParams) {
            startBlackjackGame();
          } else if (currentEvent?.nextEvent) {
            startEvent(currentEvent.nextEvent);
          }
        } else {
          if (currentEvent?.nextEvent) {
            startEvent(currentEvent.nextEvent);
          }
        }
      }
    }
  }, [blackjackParams, currentDialog, currentEvent, dialogIndex, gameCompleted, showBlackjack, startBlackjackGame, startEvent, updateSceneFromDialog]);

  const handleChoiceSelected = useCallback((choice) => {
    setPlayerChoices(null);

    // Process macros from choice using new system
    if (choice.macros) {
      processMacros(choice.macros, gameState, setGameState);
    }

    console.log('Processing choice:', choice.text);

    if (choice.nextEvent) {
      startEvent(choice.nextEvent);
    } else if (choice.action === 'startGame' && choice.eventParams) {
      console.log('Starting game with params:', choice.eventParams);
      const params = {
        ...choice.eventParams,
        playerCost: choice.eventParams.usePreviousMoney
          ? gameState.playerMoney
          : (choice.eventParams.playerCost || getCostForEvent(choice.eventParams.playerEvent, playerData, playerIndex)),
        dealerCost: choice.eventParams.dealerCost || getCostForEvent(choice.eventParams.dealerEvent, playerData, dealerIndex),
        playerIndex,
        dealerIndex
      };

      setBlackjackParams(params);
      console.log('Set blackjack params:', params);

      if (dialogIndex < currentDialog.length - 1) {
        handleNext();
      } else {
        console.log('Starting blackjack game immediately');
        startBlackjackGame();
      }
    } else if (choice.action === 'exit') {
      window.location.reload();
    } else {
      handleNext();
    }
  }, [currentDialog, dealerIndex, dialogIndex, gameState, getCostForEvent, handleNext, playerData, playerIndex, startBlackjackGame, startEvent, processMacros]);

  const handleGameComplete = useCallback((result, finalScore) => {
    setShowBlackjack(false);
    setGameCompleted(true);

    const gameResult = {
      message: result,
      playerMoney: finalScore.player,
      opponentsMoney: finalScore.opponents,
      profit: finalScore.player - finalScore.initialPlayer,
      handsPlayed: finalScore.handsPlayed,
      initialPlayerMoney: finalScore.initialPlayer
    };

    setGameState(prevState => ({
      ...prevState,
      playerMoney: finalScore.player,
      profit: finalScore.player - finalScore.initialPlayer,
      totalHandsPlayed: prevState.totalHandsPlayed + finalScore.handsPlayed,
      completedEvents: [...prevState.completedEvents, currentEvent?.key].filter(Boolean)
    }));

    // Apply game completion macros using new system
    const gameCompletionMacros = ['addGamePlayed:blackjack'];
    processMacros(gameCompletionMacros, gameState, setGameState);

    if (currentEvent?.postDialog?.length) {
      const postDialog = processDialogText(currentEvent.postDialog, gameResult);
      setCurrentDialog(postDialog);
      setDialogIndex(0);

      if (postDialog[0]) {
        updateSceneFromDialog(postDialog[0]);
      }
    } else {
      if (currentEvent?.nextEvent) {
        startEvent(currentEvent.nextEvent, gameResult);
      }
    }
  }, [currentEvent, processDialogText, startEvent, updateSceneFromDialog, processMacros, gameState]);

  const saveGame = useCallback(() => {
    if (!currentEvent) return null;

    return {
      currentEvent: currentEvent.key,
      dialogIndex,
      gameState,
      blackjackParams,
      gameCompleted,
      background,
      backgroundTransition,
      backgroundEffects,
    };
  }, [currentEvent, dialogIndex, gameState, blackjackParams, gameCompleted, background, backgroundTransition, backgroundEffects]);

  const loadGame = useCallback((savedData) => {
    if (!savedData || !savedData.currentEvent) return false;

    setGameState(savedData.gameState);

    const event = gameData.events.find(e => e.key === savedData.currentEvent);
    if (!event) return false;

    setCurrentEvent(event);
    setShowBlackjack(false);
    setGameCompleted(savedData.gameCompleted);

    setBlackjackParams(savedData.blackjackParams);

    setBackground(savedData.background);
    setBackgroundTransition(savedData.backgroundTransition || 'none');
    setBackgroundEffects(savedData.backgroundEffects || null);

    let dialog;
    if (savedData.gameCompleted && event.postDialog?.length) {
      dialog = event.postDialog;
    } else if (!savedData.gameCompleted && event.preDialog?.length) {
      dialog = event.preDialog;
    } else {
      return false;
    }

    const processedDialog = dialog.map(d => ({
      ...d,
      textSpeed
    }));

    setCurrentDialog(processedDialog);
    setDialogIndex(Math.min(savedData.dialogIndex, dialog.length - 1));

    if (dialog[savedData.dialogIndex]) {
      updateSceneFromDialog(dialog[savedData.dialogIndex]);
    }

    return true;
  }, [gameData.events, updateSceneFromDialog, textSpeed]);

  const {
    isMenuOpen,
    showHistory,
    dialogHistory,
    toggleMenu,
    toggleAutoAdvance,
    toggleSkipRead,
    adjustTextSpeed,
    saveGameState,
    loadGameState,
    setIsMenuOpen,
    setShowHistory,
    MenuComponent,
    HistoryComponent,
    KeyboardHelpComponent,
  } = useVisualNovelHelpers({
    onNext: handleNext,
    onChoiceSelected: handleChoiceSelected,
    playerChoices,
    dialogIndex,
    totalDialogs: currentDialog?.length || 0,
    onSave: saveGame,
    onLoad: loadGame,
    onToggleAuto: () => setAutoAdvance(prev => !prev),
    onToggleSkip: () => setSkipReadDialog(prev => !prev),
    onAdjustTextSpeed: setTextSpeed,
    isAutoAdvanceEnabled: autoAdvance,
    isSkipEnabled: skipReadDialog,
    showBlackjack,
    gameId: gameId.current,
    currentDialog
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showBlackjack || isMenuOpen) return;

      if (e.key === 'a' || e.key === 'A') {
        handleToggleAutoAdvance();
      }

      if (e.key === 's' || e.key === 'S') {
        handleToggleSkipRead();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showBlackjack, isMenuOpen, handleToggleAutoAdvance, handleToggleSkipRead]);

  const { autoSaves, createSave, loadSave, deleteSave } = useAutoSave({
    gameId: gameId.current,
    onSave: saveGame,
    onLoad: loadGame
  });

  // Memoize the current dialog data to prevent recreation
  const currentDialogData = useMemo(() => {
    if (!currentDialog || dialogIndex >= currentDialog.length) return null;

    return {
      ...currentDialog[dialogIndex],
      textSpeed: textSpeed
    };
  }, [currentDialog, dialogIndex, textSpeed]);

  // Debug info for macro system
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('Available macros:', getAvailableMacros());
      console.log('Game data macros:', gameData.macros);
      console.log('Conditional templates:', gameData.conditionalTemplates);
    }
  }, [gameData, getAvailableMacros]);

  if (!gameData.events?.length) {
    return (
      <div
        className="w-full h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.secondaryColor }}
      >
        <div style={{ color: theme.accentColor }} className="text-xl">Loading game data...</div>
      </div>
    );
  }

  return (
    <div
      className="w-full h-screen relative overflow-hidden"
      style={{ backgroundColor: theme.backgroundColor || theme.secondaryColor }}
    >
      {!showBlackjack && (
        <button
          className="absolute top-4 left-4 px-3 py-1 rounded z-50 text-sm flex items-center"
          style={{
            backgroundColor: `${theme.primaryColor}99`,
            color: theme.textColor,
            border: `1px solid ${theme.accentColor}`
          }}
          onClick={() => window.location.reload()}
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Main Menu
        </button>
      )}

      {!showBlackjack && (
        <div className="absolute top-4 right-4 flex items-center z-50 space-x-2">
          <div
            className="px-3 py-1 rounded flex items-center"
            style={{
              backgroundColor: `${theme.primaryColor}99`,
              color: theme.textColor,
              border: `1px solid ${theme.accentColor}`
            }}
          >
            <span style={{ color: theme.accentColor }} className="mr-2">Money:</span>
            <span className="font-bold">${gameState.playerMoney}</span>
            {gameState.profit !== 0 && (
              <span className={`ml-2 text-sm`} style={{
                color: gameState.profit > 0 ? '#4CAF50' : '#F44336'
              }}>
                {gameState.profit > 0 ? '+' : ''}{gameState.profit}
              </span>
            )}
          </div>

          {/* Macro Debug Info (Dev only) */}
          {import.meta.env.DEV && (
            <div
              className="px-2 py-1 rounded text-xs"
              style={{
                backgroundColor: `${theme.primaryColor}99`,
                color: theme.textColor,
                border: `1px solid ${theme.accentColor}`
              }}
              title={`Macros: ${getAvailableMacros().length}`}
            >
              🔧 {getAvailableMacros().length}
            </div>
          )}

          <button
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: `${theme.primaryColor}99`,
              color: theme.textColor,
              border: `1px solid ${theme.accentColor}`
            }}
            onClick={toggleMenu}
            title="Menu (Esc)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <button
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: `${theme.primaryColor}99`,
              color: theme.textColor,
              border: `1px solid ${theme.accentColor}`
            }}
            onClick={() => setShowKeyboardHelp(prev => !prev)}
            title="Keyboard Shortcuts"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      )}

      {!showBlackjack && (autoAdvance || skipReadDialog) && (
        <div className="absolute top-14 right-4 z-50 flex space-x-2">
          {autoAdvance && (
            <div
              className="px-2 py-1 rounded text-xs"
              style={{
                backgroundColor: `${theme.primaryColor}99`,
                color: theme.textColor,
                border: `1px solid ${theme.accentColor}`
              }}
            >
              Auto (A)
            </div>
          )}
          {skipReadDialog && (
            <div
              className="px-2 py-1 rounded text-xs"
              style={{
                backgroundColor: `${theme.primaryColor}99`,
                color: theme.textColor,
                border: `1px solid ${theme.accentColor}`
              }}
            >
              Skip (S)
            </div>
          )}
        </div>
      )}

      <BackgroundScene
        background={background}
        transition={backgroundTransition}
        effects={backgroundEffects}
      />

      {!showBlackjack && <CharacterDisplay characters={characters} />}

      {showBlackjack && blackjackParams && (
        <div className="absolute inset-0 z-20">
          <BlackjackGameComponent
            initialEvent={{
              action: 'startGame',
              eventParams: blackjackParams
            }}
            onGameComplete={handleGameComplete}
            playerData={playerData}
            selectedCharacters={{
              playerIndex: blackjackParams.playerIndex || playerIndex,
              dealerIndex: blackjackParams.dealerIndex || dealerIndex,
              opponentIndices: blackjackParams.opponentIndices || [dealerIndex]
            }}
            numOpponents={blackjackParams.numOpponents || 1}
          />
        </div>
      )}

      {!showBlackjack && currentDialogData && (
        <div className="absolute bottom-0 left-0 right-0 z-30">
          <DialogBox
            dialog={currentDialogData}
            onNext={playerChoices ? null : handleNext}
            choices={playerChoices}
            onChoiceSelected={handleChoiceSelected}
            theme={theme}
            isAutoPlayEnabled={autoAdvance}
            isSkipEnabled={skipReadDialog}
            characters={characters}
          />
        </div>
      )}

      {isMenuOpen && (
        <MenuComponent onClose={() => setIsMenuOpen(false)} />
      )}

      {showHistory && (
        <HistoryComponent onClose={() => setShowHistory(false)} />
      )}

      {showKeyboardHelp && (
        <KeyboardHelpComponent onClose={() => setShowKeyboardHelp(false)} />
      )}

      <div id="notification-container" className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50"></div>
    </div>
  );
};

export default VisualNovelEngine;