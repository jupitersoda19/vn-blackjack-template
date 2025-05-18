import React, { useState, useEffect, useCallback } from 'react';
import BlackjackGameComponent from '../blackjack/BlackjackGameComponent';
import DialogBox from '../blackjack/components/DialogBox';
import BackgroundScene from '../blackjack/components/BackgroundScene';
import CharacterDisplay from '../blackjack/components/CharacterDisplay';
import defaultEventData from '../data/gameData.json';

/**
 * Visual Novel Engine Component
 * Manages game flow, dialog, and blackjack gameplay integration
 */
const VisualNovelEngine = ({ playerData, selectedCharacters = {}, gameMetadata = {} }) => {
  // Character indexes with defaults
  const playerIndex = selectedCharacters?.playerIndex ?? 0;
  const dealerIndex = selectedCharacters?.dealerIndex ?? 1;
  
  // Visual Novel State
  const [currentEvent, setCurrentEvent] = useState(null);
  const [currentDialog, setCurrentDialog] = useState(null);
  const [dialogIndex, setDialogIndex] = useState(0);
  const [showBlackjack, setShowBlackjack] = useState(false);
  const [blackjackParams, setBlackjackParams] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [characters, setCharacters] = useState({});
  const [background, setBackground] = useState(gameMetadata?.backgroundImage || '/backgrounds/default.png');
  const [playerChoices, setPlayerChoices] = useState(null);
  
  // Game economy state - persists money across events
  const [gameState, setGameState] = useState({
    playerMoney: 1000, // Default starting money
    playerInitialMoney: 1000,
    profit: 0,
    completedEvents: [],
    totalHandsPlayed: 0
  });
  
  // Initialize events data from props or default
  const [eventsData, setEventsData] = useState(
    Array.isArray(playerData) ? playerData : defaultEventData.events
  );
  
  /**
   * Update events data when playerData changes
   */
  useEffect(() => {
    if (playerData && Array.isArray(playerData)) {
      console.log("VisualNovelEngine: Setting events data", playerData);
      setEventsData(playerData);
    }
  }, [playerData]);
  
  /**
   * Start the intro event when eventsData is available
   */
  useEffect(() => {
    if (eventsData && eventsData.length > 0) {
      console.log("VisualNovelEngine: Starting intro event");
      startEvent('intro');
    }
  }, [eventsData]);

  /**
   * Helper function to get cost values from playerData
   */
  const getCostForEvent = useCallback((eventName, playerData, characterIndex) => {
    const defaultCost = 1000;
    
    try {
      // Find the event in the specified character's events
      const character = playerData?.[characterIndex];
      if (!character?.blackjackevents) return defaultCost;
      
      const event = character.blackjackevents.find(e => e.name === eventName);
      return event?.cost || defaultCost;
    } catch (error) {
      console.error("Error finding event cost:", error);
      return defaultCost;
    }
  }, []);

  /**
   * Start the blackjack game with current parameters
   */
  const startBlackjackGame = useCallback(() => {
    console.log("Starting blackjack game with params:", blackjackParams);
    setShowBlackjack(true);
  }, [blackjackParams]);

  /**
   * Start a new event by key
   */
  const startEvent = useCallback((eventKey, previousGameResult = null) => {
    console.log(`Starting event: ${eventKey}`);
    
    // Safety check - make sure eventsData exists
    if (!eventsData || !Array.isArray(eventsData)) {
      console.error('No valid events data available');
      return;
    }
    
    const event = eventsData.find(e => e.key === eventKey);
    if (!event) {
      console.error(`Event with key ${eventKey} not found`);
      return;
    }
    
    setCurrentEvent(event);
    setShowBlackjack(false);
    setGameCompleted(false);
    
    // If we have previous game results, update game state
    if (previousGameResult) {
      setGameState(prevState => ({
        ...prevState,
        playerMoney: previousGameResult.playerMoney,
        profit: previousGameResult.profit,
        totalHandsPlayed: prevState.totalHandsPlayed + previousGameResult.handsPlayed,
        completedEvents: [...prevState.completedEvents, currentEvent?.key].filter(Boolean)
      }));
      
      // Also update the blackjack params with new money amounts
      setBlackjackParams(prevParams => {
        // Start with default params if none exist
        const baseParams = prevParams || {
          playerIndex,
          dealerIndex,
          playerEvent: "Default Event",
          dealerEvent: "Default Event"
        };
        
        return {
          ...baseParams,
          // Use previous game money instead of default costs
          playerCost: previousGameResult.playerMoney,
          dealerCost: previousGameResult.opponentsMoney?.[0] || 5000
        };
      });
    } else {
      // For first event, check if this is a continuation event that should use persisted money
      const shouldUsePersistentMoney = event.usePreviousMoney === true;
      
      if (!shouldUsePersistentMoney) {
        // Reset blackjack params for fresh start
        setBlackjackParams(null);
      } else {
        // Use current game state money for this event
        setBlackjackParams({
          playerIndex,
          dealerIndex,
          playerEvent: event.playerEvent || "Default Event",
          dealerEvent: event.dealerEvent || "Default Event",
          playerCost: gameState.playerMoney,
          dealerCost: 5000, // Default dealer money
          specialRules: event.specialRules
        });
      }
    }
    
    // Initialize pre-game dialog if it exists
    if (event.preDialog && event.preDialog.length > 0) {
      // Process dialog to replace money placeholders
      const processedDialog = event.preDialog.map(dialog => {
        if (dialog.text && typeof dialog.text === 'string') {
          // Replace with either previous game result or current game state
          const moneyValue = previousGameResult?.playerMoney || gameState.playerMoney;
          const profitValue = previousGameResult?.profit || gameState.profit;
          
          return {
            ...dialog,
            text: dialog.text
              .replace('{money}', moneyValue)
              .replace('{profit}', profitValue)
          };
        }
        return dialog;
      });
      
      setCurrentDialog(processedDialog);
      setDialogIndex(0);
      
      // Set initial scene
      if (processedDialog[0].background) {
        setBackground(processedDialog[0].background);
      }
      
      // Set initial characters
      if (processedDialog[0].characters) {
        setCharacters(processedDialog[0].characters);
      }
    } else {
      // No dialog, go straight to game
      console.log(`Event ${eventKey} has no preDialog. Going straight to game.`);
      startBlackjackGame();
    }
    
    // Add to history
    setVnHistory(prev => [...prev, event.key]);
  }, [currentEvent, dealerIndex, eventsData, gameState, playerIndex, startBlackjackGame]);

  /**
   * Handle next dialog or action
   */
  const handleNext = useCallback(() => {
    // If we're showing dialog before the game
    if (!showBlackjack && !gameCompleted) {
      if (dialogIndex < currentDialog.length - 1) {
        // Move to next dialog
        setDialogIndex(dialogIndex + 1);
        
        // Update scene if needed
        const nextDialog = currentDialog[dialogIndex + 1];
        if (nextDialog.background) {
          setBackground(nextDialog.background);
        }
        
        // Update characters if needed
        if (nextDialog.characters) {
          setCharacters(nextDialog.characters);
        }
        
        // Check for choices
        if (nextDialog.choices) {
          setPlayerChoices(nextDialog.choices);
        } else {
          setPlayerChoices(null);
        }
      } else {
        // End of pre-game dialog, start the game only if we're in pre-game dialog
        console.log("End of pre-game dialog, starting blackjack game");
        if (blackjackParams) {
          startBlackjackGame();
        } else if (currentEvent?.nextEvent) {
          // No blackjack game parameters, move to next event
          startEvent(currentEvent.nextEvent);
        }
      }
    } 
    // If we're showing dialog after the game
    else if (gameCompleted) {
      if (dialogIndex < currentDialog.length - 1) {
        // Move to next dialog
        setDialogIndex(dialogIndex + 1);
        
        // Update scene if needed
        const nextDialog = currentDialog[dialogIndex + 1];
        if (nextDialog.background) {
          setBackground(nextDialog.background);
        }
        
        // Update characters if needed
        if (nextDialog.characters) {
          setCharacters(nextDialog.characters);
        }
        
        // Check for choices
        if (nextDialog.choices) {
          setPlayerChoices(nextDialog.choices);
        } else {
          setPlayerChoices(null);
        }
      } else {
        // End of post-game dialog, go to next event if specified
        if (currentEvent?.nextEvent) {
          startEvent(currentEvent.nextEvent);
        } else {
          // End of story
          console.log('End of visual novel reached');
        }
      }
    }
  }, [blackjackParams, currentDialog, currentEvent, dialogIndex, gameCompleted, showBlackjack, startBlackjackGame, startEvent]);

  /**
   * Handle player choice selection
   */
  const handleChoiceSelected = useCallback((choice) => {
    console.log("Choice selected:", choice);
    setPlayerChoices(null);
    
    if (choice.nextEvent) {
      startEvent(choice.nextEvent);
    } else if (choice.action === 'startGame' && choice.eventParams) {
      // Store the blackjack params for when dialog finishes
      const params = {
        ...choice.eventParams,
        // Use the current gameState money if specified, otherwise use default costs
        playerCost: choice.eventParams.usePreviousMoney 
          ? gameState.playerMoney
          : (choice.eventParams.playerCost || getCostForEvent(choice.eventParams.playerEvent, playerData, playerIndex)),
        dealerCost: choice.eventParams.dealerCost || getCostForEvent(choice.eventParams.dealerEvent, playerData, dealerIndex),
        playerIndex,
        dealerIndex
      };
      
      console.log("Setting blackjack params with costs and characters:", params);
      setBlackjackParams(params);
      
      // Check if there's more dialog to go through
      if (dialogIndex < currentDialog.length - 1) {
        handleNext(); // Continue with dialog
      } else {
        // No more dialog, start game now
        startBlackjackGame();
      }
    } else if (choice.action === 'exit') {
      console.log("Exit action selected");
      // Handle exit action - could restart or redirect
      window.location.reload();
    } else {
      // Just continue to next dialog
      handleNext();
    }
  }, [currentDialog, dealerIndex, dialogIndex, gameState.playerMoney, getCostForEvent, handleNext, playerData, playerIndex, startBlackjackGame, startEvent]);

  /**
   * Handle game completion
   */
  const handleGameComplete = useCallback((result, finalScore) => {
    console.log("Game completed with result:", result, "Final score:", finalScore);
    setShowBlackjack(false);
    setGameCompleted(true);
    
    // Store the final score to use in subsequent events
    const gameResult = {
      message: result,
      playerMoney: finalScore.player,
      opponentsMoney: finalScore.opponents,
      profit: finalScore.player - finalScore.initialPlayer,
      handsPlayed: finalScore.handsPlayed
    };
    
    // Update the game state with the final score
    setGameState(prevState => ({
      ...prevState,
      playerMoney: finalScore.player,
      profit: finalScore.player - finalScore.initialPlayer,
      totalHandsPlayed: prevState.totalHandsPlayed + finalScore.handsPlayed,
      completedEvents: [...prevState.completedEvents, currentEvent?.key].filter(Boolean)
    }));
    
    // Initialize post-game dialog if it exists
    if (currentEvent?.postDialog && currentEvent.postDialog.length > 0) {
      // Process dialog to replace money placeholders
      const postDialog = currentEvent.postDialog.map(dialog => {
        // Replace {result} placeholders in text
        if (dialog.text && typeof dialog.text === 'string') {
          return {
            ...dialog,
            text: dialog.text
              .replace('{result}', result)
              .replace('{money}', finalScore.player)
              .replace('{profit}', finalScore.player - finalScore.initialPlayer)
          };
        }
        return dialog;
      });
      
      setCurrentDialog(postDialog);
      setDialogIndex(0);
      
      // Set initial post-game scene
      if (postDialog[0].background) {
        setBackground(postDialog[0].background);
      }
      
      // Set initial post-game characters
      if (postDialog[0].characters) {
        setCharacters(postDialog[0].characters);
      }
    } else {
      // No post-game dialog, go to next event if specified
      if (currentEvent?.nextEvent) {
        // Pass the final score to the next event
        startEvent(currentEvent.nextEvent, gameResult);
      }
    }
  }, [currentEvent, startEvent]);

  // If no events data is available yet, show a loading state
  if (!eventsData || eventsData.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900">
        <div className="text-yellow-500 text-xl">Loading game data...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* Debugging overlay - only in dev mode */}
      {import.meta.env.DEV && (
        <div className="absolute top-0 right-0 bg-black bg-opacity-70 text-white p-2 text-xs z-50 hidden">
          <div>Event: {currentEvent?.key}</div>
          <div>Dialog: {dialogIndex} / {currentDialog?.length}</div>
          <div>Characters: Player #{playerIndex}, Dealer #{dealerIndex}</div>
          <div>Blackjack: {showBlackjack ? 'Yes' : 'No'}</div>
          <div>Player Money: ${gameState.playerMoney}</div>
          <div>Total Profit: ${gameState.profit}</div>
          <div>Hands Played: {gameState.totalHandsPlayed}</div>
          <div>Completed Events: {gameState.completedEvents.join(', ')}</div>
        </div>
      )}
      
      {/* Return to start button */}
      <button 
        className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded z-50 text-sm flex items-center"
        onClick={() => window.location.reload()}
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Main Menu
      </button>
      
      {/* Background Scene */}
      <BackgroundScene background={background} />
      
      {/* Characters */}
      <CharacterDisplay characters={characters} />
      
      {/* Money display */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded z-50 flex items-center">
        <span className="text-yellow-300 mr-2">Money:</span>
        <span className="font-bold">${gameState.playerMoney}</span>
        {gameState.profit !== 0 && (
          <span className={`ml-2 text-sm ${gameState.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {gameState.profit > 0 ? '+' : ''}{gameState.profit}
          </span>
        )}
      </div>
      
      {/* Blackjack Game (when active) */}
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
      
      {/* Dialog and UI (when not in blackjack) */}
      {!showBlackjack && currentDialog && dialogIndex < currentDialog.length && (
        <div className="absolute bottom-0 left-0 right-0 z-30">
          <DialogBox 
            dialog={currentDialog[dialogIndex]} 
            onNext={playerChoices ? null : handleNext}
            choices={playerChoices}
            onChoiceSelected={handleChoiceSelected}
          />
        </div>
      )}
    </div>
  );
};

export default VisualNovelEngine;