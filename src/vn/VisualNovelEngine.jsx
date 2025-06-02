import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import BlackjackGameComponent from '../blackjack/BlackjackGameComponent';
import DanceComponent from '../dance/DanceComponent';
import DartGame from './dart/DartGame';
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
import { MacroProcessor } from '../utils/MacroProcessor';

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
    processConditionalText,
    evaluateCondition,
    getVariableValue,
    processSingleMacro,
    getAvailableMacros,
    getMacroDefinition,
    processOperation,
  } = useMacroProcessor(gameData);

  const macroProcessor = useMemo(() => {
    if (!gameData.macros) return null;

    return new MacroProcessor(
      gameData.macros,
      gameData.conditionalTemplates || {}
    );
  }, [gameData.macros, gameData.conditionalTemplates]);

  const [gameState, setGameState] = useState({
    playerMoney: 1000,
    playerInitialMoney: 1000,
    profit: 0,
    completedEvents: [],
    totalHandsPlayed: 0,

    customVariables: {}
  });

  const [currentEvent, setCurrentEvent] = useState(null);
  const [currentDialog, setCurrentDialog] = useState(null);
  const [dialogIndex, setDialogIndex] = useState(0);
  const [showBlackjack, setShowBlackjack] = useState(false);
  const [showDance, setShowDance] = useState(false);
  const [showDart, setShowDart] = useState(false); // NEW: Dart game state
  const [blackjackParams, setBlackjackParams] = useState(null);
  const [danceParams, setDanceParams] = useState(null);
  const [dartParams, setDartParams] = useState(null); // NEW: Dart game parameters
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

  // NEW: Flow control state
  const [pendingFlowControl, setPendingFlowControl] = useState(null);

  const processMacrosWithFlow = useCallback((macros, currentState) => {
    if (!macroProcessor || !macros || macros.length === 0) {
      return { flowControl: null, newState: currentState };
    }

    if (import.meta.env.DEV) {
      console.log('Processing macros with flow control:', macros);
      console.log('Current state before processing:', currentState);
    }

    // Use the MacroProcessor's processMacros method which now handles sequential operations
    const updates = macroProcessor.processMacros(macros, currentState);

    // Extract flow control if present
    let flowControl = null;
    if (updates.flowControl) {
      flowControl = updates.flowControl;
      delete updates.flowControl; // Remove from regular updates
    }

    // Apply updates to create new state
    let newState = { ...currentState };

    Object.entries(updates).forEach(([variable, value]) => {
      if (import.meta.env.DEV) {
        console.log(`Applying update: ${variable} = ${value}`);
      }

      // Check if this is a built-in variable (exists directly on gameState)
      if (variable in newState && variable !== 'customVariables') {
        newState[variable] = value;
      } else {
        // This is a custom variable
        if (!newState.customVariables) {
          newState.customVariables = {};
        }
        newState.customVariables[variable] = value;
      }
    });

    if (import.meta.env.DEV) {
      console.log('New state after processing:', newState);
      if (flowControl) {
        console.log('Flow control triggered:', flowControl);
      }
    }

    return {
      flowControl,
      newState
    };
  }, [macroProcessor]);

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

  // NEW: Handle pending flow control
  useEffect(() => {
    if (pendingFlowControl) {
      if (import.meta.env.DEV) {
        console.log('Executing pending flow control:', pendingFlowControl);
      }

      const timer = setTimeout(() => {
        startEvent(pendingFlowControl);
        setPendingFlowControl(null);
      }, 100); // Small delay to ensure state updates complete

      return () => clearTimeout(timer);
    }
  }, [pendingFlowControl]);

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

  const updateSceneFromDialog = useCallback((dialog, finalState = null) => {
    const stateToUse = finalState || gameState;

    if (dialog.background) {
      setBackground(dialog.background);
      setBackgroundTransition(dialog.backgroundTransition || 'none');
      setBackgroundEffects(dialog.backgroundEffects || null);
    }

    if (dialog.characters) {
      setCharacters(dialog.characters);
    }

    // FIXED: Process choices with proper custom variable access
    if (dialog.choices) {
      const validChoices = dialog.choices.filter(choice => {
        if (!choice.requiresCondition) {
          return true;
        }

        try {
          // Use MacroProcessor to evaluate complex conditions with proper variable access
          if (macroProcessor) {
            const conditionMet = macroProcessor.parseComplexCondition(choice.requiresCondition, stateToUse);

            if (import.meta.env.DEV) {
              console.log(`Choice condition "${choice.requiresCondition}" evaluated to: ${conditionMet}`);
              console.log('Available variables for condition check:', {
                builtin: Object.keys(stateToUse).filter(k => k !== 'customVariables'),
                custom: Object.keys(stateToUse.customVariables || {})
              });
            }

            return conditionMet;
          }
          return true; // Fallback if no macro processor
        } catch (error) {
          if (import.meta.env.DEV) {
            console.warn('Error evaluating choice condition:', choice.requiresCondition, error);
          }
          return false;
        }
      });

      setPlayerChoices(validChoices.length > 0 ? validChoices : null);
    } else {
      setPlayerChoices(null);
    }
  }, [gameState, macroProcessor]);

  const processDialogTextWithState = useCallback((dialogText, state) => {
    if (!dialogText || typeof dialogText !== 'string') {
      return dialogText;
    }

    let processedText = dialogText;

    // Replace variables with current values
    processedText = processedText.replace(/{(\w+)}/g, (match, variableName) => {
      // Skip special variables that are handled separately
      if (['money', 'profit', 'result', 'grade', 'accuracy', 'perfectHits', 'totalBeats', 'partner', 'playerScore', 'opponentScore', 'playerAverage', 'opponentAverage', 'winner', 'opponentName'].includes(variableName)) {
        return match;
      }

      // FIXED: Use getVariableValue from MacroProcessor instead of direct state access
      const value = getVariableValue(variableName, state);

      if (value === null || value === undefined) {
        if (import.meta.env.DEV) {
          console.warn(`Variable ${variableName} not found in state`);
          console.log('Available built-in variables:', Object.keys(state).filter(k => k !== 'customVariables'));
          console.log('Available custom variables:', Object.keys(state.customVariables || {}));
        }
        return match; // Keep placeholder if variable doesn't exist
      }

      // Smart formatting based on value type
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return "none";
        } else if (value.length <= 3) {
          return value.join(", ");
        } else {
          return `${value.slice(0, 3).join(", ")} and ${value.length - 3} more`;
        }
      } else if (typeof value === 'boolean') {
        return value ? "yes" : "no";
      } else if (typeof value === 'number') {
        return value.toString();
      } else if (typeof value === 'string') {
        return value;
      } else {
        return String(value);
      }
    });

    return processedText;
  }, [getVariableValue]);

  const processCompleteDialog = useCallback((dialog, currentState) => {
    let finalState = { ...currentState };
    let flowControl = null;

    // Process macros first if they exist
    if (dialog.macros && dialog.macros.length > 0) {
      const macroResult = processMacrosWithFlow(dialog.macros, finalState);

      finalState = macroResult.newState;
      flowControl = macroResult.flowControl;
    }

    // Process dialog text with final state
    let processedText = processDialogTextWithState(dialog.text, finalState);

    // Process conditions with final state using MacroProcessor
    if (dialog.conditions && macroProcessor) {
      for (const conditionKey of dialog.conditions) {
        const template = gameData.conditionalTemplates?.[conditionKey];
        if (template) {
          const conditionMet = macroProcessor.evaluateTemplateCondition(
            template,
            null,
            finalState
          );

          if (conditionMet) {
            processedText += template.text;
          }
        }
      }
    }

    // Process conditional text with final state using MacroProcessor
    if (dialog.conditionalText) {
      processedText += processConditionalText(dialog.conditionalText, finalState);
    }

    return {
      processedDialog: {
        ...dialog,
        text: processedText
      },
      finalState,
      flowControl
    };
  }, [processMacrosWithFlow, processDialogTextWithState, macroProcessor, gameData.conditionalTemplates, processConditionalText]);

  const processDialogText = useCallback((dialogList, gameResult = null, specificState = null) => {
    // Use specificState if provided, otherwise use current gameState
    const stateToUse = specificState || gameState;

    return dialogList.map(dialog => {
      if (!dialog.text || typeof dialog.text !== 'string') return dialog;
      console.log("debugger  "+ gameResult?.playerMoney || stateToUse.playerMoney);
      // Get current values for special variables (existing functionality)
      const moneyValue = gameResult?.playerMoney || stateToUse.playerMoney;
      const profitValue = gameResult?.profit || stateToUse.profit;
      const resultText = gameResult?.message || '';
      
      // Dance-specific variables
      const gradeValue = gameResult?.grade || '';
      const accuracyValue = gameResult?.accuracy || '';
      const perfectHitsValue = gameResult?.perfectHits || '';
      const totalBeatsValue = gameResult?.totalBeats || '';
      const partnerValue = gameResult?.partner || '';
      
      // NEW: Dart-specific variables
      const playerScoreValue = gameResult?.playerScore || '';
      const opponentScoreValue = gameResult?.opponentScore || '';
      const playerAverageValue = gameResult?.playerAverage || '';
      const opponentAverageValue = gameResult?.opponentAverage || '';
      const winnerValue = gameResult?.winner || '';
      const opponentNameValue = gameResult?.opponentName || '';

      // Start with base text replacement for special variables
      let processedText = dialog.text
        .replace(/\{money\}/g, moneyValue)
        .replace(/\{profit\}/g, profitValue)
        .replace(/\{result\}/g, resultText)
        .replace(/\{grade\}/g, gradeValue)
        .replace(/\{accuracy\}/g, accuracyValue)
        .replace(/\{perfectHits\}/g, perfectHitsValue)
        .replace(/\{totalBeats\}/g, totalBeatsValue)
        .replace(/\{partner\}/g, partnerValue)
        // NEW: Dart-specific replacements
        .replace(/\{playerScore\}/g, playerScoreValue)
        .replace(/\{opponentScore\}/g, opponentScoreValue)
        .replace(/\{playerAverage\}/g, playerAverageValue)
        .replace(/\{opponentAverage\}/g, opponentAverageValue)
        .replace(/\{winner\}/g, winnerValue)
        .replace(/\{opponentName\}/g, opponentNameValue);

      // FIXED: Replace ALL other variables using getVariableValue
      processedText = processedText.replace(/{(\w+)}/g, (match, variableName) => {
        // Skip if it's already been replaced
        if (['money', 'profit', 'result', 'grade', 'accuracy', 'perfectHits', 'totalBeats', 'partner', 'playerScore', 'opponentScore', 'playerAverage', 'opponentAverage', 'winner', 'opponentName'].includes(variableName)) {
          return match;
        }

        // FIXED: Use getVariableValue instead of direct access
        const value = getVariableValue(variableName, stateToUse);

        if (value === null || value === undefined) {
          if (import.meta.env.DEV) {
            console.warn(`Variable ${variableName} not found in state during dialog processing`);
          }
          return match; // Keep placeholder if variable doesn't exist
        }

        // Smart formatting based on value type
        if (Array.isArray(value)) {
          if (value.length === 0) {
            return "none";
          } else if (value.length <= 3) {
            return value.join(", ");
          } else {
            return `${value.slice(0, 3).join(", ")} and ${value.length - 3} more`;
          }
        } else if (typeof value === 'boolean') {
          return value ? "yes" : "no";
        } else if (typeof value === 'number') {
          return value.toString();
        } else if (typeof value === 'string') {
          return value;
        } else {
          return String(value);
        }
      });

      // Process conditions using new system
      if (dialog.conditions) {
        processedText += processConditions(dialog.conditions, stateToUse);
      }

      if (dialog.conditionalText) {
        processedText += processConditionalText(dialog.conditionalText, stateToUse);
      }

      return {
        ...dialog,
        text: processedText,
        textSpeed: textSpeed,
        textAnimation: dialog.textAnimation || 'typewriter'
      };
    });
  }, [gameState, textSpeed, processConditions, processConditionalText, getVariableValue]);

  const startBlackjackGame = useCallback(() => {
    setShowBlackjack(true);
    setShowDance(false);
    setShowDart(false); // NEW: Ensure dart is hidden
  }, []);

  const startDanceGame = useCallback(() => {
    setShowDance(true);
    setShowBlackjack(false);
    setShowDart(false); // NEW: Ensure dart is hidden
  }, []);

  // NEW: Start dart game function
  const startDartGame = useCallback(() => {
    setShowDart(true);
    setShowBlackjack(false);
    setShowDance(false);
  }, []);

  const startEvent = useCallback((eventKey, previousGameResult = null) => {
    if (!gameData.events?.length) return;

    if (import.meta.env.DEV) {
      console.log('Starting event:', eventKey);
    }

    const event = gameData.events.find(e => e.key === eventKey);
    if (!event) {
      if (import.meta.env.DEV) {
        console.warn('Event not found:', eventKey);
      }
      return;
    }

    setCurrentEvent(event);
    setShowBlackjack(false);
    setShowDance(false);
    setShowDart(false); // NEW: Reset dart state
    setGameCompleted(false);
    setPendingFlowControl(null);

    let currentStateForProcessing = { ...gameState };

    // Handle previous game result
    if (previousGameResult) {
      currentStateForProcessing = {
        ...currentStateForProcessing,
        playerMoney: previousGameResult.playerMoney,
        profit: previousGameResult.profit,
        totalHandsPlayed: currentStateForProcessing.totalHandsPlayed + previousGameResult.handsPlayed,
        completedEvents: [...currentStateForProcessing.completedEvents, currentEvent?.key].filter(Boolean)
      };

      setGameState(currentStateForProcessing);

      // Set parameters for all games
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

      setDanceParams(prevParams => {
        const baseParams = prevParams || {
          partner: "Unknown",
          song: { bpm: 120, duration: 180 },
          difficulty: "medium"
        };

        return {
          ...baseParams,
          gameState: currentStateForProcessing
        };
      });

      // NEW: Set dart parameters
      setDartParams(prevParams => {
        const baseParams = prevParams || {
          opponentName: "Opponent",
          opponentSkill: "medium",
          dartsPerPlayer: 9,
          gameMode: "highest_score"
        };

        return {
          ...baseParams,
          gameState: currentStateForProcessing
        };
      });
    } else {
      const shouldUsePersistentMoney = event.usePreviousMoney === true;

      if (!shouldUsePersistentMoney) {
        setBlackjackParams(null);
        setDanceParams(null);
        setDartParams(null); // NEW: Reset dart params
      } else {
        setBlackjackParams({
          playerIndex,
          dealerIndex,
          playerEvent: event.playerEvent || "Default Event",
          dealerEvent: event.dealerEvent || "Default Event",
          playerCost: currentStateForProcessing.playerMoney,
          dealerCost: 5000,
          specialRules: event.specialRules
        });

        setDanceParams({
          partner: event.partner || "Unknown",
          song: event.song || { bpm: 120, duration: 180 },
          difficulty: event.difficulty || "medium",
          gameState: currentStateForProcessing
        });

        // NEW: Set default dart parameters
        setDartParams({
          opponentName: event.opponentName || "Opponent",
          opponentSkill: event.opponentSkill || "medium",
          dartsPerPlayer: event.dartsPerPlayer || 9,
          gameMode: event.gameMode || "highest_score",
          gameState: currentStateForProcessing
        });
      }
    }

    if (event.preDialog?.length) {
      // Process ALL dialogs with macros-first flow
      const processedDialogs = [];
      let workingState = currentStateForProcessing;

      for (let i = 0; i < event.preDialog.length; i++) {
        const dialog = event.preDialog[i];
        const result = processCompleteDialog(dialog, workingState);

        if (result.flowControl) {
          setPendingFlowControl(result.flowControl);
          return; // Exit early if flow control is triggered
        }

        processedDialogs.push(result.processedDialog);
        workingState = result.finalState; // Use updated state for next dialog
      }

      // Update the final state after processing all dialogs
      setGameState(workingState);

      setCurrentDialog(processedDialogs);
      setDialogIndex(0);

      if (processedDialogs[0]) {
        updateSceneFromDialog(processedDialogs[0], workingState);
      }
    } else {
      // Default to blackjack if no specific game is set
      startBlackjackGame();
    }
  }, [currentEvent, dealerIndex, gameData.events, gameState, playerIndex, startBlackjackGame, startDanceGame, startDartGame, updateSceneFromDialog, processCompleteDialog]);

  const handleNext = useCallback(() => {
    if (!showBlackjack && !showDance && !showDart) { // NEW: Check all game states
      if (dialogIndex < currentDialog.length - 1) {
        const nextIndex = dialogIndex + 1;
        setDialogIndex(nextIndex);

        if (currentDialog[nextIndex]) {
          // Dialog is already processed with correct state, just update scene
          updateSceneFromDialog(currentDialog[nextIndex]);
        }
      } else {
        if (!gameCompleted) {
          if (blackjackParams) {
            startBlackjackGame();
          } else if (danceParams) {
            startDanceGame();
          } else if (dartParams) { // NEW: Check for dart params
            startDartGame();
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
  }, [blackjackParams, danceParams, dartParams, currentDialog, currentEvent, dialogIndex, gameCompleted, showBlackjack, showDance, showDart, startBlackjackGame, startDanceGame, startDartGame, startEvent, updateSceneFromDialog]);

  const handleChoiceSelected = useCallback((choice) => {
    setPlayerChoices(null);

    if (import.meta.env.DEV) {
      console.log('Processing choice:', choice.text);
      console.log('Choice macros:', choice.macros);
    }

    let currentState = { ...gameState };

    // Process macros from choice
    if (choice.macros && choice.macros.length > 0) {
      const { flowControl, newState } = processMacrosWithFlow(choice.macros, currentState);

      if (newState) {
        setGameState(newState);
        currentState = newState;
      }

      if (flowControl) {
        if (import.meta.env.DEV) {
          console.log('Choice triggered flow control:', flowControl);
        }
        setPendingFlowControl(flowControl);
        return;
      }
    }

    // Continue with existing logic
    if (choice.nextEvent) {
      startEvent(choice.nextEvent);
    } else if (choice.action === 'startGame' && choice.eventParams) {
      if (import.meta.env.DEV) {
        console.log('Starting game with params:', choice.eventParams);
      }
      const params = {
        ...choice.eventParams,
        playerCost: choice.eventParams.usePreviousMoney
          ? currentState.playerMoney
          : (choice.eventParams.playerCost || getCostForEvent(choice.eventParams.playerEvent, playerData, playerIndex)),
        dealerCost: choice.eventParams.dealerCost || getCostForEvent(choice.eventParams.dealerEvent, playerData, dealerIndex),
        playerIndex,
        dealerIndex
      };

      setBlackjackParams(params);

      if (dialogIndex < currentDialog.length - 1) {
        handleNext();
      } else {
        startBlackjackGame();
      }
    } 
    else if (choice.action === 'startDance' && choice.eventParams) {
      if (import.meta.env.DEV) {
        console.log('Starting dance with params:', choice.eventParams);
      }
      const params = {
        ...choice.eventParams,
        gameState: currentState
      };

      setDanceParams(params);

      if (dialogIndex < currentDialog.length - 1) {
        handleNext();
      } else {
        startDanceGame();
      }
    }
    // NEW: Handle startDart action
    else if (choice.action === 'startDart' && choice.eventParams) {
      if (import.meta.env.DEV) {
        console.log('Starting dart with params:', choice.eventParams);
      }
      const params = {
        ...choice.eventParams,
        gameState: currentState
      };

      setDartParams(params);

      if (dialogIndex < currentDialog.length - 1) {
        handleNext();
      } else {
        startDartGame();
      }
    }
    else if (choice.action === 'exit') {
      window.location.reload();
    } else {
      handleNext();
    }
  }, [currentDialog, dealerIndex, dialogIndex, gameState, getCostForEvent, handleNext, playerData, playerIndex, startBlackjackGame, startDanceGame, startDartGame, startEvent, processMacrosWithFlow]);

  const handleGameComplete = useCallback((result, finalScore) => {
    setShowBlackjack(false);
    setShowDance(false);
    setShowDart(false); // NEW: Hide dart game
    setGameCompleted(true);

    const gameResult = {
      message: result,
      playerMoney: finalScore.player,
      opponentsMoney: finalScore.opponents,
      profit: finalScore.player - finalScore.initialPlayer,
      handsPlayed: finalScore.handsPlayed,
      initialPlayerMoney: finalScore.initialPlayer
    };

    // Update base game state first
    const newBaseState = {
      ...gameState,
      playerMoney: finalScore.player,
      profit: finalScore.player - finalScore.initialPlayer,
      totalHandsPlayed: gameState.totalHandsPlayed + finalScore.handsPlayed,
      completedEvents: [...gameState.completedEvents, currentEvent?.key].filter(Boolean)
    };

    // Apply game completion macros
    const gameCompletionMacros = ['addGamePlayed:blackjack'];
    if (gameCompletionMacros.length > 0) {
      const { flowControl, newState } = processMacrosWithFlow(gameCompletionMacros, newBaseState);

      setGameState(newState);

      if (flowControl) {
        setPendingFlowControl(flowControl);
        return; // Exit early if flow control is triggered
      }
    } else {
      setGameState(newBaseState);
    }

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
  }, [currentEvent, processDialogText, startEvent, updateSceneFromDialog, processMacrosWithFlow, gameState]);

  const handleDanceComplete = useCallback((result, gameSpecificData) => {
    setShowDance(false);
    setShowBlackjack(false);
    setShowDart(false); // NEW: Hide dart game
    setGameCompleted(true);

    // Create a result structure similar to blackjack, but include dance-specific data
    const gameResult = {
      message: result,
      playerMoney: gameSpecificData.playerMoney || gameState.playerMoney,
      opponentsMoney: [gameSpecificData.playerMoney || gameState.playerMoney], // Keep same money for dance
      profit: 0, // Dance doesn't involve money by default
      handsPlayed: 1, // One dance session
      initialPlayerMoney: gameSpecificData.playerMoney || gameState.playerMoney,
      // Dance-specific data for dialog processing
      grade: gameSpecificData.grade,
      accuracy: gameSpecificData.accuracy,
      perfectHits: gameSpecificData.perfectHits,
      totalBeats: gameSpecificData.totalBeats,
      partner: gameSpecificData.partner
    };

    // Update base game state with dance-specific data
    const newBaseState = {
      ...gameState,
      // Dance doesn't change money by default, but could be customized
      completedEvents: [...gameState.completedEvents, currentEvent?.key].filter(Boolean)
    };

    // Apply dance completion macros - could include relationship updates, etc.
    const danceCompletionMacros = ['addGamePlayed:dance'];
    if (danceCompletionMacros.length > 0) {
      const { flowControl, newState } = processMacrosWithFlow(danceCompletionMacros, newBaseState);

      setGameState(newState);

      if (flowControl) {
        setPendingFlowControl(flowControl);
        return;
      }
    } else {
      setGameState(newBaseState);
    }

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
  }, [currentEvent, processDialogText, startEvent, updateSceneFromDialog, processMacrosWithFlow, gameState]);

  // NEW: Handle dart game completion
  const handleDartComplete = useCallback((result, dartGameData) => {
    setShowDart(false);
    setShowBlackjack(false);
    setShowDance(false);
    setGameCompleted(true);

    // Create a result structure for dart game
    const gameResult = {
      message: result,
      playerMoney: gameState.playerMoney, // Dart doesn't change money by default
      opponentsMoney: [gameState.playerMoney],
      profit: 0, // Dart doesn't involve money by default
      handsPlayed: 1, // One dart session
      initialPlayerMoney: gameState.playerMoney,
      // NEW: Dart-specific data for dialog processing
      playerScore: dartGameData.playerScore,
      opponentScore: dartGameData.opponentScore,
      playerAverage: dartGameData.playerAverage,
      opponentAverage: dartGameData.opponentAverage,
      dartsThrown: dartGameData.dartsThrown,
      accuracy: dartGameData.accuracy,
      opponentName: dartGameData.opponentName,
      opponentSkill: dartGameData.opponentSkill,
      gameMode: dartGameData.gameMode,
      winner: dartGameData.winner,
      scoreDifference: dartGameData.scoreDifference
    };

    // Update base game state
    const newBaseState = {
      ...gameState,
      completedEvents: [...gameState.completedEvents, currentEvent?.key].filter(Boolean)
    };

    // Apply dart completion macros
    const dartCompletionMacros = ['addGamePlayed:dart'];
    if (dartCompletionMacros.length > 0) {
      const { flowControl, newState } = processMacrosWithFlow(dartCompletionMacros, newBaseState);

      setGameState(newState);

      if (flowControl) {
        setPendingFlowControl(flowControl);
        return;
      }
    } else {
      setGameState(newBaseState);
    }

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
  }, [currentEvent, processDialogText, startEvent, updateSceneFromDialog, processMacrosWithFlow, gameState]);

  // UPDATED: Enhanced save/load to handle dynamic variables and dart state
  const saveGame = useCallback(() => {
    if (!currentEvent) return null;

    return {
      currentEvent: currentEvent.key,
      dialogIndex,
      gameState, // This now includes all dynamic customVariables
      blackjackParams,
      danceParams,
      dartParams, // NEW: Save dart parameters
      gameCompleted,
      background,
      backgroundTransition,
      backgroundEffects,
      showDance,
      showDart, // NEW: Save dart state
    };
  }, [currentEvent, dialogIndex, gameState, blackjackParams, danceParams, dartParams, gameCompleted, background, backgroundTransition, backgroundEffects, showDance, showDart]);

  const loadGame = useCallback((savedData) => {
    if (!savedData || !savedData.currentEvent) return false;

    // UPDATED: Load the complete game state with all dynamic variables
    setGameState(savedData.gameState);

    const event = gameData.events.find(e => e.key === savedData.currentEvent);
    if (!event) return false;

    setCurrentEvent(event);
    setShowBlackjack(false);
    setShowDance(savedData.showDance || false);
    setShowDart(savedData.showDart || false); // NEW: Load dart state
    setGameCompleted(savedData.gameCompleted);
    setPendingFlowControl(null); // Clear any pending flow control

    setBlackjackParams(savedData.blackjackParams);
    setDanceParams(savedData.danceParams || null);
    setDartParams(savedData.dartParams || null); // NEW: Load dart parameters

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
    showBlackjack: showBlackjack || showDance || showDart, // NEW: Include dart in game state check
    gameId: gameId.current,
    currentDialog
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showBlackjack || showDance || showDart || isMenuOpen) return; // NEW: Include dart in key handling

      if (e.key === 'a' || e.key === 'A') {
        handleToggleAutoAdvance();
      }

      if (e.key === 's' || e.key === 'S') {
        handleToggleSkipRead();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showBlackjack, showDance, showDart, isMenuOpen, handleToggleAutoAdvance, handleToggleSkipRead]); // NEW: Include showDart

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
      textSpeed: textSpeed,
      textAnimation: currentDialog[dialogIndex].textAnimation || 'typewriter'
    };
  }, [currentDialog, dialogIndex, textSpeed]);

  // UPDATED: Enhanced debug info for dynamic variables and flow control
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('Available macros:', getAvailableMacros());
      console.log('Game data macros:', gameData.macros);
      console.log('Conditional templates:', gameData.conditionalTemplates);
      console.log('Current dynamic variables:', gameState.customVariables);
      console.log('Total custom variables count:', Object.keys(gameState.customVariables).length);
      if (pendingFlowControl) {
        console.log('Pending flow control:', pendingFlowControl);
      }
    }
  }, [gameData, getAvailableMacros, gameState.customVariables, pendingFlowControl]);

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
      {!showBlackjack && !showDance && !showDart && ( // NEW: Hide button during all games
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

      {!showBlackjack && !showDance && !showDart && ( // NEW: Hide during all games
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

          {/* UPDATED: Enhanced Debug Info with Flow Control */}
          {import.meta.env.DEV && (
            <>
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
              <div
                className="px-2 py-1 rounded text-xs"
                style={{
                  backgroundColor: `${theme.primaryColor}99`,
                  color: theme.textColor,
                  border: `1px solid ${theme.accentColor}`
                }}
                title={`Custom Variables: ${Object.keys(gameState.customVariables).length}\n${Object.keys(gameState.customVariables).join(', ')}`}
              >
                📊 {Object.keys(gameState.customVariables).length}
              </div>
              {pendingFlowControl && (
                <div
                  className="px-2 py-1 rounded text-xs"
                  style={{
                    backgroundColor: `${theme.accentColor}99`,
                    color: theme.textColor,
                    border: `1px solid ${theme.accentColor}`
                  }}
                  title={`Pending Flow Control: ${pendingFlowControl}`}
                >
                  🎬 Flow
                </div>
              )}
            </>
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

      {!showBlackjack && !showDance && !showDart && (autoAdvance || skipReadDialog) && ( // NEW: Hide during all games
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

      {!showBlackjack && !showDance && !showDart && <CharacterDisplay characters={characters} />} {/* NEW: Hide during all games */}

      {/* Blackjack Game Component */}
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

      {/* Dance Game Component */}
      {showDance && danceParams && (
        <div className="absolute inset-0 z-20">
          <DanceComponent
            initialEvent={{
              action: 'startDance',
              eventParams: danceParams
            }}
            onGameComplete={handleDanceComplete}
            gameState={danceParams.gameState}
          />
        </div>
      )}

      {/* NEW: Dart Game Component */}
      {showDart && dartParams && (
        <div className="absolute inset-0 z-20">
          <DartGame
            initialEvent={{
              action: 'startDart',
              eventParams: dartParams
            }}
            onGameComplete={handleDartComplete}
            gameState={dartParams.gameState}
          />
        </div>
      )}

      {!showBlackjack && !showDance && !showDart && currentDialogData && ( // NEW: Hide during all games
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