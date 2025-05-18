// BlackjackGameComponent.js - Updated for money persistence
import React, { useState, useEffect } from 'react';
import BlackjackGame from './BlackjackGame';
import Hand from './components/Hand';
import PlayerView from './components/PlayerView';
import BettingControls from './components/BettingControls';
import GameTable from './components/GameTable';

const BlackjackGameComponent = ({ 
  initialEvent, 
  onGameComplete, 
  playerData, 
  selectedCharacters,
  numOpponents = 1, // Default to 1 opponent
  persistentGameState = null // Add prop for persistent game state
}) => {
  // Use provided character indices or default to first and others
  const playerIndex = selectedCharacters?.playerIndex ?? 0;
  const opponentIndices = selectedCharacters?.opponentIndices ?? [1];
  
  // Ensure we have valid player data array
  const safePlayerData = Array.isArray(playerData) ? playerData : [];

  const extractCharacterData = (eventData) => {
  if (!eventData || !eventData.preDialog || eventData.preDialog.length === 0) {
    return null;
  }
  
  // Look through dialog entries to find any characters
  const characters = {};
  
  // Check preDialog sections
  for (const dialog of eventData.preDialog) {
    if (dialog.characters) {
      // Store each character position found
      if (dialog.characters.right && !characters.right) {
        characters.right = dialog.characters.right;
      }
      if (dialog.characters.left && !characters.left) {
        characters.left = dialog.characters.left;
      }
      if (dialog.characters.center && !characters.center) {
        characters.center = dialog.characters.center;
      }
      
      // If we found all three positions, we can stop
      if (characters.right && characters.left && characters.center) {
        break;
      }
    }
  }
  
  // If we didn't find anything in preDialog, check postDialog
  if (Object.keys(characters).length === 0 && eventData.postDialog) {
    for (const dialog of eventData.postDialog) {
      if (dialog.characters) {
        // Store each character position found
        if (dialog.characters.right && !characters.right) {
          characters.right = dialog.characters.right;
        }
        if (dialog.characters.left && !characters.left) {
          characters.left = dialog.characters.left;
        }
        if (dialog.characters.center && !characters.center) {
          characters.center = dialog.characters.center;
        }
        
        // If we found all three positions, we can stop
        if (characters.right && characters.left && characters.center) {
          break;
        }
      }
    }
  }
  
  return characters;
};
  
  // Ensure we have the right number of opponents
  const adjustedOpponentIndices = opponentIndices.length >= numOpponents 
    ? opponentIndices.slice(0, numOpponents) 
    : [...opponentIndices, ...Array(numOpponents - opponentIndices.length).fill().map((_, i) => Math.min(i + 2, (safePlayerData.length > 0 ? safePlayerData.length - 1 : 0)))];

  const [game, setGame] = useState(new BlackjackGame(numOpponents));
  const [gameState, setGameState] = useState({
    playerHand: [],
    opponentHands: Array(numOpponents).fill().map(() => []),
    currentPlayer: 'player',
    isGameOver: false,
    winners: [],
    betPlaced: false,
    betAmount: 0
  });
  
  // State for selected events
  const [events, setEvents] = useState({
    playerEvent: null,
    opponentEvents: Array(numOpponents).fill(null)
  });
  
  // Game setup state
  const [isGameSetup, setIsGameSetup] = useState(false);
  
  // Player scores
  const [scores, setScores] = useState({
    player: 1000, // Default value
    opponents: Array(numOpponents).fill(5000),
    initialPlayer: 1000,
    initialOpponents: Array(numOpponents).fill(5000)
  });

  // Win condition tracking
  const [winConditionMet, setWinConditionMet] = useState(false);
  const [handsPlayed, setHandsPlayed] = useState(0);
  
  // Track current opponent count
  const [currentNumOpponents, setCurrentNumOpponents] = useState(numOpponents);

  // Setup the game based on initialEvent or selections
  useEffect(() => {
    if (initialEvent && initialEvent.action === 'startGame' && initialEvent.eventParams) {
      try {
        const eventParams = initialEvent.eventParams;
  const playerCost = eventParams.playerCost || 1000;
  const dealerCost = eventParams.dealerCost || 5000;
  const usePlayerIndex = eventParams.playerIndex !== undefined ? eventParams.playerIndex : playerIndex;
  
  // Get opponent indices - either from event params or use defaults
  let useOpponentIndices = [];
  if (eventParams.opponentIndices && Array.isArray(eventParams.opponentIndices)) {
    // Make a copy to avoid mutation
    useOpponentIndices = [...eventParams.opponentIndices];
    
    // Set the number of opponents based on the array length
    const numOpponents = useOpponentIndices.length;
    setCurrentNumOpponents(numOpponents);
  } else if (eventParams.dealerIndex !== undefined) {
    // Backward compatibility with single dealer
    useOpponentIndices = [eventParams.dealerIndex];
    setCurrentNumOpponents(1);
  } else {
    // Default to single opponent if not specified
    useOpponentIndices = [selectedCharacters?.dealerIndex ?? 1];
    setCurrentNumOpponents(1);
  }
  
  // Ensure we have enough opponent indices and they're all valid numbers
  while (useOpponentIndices.length < currentNumOpponents) {
    useOpponentIndices.push((useOpponentIndices.length % safePlayerData.length) + 1);
  }
  
  // Make sure all indices are within valid range for playerData
  useOpponentIndices = useOpponentIndices.map(index => {
    if (typeof index !== 'number' || index < 0 || index >= safePlayerData.length) {
      return 1; // Default to index 1 if invalid
    }
    return index;
  });
  
  // Get character data with proper character images
  let playerChar = { name: "Player" };
  if (usePlayerIndex >= 0 && usePlayerIndex < safePlayerData.length) {
    const playerEvent = safePlayerData[usePlayerIndex];
    const eventTitle = playerEvent.title || playerEvent.key || "Player";
    playerChar = { 
      name: eventTitle,
      key: playerEvent.key
    };
    
    // Extract visual novel character data
    if (playerEvent.preDialog && playerEvent.preDialog.length > 0) {
      // Look for player character in right position
      for (const dialog of playerEvent.preDialog) {
        if (dialog.characters && dialog.characters.right) {
          playerChar.image = dialog.characters.right.image;
          playerChar.name = dialog.characters.right.name || eventTitle;
          break;
        }
      }
    }
  }
  
  // For opponents, extract character data
  const opponentChars = useOpponentIndices.map((index, i) => {
    // Start with basic default
    let opChar = { name: `Dealer ${i+1}` };
    
    if (index >= 0 && index < safePlayerData.length) {
      const opponentEvent = safePlayerData[index];
      const eventTitle = opponentEvent.title || opponentEvent.key || `Dealer ${i+1}`;
      opChar = {
        name: eventTitle,
        key: opponentEvent.key
      };
      
      // Extract visual novel character data
      if (opponentEvent.preDialog && opponentEvent.preDialog.length > 0) {
        // Look for dealer characters in left or center position
        for (const dialog of opponentEvent.preDialog) {
          if (dialog.characters) {
            if (dialog.characters.left) {
              opChar.image = dialog.characters.left.image;
              opChar.name = dialog.characters.left.name || eventTitle;
              break;
            }
            else if (dialog.characters.center && !dialog.characters.right) {
              opChar.image = dialog.characters.center.image;
              opChar.name = dialog.characters.center.name || eventTitle;
              break;
            }
          }
        }
      }
    }
    
    return opChar;
  });
  
  // Create player event object with character image
  const playerEventObj = { 
    name: eventParams.playerEvent || "Default Event", 
    cost: playerCost,
    character: playerChar, // Include the character data in the event
    image: playerChar.image // Add the image directly as well
  };
  
  // Create opponent event objects with character images
  const opponentEventObjs = useOpponentIndices.map((_, i) => {
    return {
      name: eventParams.opponentEvents?.[i]?.name || eventParams.dealerEvent || "Default Event",
      cost: eventParams.opponentEvents?.[i]?.cost || dealerCost,
      character: opponentChars[i], // Include the character data in the event
      image: opponentChars[i].image // Add the image directly as well
    };
  });
  
  // Now set the events with all the character data included
  setEvents({
    playerEvent: playerEventObj,
    opponentEvents: opponentEventObjs,
    specialRules: eventParams.specialRules,
    playerCharacter: playerChar,
    opponentCharacters: opponentChars
  });
  
  // Set scores based on event costs
  setScores({
    player: playerCost,
    opponents: opponentEventObjs.map(e => e.cost),
    initialPlayer: playerCost,
    initialOpponents: opponentEventObjs.map(e => e.cost)
  });
  
  // Reset win condition and hands played
  setWinConditionMet(false);
  setHandsPlayed(0);
  
  setIsGameSetup(true);
      } catch (error) {
        console.error("Error setting up game events:", error);
        // Set up with default values as fallback
        const playerCost = 1000;
        const dealerCost = 5000;
        
        // Get default characters
        const defaultPlayerCharacter = safePlayerData[playerIndex] || { name: "Player" };
        const defaultOpponentCharacters = adjustedOpponentIndices.map(
          index => safePlayerData[index] || { name: "Opponent" }
        );
        
        setEvents({
          playerEvent: { name: "Default Event", cost: playerCost },
          opponentEvents: Array(currentNumOpponents).fill().map(() => ({ name: "Default Event", cost: dealerCost })),
          playerCharacter: defaultPlayerCharacter,
          opponentCharacters: defaultOpponentCharacters
        });
        
        setScores({
          player: playerCost,
          opponents: Array(currentNumOpponents).fill(dealerCost),
          initialPlayer: playerCost,
          initialOpponents: Array(currentNumOpponents).fill(dealerCost)
        });
        
        setIsGameSetup(true);
      }
    }
  }, [initialEvent, safePlayerData, playerIndex, adjustedOpponentIndices, currentNumOpponents]);
  
  // Update game when number of opponents changes
  useEffect(() => {
    const newGame = new BlackjackGame(currentNumOpponents);
    newGame.initializeDeck();
    setGame(newGame);
    
    // Reset game state with new number of opponents
    setGameState(prevState => ({
      ...prevState,
      opponentHands: Array(currentNumOpponents).fill().map(() => []),
      winners: []
    }));
    
    // Adjust opponent scores if needed
    setScores(prevScores => {
      const newScores = { ...prevScores };
      
      if (prevScores.opponents.length !== currentNumOpponents) {
        const defaultOpponentScore = 5000;
        newScores.opponents = Array(currentNumOpponents).fill(defaultOpponentScore);
        newScores.initialOpponents = Array(currentNumOpponents).fill(defaultOpponentScore);
      }
      
      return newScores;
    });
    
  }, [currentNumOpponents]);
  
  useEffect(() => {
    // Only initialize the game after events have been selected
    if (isGameSetup) {
      initializeGame();
    }
  }, [isGameSetup]);

  // Initialize a new game instance
  const initializeGame = () => {
    const newGame = new BlackjackGame(currentNumOpponents);
    newGame.initializeDeck();
    setGame(newGame);
    setGameState(prevState => ({
      ...prevState,
      playerHand: [],
      opponentHands: Array(currentNumOpponents).fill().map(() => []),
      currentPlayer: 'player',
      isGameOver: false,
      winners: [],
      betPlaced: false,
      betAmount: 0
    }));
  };

  // Start a new hand after bet is placed
  const startNewHand = () => {
    game.dealInitialCards();
    updateGameState(game);
  };

  // Update the game state to reflect the current game
  const updateGameState = (currentGame) => {
    setGameState(prevState => {
      const opponentHands = [];
      for (let i = 0; i < currentNumOpponents; i++) {
        opponentHands.push(currentGame.getOpponentHand(i));
      }
      
      const newState = {
        ...prevState,
        playerHand: currentGame.playerHand,
        opponentHands: opponentHands,
        currentPlayer: currentGame.currentPlayer,
        isGameOver: currentGame.isGameOver
      };
      
      // Update winners if game is over
      if (currentGame.isGameOver) {
        newState.winners = currentGame.determineWinners();
        updateScores(newState.winners, gameState.betAmount);
        
        // Increment hands played
        setHandsPlayed(prev => prev + 1);
      }
      
      return newState;
    });
  };

  // Effect to check win condition after scores update
  useEffect(() => {
    checkWinCondition();
  }, [scores]);
  
  // Check if win condition is met
  const checkWinCondition = () => {
    // Calculate how much the player has won
    const playerProfit = scores.player - scores.initialPlayer;
    const targetProfit = scores.initialPlayer; // Win condition: double your money
        
    // Win condition: Player has doubled their money
    if (playerProfit >= targetProfit) {
      setWinConditionMet(true);
      
      // Small delay to let player see the final result
      setTimeout(() => {
        if (onGameComplete) {
          const finalScores = {
            player: scores.player,
            opponents: scores.opponents,
            initialPlayer: scores.initialPlayer,
            initialOpponents: scores.initialOpponents,
            handsPlayed: handsPlayed
          };
          onGameComplete(`You've doubled your money! Final profit: ${playerProfit}`, finalScores);
        }
      }, 2000);
    }
    
    // Lose condition: Player is out of money or can't place minimum bet
    else if (scores.player < 5) { // Minimum bet is $5
      setTimeout(() => {
        if (onGameComplete) {
          const finalScores = {
            player: scores.player,
            opponents: scores.opponents,
            initialPlayer: scores.initialPlayer,
            initialOpponents: scores.initialOpponents,
            handsPlayed: handsPlayed
          };
          onGameComplete(`You've lost all your money after ${handsPlayed} hands.`, finalScores);
        }
      }, 2000);
    }
  };

  // Handle player hit action
  const handleHit = () => {
    game.playerHit();
    updateGameState(game);
  };

  // Handle player stand action
  const handleStand = () => {
    game.playerStand();
    updateGameState(game);
  };

  // Handle starting a new game
  const handleNewGame = () => {
    initializeGame();
  };

  // Handle placing a bet
  const handlePlaceBet = (amount) => {
    // Ensure player has enough money
    if (amount > scores.player) return;
    
    game.placeBet(amount);
    setGameState(prevState => ({
      ...prevState,
      betPlaced: true,
      betAmount: amount
    }));
    
    startNewHand();
  };

  // Update scores based on game outcome
  const updateScores = (winners, betAmount) => {
    setScores(prevScores => {
      const newScores = { ...prevScores };
      const playerValue = game.calculateHandValue(gameState.playerHand);
      const isBlackjack = playerValue === 21 && gameState.playerHand.length === 2;
      
      // Process each opponent result
      winners.forEach((result, index) => {
        if (result === 'player') {
          if (isBlackjack) {
            // Blackjack pays 3:2
            const blackjackPayout = Math.floor(betAmount * 1.5);
            newScores.player += blackjackPayout;
            newScores.opponents[index] -= blackjackPayout;
          } else {
            // Regular win pays 1:1
            newScores.player += betAmount;
            newScores.opponents[index] -= betAmount;
          }
        } else if (result === 'opponent') {
          newScores.player -= betAmount;
          newScores.opponents[index] += betAmount;
        }
        // If it's a tie, no score changes
      });
      
      return newScores;
    });
  };

  // Calculate hand values
  const playerValue = gameState.playerHand.length > 0 ? game.calculateHandValue(gameState.playerHand) : 0;
  const opponentValues = gameState.opponentHands.map(hand => 
    hand.length > 0 ? game.calculateHandValue(hand) : 0
  );

  // Get character data with fallbacks
  const playerCharacter = events.playerCharacter || 
    (safePlayerData && playerIndex < safePlayerData.length ? safePlayerData[playerIndex] : null) || 
    { name: "Player" };
    
  const opponentCharacters = events.opponentCharacters || 
    adjustedOpponentIndices.map(index => 
      (safePlayerData && index < safePlayerData.length ? safePlayerData[index] : null) || 
      { name: `Dealer ${index}` }
    );

  // Handle changing the number of opponents
  const handleChangeOpponents = (num) => {
    // Ensure valid range
    const newNumOpponents = Math.max(1, Math.min(num, 3));
    setCurrentNumOpponents(newNumOpponents);
    
    // Update game with new number of opponents
    const updatedGame = new BlackjackGame(newNumOpponents);
    updatedGame.initializeDeck();
    setGame(updatedGame);
  };

  // Get game results in readable format
  const getGameResults = () => {
    if (!gameState.isGameOver) return null;
    return game.getResults();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-800 flex flex-col p-4 overflow-hidden relative">
      {/* Debug Info */}
      {import.meta.env.DEV && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white p-2 text-xs z-50 max-w-sm overflow-auto">
          <div>
            <div>Events Set: {isGameSetup ? 'Yes' : 'No'}</div>
            <div>Player: {playerCharacter?.name || 'Player'}</div>
            <div>Opponents: {opponentCharacters.slice(0, currentNumOpponents)
              .map(c => c?.name || 'Opponent')
              .join(', ')}
            </div>
            <div>Player Event: {events.playerEvent?.name || 'None'}</div>
            <div>Player Cost: ${events.playerEvent?.cost || 0}</div>
            <div>Initial Money: ${scores.initialPlayer}</div>
            <div>Current Money: ${scores.player}</div>
            <div>Profit: ${scores.player - scores.initialPlayer}</div>
            <div>Hands Played: {handsPlayed}</div>
            <div>Win Met: {winConditionMet ? 'Yes' : 'No'}</div>
          </div>
        </div>
      )}
    
      {/* Return to story button */}
      <button 
        className="absolute top-4 right-4 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg z-50 flex items-center"
        onClick={() => {
          if (onGameComplete) {
            const playerProfit = scores.player - scores.initialPlayer;
            const finalScores = {
              player: scores.player,
              opponents: scores.opponents,
              initialPlayer: scores.initialPlayer,
              initialOpponents: scores.initialOpponents,
              handsPlayed: handsPlayed
            };
            
            if (playerProfit >= scores.initialPlayer) {
              onGameComplete(`You've doubled your money! Final profit: ${playerProfit}`, finalScores);
            } else if (scores.player < 5) {
              onGameComplete(`You've lost all your money after ${handsPlayed} hands.`, finalScores);
            } else {
              onGameComplete(`You've finished with ${scores.player} after ${handsPlayed} hands.`, finalScores);
            }
          }
        }}
      >
        Return to Story
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </button>
      
      {/* Win condition banner */}
      {winConditionMet && (
        <div className="absolute top-1/4 left-0 right-0 z-50 text-center">
          <div className="bg-black bg-opacity-70 text-yellow-300 text-3xl font-bold py-4 px-6 rounded-lg mx-auto inline-block animate-bounce">
            You've doubled your money! 🎉
          </div>
        </div>
      )}
      
      {/* Game setup info - only visible before game starts */}
      {!gameState.betPlaced && currentNumOpponents > 1 && (
        <div className="mb-4 bg-black bg-opacity-30 p-3 rounded-lg flex justify-between items-center">
          <div className="text-white flex items-center">
            <span className="mr-2 text-yellow-300 font-bold">Playing {currentNumOpponents} Tables:</span>
            <span className="text-green-300 text-sm italic">
              You'll play the same hand against {currentNumOpponents} different dealers simultaneously!
            </span>
          </div>
        </div>
      )}
      
      {/* Game UI */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left section - Player */}
        <div className="w-1/4 flex flex-col items-center justify-between p-2">
          <div className="flex-1 flex flex-col items-center justify-center">
            <PlayerView 
              name={playerCharacter?.name || "Player"}
              avatarData={playerCharacter || { name: "Player" }} 
              score={scores.player}
              startingMoney={events.playerEvent?.cost || 1000}
              selectedEvent={events.playerEvent}
              profit={scores.player - scores.initialPlayer}
            />
            
            {gameState.betPlaced && (
              <>
                <div className="my-4 w-full">
                  <Hand hand={gameState.playerHand} label="Your Hand" />
                  <div className="bg-black bg-opacity-40 rounded-lg px-3 py-1 text-center mt-2 shadow-inner">
                    <span className="text-sm text-green-300">Hand Value:</span>
                    <span className="text-white text-lg font-bold ml-2">{playerValue}</span>
                  </div>
                </div>
              </>
            )}
          </div> 
          
          {/* Betting controls - Only show when bet isn't placed yet */}
          {!gameState.betPlaced && (
            <div className="w-full mt-auto">
              <BettingControls 
                onPlaceBet={handlePlaceBet}
                maxBet={scores.player}
                disabled={gameState.betPlaced || winConditionMet}
              />
            </div>
          )}
        </div>
        
        {/* Center section - Game table with integrated controls */}
        <GameTable 
          winners={gameState.winners}
          currentPlayer={gameState.currentPlayer}
          isGameOver={gameState.isGameOver}
          betAmount={gameState.betAmount}
          handsPlayed={handsPlayed}
          numOpponents={currentNumOpponents}
          onHit={handleHit}
          onStand={handleStand}
          onNewGame={handleNewGame}
          isPlayerTurn={gameState.currentPlayer === 'player'}
          disabled={winConditionMet}
          gameResults={getGameResults()}
        />
        
        {/* Right section - Opponents */}
        <div className="w-1/4 flex flex-col overflow-y-auto">
          <div className="flex-1 flex flex-col items-center justify-start w-full p-2">
            {/* Header for multiple opponents */}
            {currentNumOpponents > 1 && (
              <div className="w-full bg-black bg-opacity-50 text-yellow-300 text-center font-bold rounded-t-lg py-1 mb-1">
                {currentNumOpponents} Dealers
              </div>
            )}
            
            {/* Map through opponents - more compact when multiple */}
            <div className={`w-full ${currentNumOpponents > 1 ? 'space-y-2' : ''}`}>
              {opponentCharacters.slice(0, currentNumOpponents).map((opponentChar, index) => (
                <div 
                  key={`opponent-${index}`} 
                  className={`w-full ${currentNumOpponents > 1 ? 'pb-2 border-b border-green-700' : ''}`}
                >
                  {/* Compact view for multiple opponents */}
                  {currentNumOpponents > 1 ? (
                    <div className="flex flex-col">
                      {/* Header with name and money in compact row */}
                      <div className="flex justify-between items-center mb-1 bg-green-900 bg-opacity-50 p-1 rounded-lg">
                        <div className="flex items-center">
                          {/* Small avatar circle */}
                          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-yellow-500 mr-2">
                            <img
                              src={opponentChar?.profilepic || '/default-avatar.png'}
                              alt={opponentChar?.name || `Dealer ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/default-avatar.png';
                              }}
                            />
                          </div>
                          <span className="text-yellow-200 font-bold">{opponentChar?.name || `Dealer ${index + 1}`}</span>
                        </div>
                        <div className="bg-black bg-opacity-50 px-2 py-1 rounded-full text-white text-sm">
                          ${scores.opponents[index]}
                        </div>
                      </div>
                      
                      {/* Hand in compact mode */}
                      {gameState.betPlaced && (
                        <div className="w-full">
                          <Hand 
                            hand={gameState.opponentHands[index] || []} 
                            hidden={!gameState.isGameOver && gameState.currentPlayer !== `opponent-${index}`} 
                            label={`Table ${index + 1}`}
                            compact={true}
                          />
                          {gameState.isGameOver ? (
                            <div className="bg-black bg-opacity-40 rounded-lg px-3 py-1 text-center mt-1 text-sm shadow-inner">
                              <span className="text-green-300">Value:</span>
                              <span className="text-white font-bold ml-1">{opponentValues[index]}</span>
                              
                              {/* Show win/loss indicator for this opponent */}
                              {gameState.winners.length > index && (
                                <span className={`ml-2 ${
                                  gameState.winners[index] === 'player' ? 'text-green-400' : 
                                  gameState.winners[index] === 'opponent' ? 'text-red-400' : 
                                  'text-yellow-400'
                                }`}>
                                  ({
                                    gameState.winners[index] === 'player' ? 'You Won' : 
                                    gameState.winners[index] === 'opponent' ? 'Dealer Won' : 
                                    'Push'
                                  })
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="bg-black bg-opacity-40 rounded-lg px-3 py-1 text-center mt-1 text-sm shadow-inner">
                              <span className="text-red-300">Value Hidden</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Original full-sized view for single opponent
                    <>
                      <PlayerView 
                        name={opponentChar?.name || `Dealer ${index + 1}`}
                        avatarData={opponentChar || { name: `Dealer ${index + 1}` }} 
                        score={scores.opponents[index]}
                        startingMoney={events.opponentEvents?.[index]?.cost || 5000}
                        selectedEvent={events.opponentEvents?.[index]}
                        isOpponent={true}
                      />
                      
                      {gameState.betPlaced && (
                        <div className="my-3 w-full">
                          <Hand 
                            hand={gameState.opponentHands[index] || []} 
                            hidden={!gameState.isGameOver && gameState.currentPlayer !== `opponent-${index}`} 
                            label={`${opponentChar?.name || `Dealer ${index + 1}`}'s Hand`}
                            compact={false}
                          />
                          {gameState.isGameOver ? (
                            <div className="bg-black bg-opacity-40 rounded-lg px-3 py-1 text-center mt-2 shadow-inner">
                              <span className="text-sm text-green-300">Hand Value:</span>
                              <span className="text-white text-lg font-bold ml-2">{opponentValues[index]}</span>
                              
                              {/* Show win/loss indicator for this opponent */}
                              {gameState.winners.length > index && (
                                <span className={`ml-2 text-sm ${
                                  gameState.winners[index] === 'player' ? 'text-green-400' : 
                                  gameState.winners[index] === 'opponent' ? 'text-red-400' : 
                                  'text-yellow-400'
                                }`}>
                                  ({
                                    gameState.winners[index] === 'player' ? 'You Won' : 
                                    gameState.winners[index] === 'opponent' ? 'Dealer Won' : 
                                    'Push'
                                  })
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="bg-black bg-opacity-40 rounded-lg px-3 py-1 text-center mt-2 shadow-inner">
                              <span className="text-sm text-red-300">Value Hidden</span>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Game rules section */}
          <div className="bg-black bg-opacity-30 rounded-lg p-4 mt-auto w-full sticky bottom-0">
            <h3 className="text-yellow-300 font-bold mb-2 text-center">BLACKJACK RULES</h3>
            <ul className="text-xs text-green-300 space-y-1">
              <li>• Blackjack pays 3 to 2</li>
              <li>• Dealers must stand on 17 and draw to 16</li>
              <li>• Dealer wins ties except on blackjack</li>
              <li>• No splitting or doubling down</li>
              {events.specialRules && (
                <li>• Special: {events.specialRules}</li>
              )}
              <li className="text-yellow-200 mt-2">• Goal: Double your initial money to win!</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Footer with game info */}
      <div className="mt-4 text-center text-xs text-green-400">
        &copy; 2025 Claude's Casino • Table Limits: $5 - $1,000 • 
        {events.playerEvent?.name ? ` Event: ${events.playerEvent.name}` : ''} • 
        {playerCharacter?.name || 'Player'} vs {opponentCharacters.slice(0, currentNumOpponents)
          .map(c => c?.name || 'Dealer')
          .join(', ')} • 
        Good Luck!
      </div>
    </div>
  );
};

export default BlackjackGameComponent;