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

// Macro Functions for Variable Updates
const macroFunctions = {
  // Relationship macros
  "increaseRelationship": (character, amount = 5) => ({
    [`${character}Relationship`]: `+${amount}`
  }),
  
  "decreaseRelationship": (character, amount = 3) => ({
    [`${character}Relationship`]: `-${amount}`
  }),
  
  "setRelationshipLevel": (character, level) => ({
    [`${character}Relationship`]: level.toString()
  }),
  
  // Money macros (keeping existing functionality)
  "addWinnings": (amount) => ({
    "playerMoney": `+${amount}`,
    "totalWinnings": `+${amount}`,
    "profit": `+${amount}`
  }),
  
  "addLosses": (amount) => ({
    "playerMoney": `-${amount}`,
    "totalLosses": `+${amount}`,
    "profit": `-${amount}`
  }),
  
  // Personality macros
  "beCharming": () => ({
    "playerPersonality": "charming",
    "charmPoints": "+2"
  }),
  
  "beAggressive": () => ({
    "playerPersonality": "aggressive", 
    "aggressionPoints": "+2"
  }),
  
  "beNeutral": () => ({
    "playerPersonality": "neutral"
  }),
  
  // Reputation macros
  "improveReputation": (amount = 10) => ({
    "casinoReputation": `+${amount}`,
    "visitCount": "+1"
  }),
  
  "damageReputation": (amount = 5) => ({
    "casinoReputation": `-${amount}`
  }),
  
  "unlockAchievement": (achievement) => ({
    "achievements": `push:${achievement}`
  }),
  
  // Combo macros
  "successfulDate": (character) => ({
    [`${character}Relationship`]: "+10",
    "casinoReputation": "+5",
    "dateCount": "+1"
  }),
  
  "badImpression": (character) => ({
    [`${character}Relationship`]: "-5",
    "casinoReputation": "-2"
  }),
  
  // Game state macros
  "increaseVisitCount": () => ({
    "visitCount": "+1"
  }),
  
  "addGamePlayed": (gameType) => ({
    "gamesPlayed": "+1",
    [`${gameType}GamesPlayed`]: "+1"
  })
};

// Conditional Templates
const conditionalTemplates = {
  // Relationship conditions
  "likesYou": {
    variable: "{character}Relationship",
    operator: ">=",
    value: 15,
    text: " {character} smiles warmly at you."
  },
  
  "lovesYou": {
    variable: "{character}Relationship", 
    operator: ">=",
    value: 30,
    text: " {character} looks at you with deep affection."
  },
  
  "dislikes": {
    variable: "{character}Relationship",
    operator: "<=", 
    value: -5,
    text: " {character} seems annoyed with you."
  },
  
  "hates": {
    variable: "{character}Relationship",
    operator: "<=",
    value: -15,
    text: " {character} glares at you with obvious dislike."
  },
  
  // Money conditions (keeping existing logic)
  "isRich": {
    variable: "playerMoney",
    operator: ">=",
    value: 5000,
    text: " Your wealth is clearly impressive."
  },
  
  "isBroke": {
    variable: "playerMoney",
    operator: "<=",
    value: 100,
    text: " You're running dangerously low on funds."
  },
  
  "hasModestFunds": {
    variable: "playerMoney",
    operator: ">=",
    value: 1000,
    text: " You have decent funds to play with."
  },
  
  "canAffordHighStakes": {
    variable: "playerMoney",
    operator: ">=",
    value: 1000,
    text: " You have enough for high stakes play."
  },
  
  "canAffordUltraStakes": {
    variable: "playerMoney",
    operator: ">=",
    value: 2000,
    text: " You have enough for ultra high stakes."
  },
  
  // Personality conditions
  "isCharming": {
    variable: "playerPersonality",
    operator: "==",
    value: "charming",
    text: " Your charm is evident."
  },
  
  "isAggressive": {
    variable: "playerPersonality",
    operator: "==",
    value: "aggressive",
    text: " Your aggressive nature shows."
  },
  
  // Reputation conditions
  "isVIP": {
    variable: "casinoReputation",
    operator: ">=",
    value: 75,
    text: " You're treated like casino royalty."
  },
  
  "isNewbie": {
    variable: "visitCount",
    operator: "<=",
    value: 2,
    text: " You're still learning the ropes here."
  },
  
  "isRegular": {
    variable: "visitCount",
    operator: ">=",
    value: 5,
    text: " You're a familiar face around here."
  },
  
  // Game-specific conditions
  "isWinning": {
    variable: "profit",
    operator: ">",
    value: 0,
    text: " You're ahead for the night."
  },
  
  "isLosing": {
    variable: "profit",
    operator: "<",
    value: 0,
    text: " You're down for the evening."
  }
};

const VisualNovelEngine = ({ playerData, selectedCharacters = {}, gameMetadata = {} }) => {
  const themeSettings = gameMetadata?.titleScreenTheme || {};
  const theme = applyTheme(themeSettings);
  const gameId = useRef(gameMetadata?.gameId || generateGameId());
  
  const playerIndex = selectedCharacters?.playerIndex ?? 0;
  const dealerIndex = selectedCharacters?.dealerIndex ?? 1;
  
  const [eventsData, setEventsData] = useState(
    Array.isArray(playerData) ? playerData : defaultEventData.events
  );
  
  // Enhanced game state with custom variables
  const [gameState, setGameState] = useState({
    // Existing functionality
    playerMoney: 1000,
    playerInitialMoney: 1000,
    profit: 0,
    completedEvents: [],
    totalHandsPlayed: 0,
    
    // New custom variables
    customVariables: {
      // Relationships
      victoriaRelationship: 0,
      rachelRelationship: 0,
      sophiaRelationship: 0,
      jasmineRelationship: 0,
      
      // Player characteristics
      playerPersonality: "neutral",
      charmPoints: 0,
      aggressionPoints: 0,
      
      // Game progression
      casinoReputation: 0,
      visitCount: 0,
      dateCount: 0,
      gamesPlayed: 0,
      blackjackGamesPlayed: 0,
      
      // Totals
      totalWinnings: 0,
      totalLosses: 0,
      
      // Achievements
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

  // Helper function to get variable value from combined state
  const getVariableValue = useCallback((variableName) => {
    // Check main game state first (existing functionality)
    if (gameState.hasOwnProperty(variableName)) {
      return gameState[variableName];
    }
    // Check custom variables
    if (gameState.customVariables && gameState.customVariables.hasOwnProperty(variableName)) {
      return gameState.customVariables[variableName];
    }
    return null;
  }, [gameState]);

  // Process macro functions
  const processMacros = useCallback((macros) => {
    if (!macros || !Array.isArray(macros)) return {};
    
    let updates = {};
    
    macros.forEach(macro => {
      if (typeof macro === 'string') {
        if (macro.includes(':')) {
          const [funcName, ...params] = macro.split(':');
          const macroFunc = macroFunctions[funcName];
          if (macroFunc) {
            const result = macroFunc(...params);
            updates = { ...updates, ...result };
          }
        } else {
          const macroFunc = macroFunctions[macro];
          if (macroFunc) {
            const result = macroFunc();
            updates = { ...updates, ...result };
          }
        }
      }
    });
    
    return updates;
  }, []);

  // Apply variable updates to state
  const applyVariableUpdates = useCallback((updates) => {
    if (!updates || Object.keys(updates).length === 0) return;
    
    setGameState(prevState => {
      const newState = { ...prevState };
      const newCustomVariables = { ...prevState.customVariables };
      
      Object.entries(updates).forEach(([key, value]) => {
        const stringValue = String(value);
        
        // Handle different update operations
        if (stringValue.startsWith('+')) {
          const addValue = parseFloat(stringValue.substring(1));
          const currentValue = getVariableValue(key) || 0;
          const newValue = (typeof currentValue === 'number' ? currentValue : 0) + addValue;
          
          if (newState.hasOwnProperty(key)) {
            newState[key] = newValue;
          } else {
            newCustomVariables[key] = newValue;
          }
        } else if (stringValue.startsWith('-')) {
          const subValue = parseFloat(stringValue.substring(1));
          const currentValue = getVariableValue(key) || 0;
          const newValue = (typeof currentValue === 'number' ? currentValue : 0) - subValue;
          
          if (newState.hasOwnProperty(key)) {
            newState[key] = newValue;
          } else {
            newCustomVariables[key] = newValue;
          }
        } else if (stringValue.startsWith('push:')) {
          const pushValue = stringValue.substring(5);
          const currentArray = getVariableValue(key) || [];
          const newArray = Array.isArray(currentArray) ? [...currentArray, pushValue] : [pushValue];
          
          if (newState.hasOwnProperty(key)) {
            newState[key] = newArray;
          } else {
            newCustomVariables[key] = newArray;
          }
        } else {
          // Set absolute value
          const newValue = isNaN(parseFloat(stringValue)) ? stringValue : parseFloat(stringValue);
          
          if (newState.hasOwnProperty(key)) {
            newState[key] = newValue;
          } else {
            newCustomVariables[key] = newValue;
          }
        }
      });
      
      return {
        ...newState,
        customVariables: newCustomVariables
      };
    });
  }, [getVariableValue]);

  // Evaluate a single condition
  const evaluateCondition = useCallback((condition, character = null) => {
    let variableName = condition.variable;
    
    // Replace character placeholder
    if (character && variableName.includes('{character}')) {
      variableName = variableName.replace('{character}', character);
    }
    
    const currentValue = getVariableValue(variableName);
    const conditionValue = condition.value;
    
    console.log(`Evaluating condition: ${variableName} ${condition.operator} ${conditionValue}`);
    console.log(`Current value: ${currentValue}, Required: ${conditionValue}`);
    
    let result = false;
    switch (condition.operator) {
      case '>=':
        result = currentValue >= conditionValue;
        break;
      case '<=':
        result = currentValue <= conditionValue;
        break;
      case '>':
        result = currentValue > conditionValue;
        break;
      case '<':
        result = currentValue < conditionValue;
        break;
      case '==':
        result = currentValue == conditionValue;
        break;
      case '!=':
        result = currentValue != conditionValue;
        break;
      default:
        result = false;
    }
    
    console.log(`Condition result: ${result}`);
    return result;
  }, [getVariableValue]);

  // Process conditional text
  const processConditions = useCallback((conditions) => {
    if (!conditions || !Array.isArray(conditions)) return '';
    
    let additionalText = '';
    
    conditions.forEach(condition => {
      if (typeof condition === 'string') {
        if (condition.includes(':')) {
          const [templateName, character] = condition.split(':');
          const template = conditionalTemplates[templateName];
          if (template && evaluateCondition(template, character)) {
            additionalText += template.text.replace('{character}', character || '');
          }
        } else {
          const template = conditionalTemplates[condition];
          if (template && evaluateCondition(template)) {
            additionalText += template.text;
          }
        }
      }
    });
    
    return additionalText;
  }, [evaluateCondition]);

  // Process conditional text object
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
          const [templateName, character] = condition.split(':');
          const template = conditionalTemplates[templateName];
          conditionMet = template && evaluateCondition(template, character);
        } else if (condition.includes(' ')) {
          // Handle inline conditions like "playerMoney >= 1000"
          const parts = condition.split(' ');
          if (parts.length === 3) {
            const [variable, operator, value] = parts;
            const numValue = isNaN(parseFloat(value)) ? value.replace(/"/g, '') : parseFloat(value);
            conditionMet = evaluateCondition({ variable, operator, value: numValue });
          }
        } else {
          const template = conditionalTemplates[condition];
          conditionMet = template && evaluateCondition(template);
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
  }, [evaluateCondition]);

  const handleToggleSkipRead = useCallback(() => {
    setSkipReadDialog(prev => !prev);
  }, []);

  const handleAdjustTextSpeed = useCallback((speed) => {
    setTextSpeed(speed);
  }, []);

  const handleToggleAutoAdvance = useCallback(() => {
    setAutoAdvance(prev => !prev);
  }, []);
  
  useEffect(() => {
    if (playerData && Array.isArray(playerData)) {
      setEventsData(playerData);
    }
  }, [playerData]);
  
  useEffect(() => {
    if (eventsData?.length > 0) {
      startEvent('intro');
    }
  }, [eventsData]);

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
        
        // Check condition
        if (typeof choice.requiresCondition === 'string') {
          // New condition format
          if (choice.requiresCondition.includes(':')) {
            const [templateName, character] = choice.requiresCondition.split(':');
            const template = conditionalTemplates[templateName];
            return template && evaluateCondition(template, character);
          } else {
            const template = conditionalTemplates[choice.requiresCondition];
            return template && evaluateCondition(template);
          }
        } else {
          // Legacy condition format
          const condition = choice.requiresCondition;
          const variableValue = getVariableValue(condition.variable);
          
          switch (condition.operator) {
            case '>=':
              return variableValue >= condition.value;
            case '<=':
              return variableValue <= condition.value;
            case '>':
              return variableValue > condition.value;
            case '<':
              return variableValue < condition.value;
            case '==':
              return variableValue == condition.value;
            case '!=':
              return variableValue != condition.value;
            default:
              return false;
          }
        }
      });
      
      setPlayerChoices(validChoices.length > 0 ? validChoices : null);
    } else {
      setPlayerChoices(null);
    }
  }, [evaluateCondition, getVariableValue]);

  const processDialogText = useCallback((dialogList, gameResult = null) => {
    return dialogList.map(dialog => {
      if (!dialog.text || typeof dialog.text !== 'string') return dialog;
      
      // Get current values (existing functionality)
      const moneyValue = gameResult?.playerMoney || gameState.playerMoney;
      const profitValue = gameResult?.profit || gameState.profit;
      const resultText = gameResult?.message || '';
      
      // Process macros if present
      if (dialog.macros) {
        const macroUpdates = processMacros(dialog.macros);
        applyVariableUpdates(macroUpdates);
      }
      
      // Start with base text replacement (existing functionality)
      let processedText = dialog.text
        .replace('{money}', moneyValue)
        .replace('{profit}', profitValue)
        .replace('{result}', resultText);
      
      // Replace custom variables
      Object.entries(gameState.customVariables || {}).forEach(([key, value]) => {
        processedText = processedText.replace(`{${key}}`, value);
      });
      
      // Process conditions
      if (dialog.conditions) {
        processedText += processConditions(dialog.conditions);
      }
      
      // Process conditional text object
      if (dialog.conditionalText) {
        processedText += processConditionalText(dialog.conditionalText);
      }
      
      // Existing conditional elements (keep for backward compatibility)
      if (dialog.conditionalElements) {
        if (dialog.conditionalElements.highRollerCondition && 
            moneyValue >= dialog.conditionalElements.highRollerCondition.value) {
          processedText += dialog.conditionalElements.highRollerCondition.additionalText;
        }
        
        if (dialog.conditionalElements.brokeCondition && 
            moneyValue < dialog.conditionalElements.brokeCondition.value) {
          processedText += dialog.conditionalElements.brokeCondition.additionalText;
        }
        
        const playerWon = gameResult?.playerMoney > gameResult?.initialPlayerMoney;
        if (dialog.conditionalElements.winCondition && playerWon) {
          processedText += dialog.conditionalElements.winCondition.additionalText;
        } else if (dialog.conditionalElements.loseCondition && !playerWon) {
          processedText += dialog.conditionalElements.loseCondition.additionalText;
        }
      }
      
      return {
        ...dialog,
        text: processedText,
        textSpeed: textSpeed,
        textAnimation: dialog.textAnimation || 'typewriter'
      };
    });
  }, [gameState.playerMoney, gameState.profit, gameState.customVariables, textSpeed, processMacros, applyVariableUpdates, processConditions, processConditionalText]);

  const startBlackjackGame = useCallback(() => {
    setShowBlackjack(true);
  }, []);

  const startEvent = useCallback((eventKey, previousGameResult = null) => {
    if (!eventsData?.length) return;
    
    const event = eventsData.find(e => e.key === eventKey);
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
  }, [currentEvent, dealerIndex, eventsData, gameState.playerMoney, playerIndex, processDialogText, startBlackjackGame, updateSceneFromDialog]);

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
    
    // Process macros from choice
    if (choice.macros) {
      const macroUpdates = processMacros(choice.macros);
      applyVariableUpdates(macroUpdates);
    }
    
    // Note: Condition checking removed here since we filter choices before display
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
  }, [currentDialog, dealerIndex, dialogIndex, gameState, getCostForEvent, getVariableValue, handleNext, playerData, playerIndex, startBlackjackGame, startEvent, processMacros, applyVariableUpdates]);

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
    
    // Apply game completion macros
    const gameCompletionMacros = ['addGamePlayed:blackjack'];
    const macroUpdates = processMacros(gameCompletionMacros);
    applyVariableUpdates(macroUpdates);
    
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
  }, [currentEvent, processDialogText, startEvent, updateSceneFromDialog, processMacros, applyVariableUpdates]);

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
    
    const event = eventsData.find(e => e.key === savedData.currentEvent);
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
  }, [eventsData, updateSceneFromDialog, textSpeed]);

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

  if (!eventsData?.length) {
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