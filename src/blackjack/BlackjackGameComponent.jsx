// BlackjackGameComponent.js - Fully Data-Driven with Character Data from JSON
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
  numOpponents = 1,
  persistentGameState = null
}) => {
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
  
  // State for character and event data - all from JSON
  const [gameData, setGameData] = useState({
    player: null,
    dealers: [],
    playerEvent: null,
    gameRules: {}
  });
  
  // Game setup state
  const [isGameSetup, setIsGameSetup] = useState(false);
  
  // Player scores
  const [scores, setScores] = useState({
    player: 1000,
    opponents: [],
    initialPlayer: 1000,
    initialOpponents: []
  });

  // Win condition tracking
  const [winConditionMet, setWinConditionMet] = useState(false);
  const [handsPlayed, setHandsPlayed] = useState(0);
  
  // Track current opponent count
  const [currentNumOpponents, setCurrentNumOpponents] = useState(numOpponents);

  // Setup the game based on initialEvent - completely data-driven
  useEffect(() => {
    if (initialEvent && initialEvent.action === 'startGame' && initialEvent.eventParams) {
      try {
        const eventParams = initialEvent.eventParams;
        
        console.log('Setting up blackjack game with eventParams:', eventParams);
        
        // Extract player data from JSON
        const playerData = eventParams.player || {
          name: "Player",
          image: "/assets/characters/default.png",
          startingMoney: eventParams.playerCost || 1000
        };
        
        // Extract dealers data from JSON
        const dealersData = eventParams.dealers || [{
          name: "Dealer",
          image: "/assets/characters/default.png", 
          startingMoney: 5000,
          eventName: "Default Table"
        }];
        
        // Set the number of opponents based on dealers array
        const numDealers = dealersData.length;
        setCurrentNumOpponents(numDealers);
        
        // Extract game rules
        const gameRules = {
          deckCount: eventParams.deckCount || 1,
          blackjackPayout: eventParams.blackjackPayout || 1.5,
          specialRules: eventParams.specialRules || null
        };
        
        console.log('Player data:', playerData);
        console.log('Dealers data:', dealersData);
        console.log('Game rules:', gameRules);
        
        // Set all game data from JSON
        setGameData({
          player: playerData,
          dealers: dealersData,
          playerEvent: {
            name: eventParams.playerEvent || "Blackjack Game",
            cost: eventParams.playerCost || 1000
          },
          gameRules: gameRules
        });
        
        // Set scores based on JSON data
        setScores({
          player: playerData.startingMoney,
          opponents: dealersData.map(dealer => dealer.startingMoney),
          initialPlayer: playerData.startingMoney,
          initialOpponents: dealersData.map(dealer => dealer.startingMoney)
        });
        
        // Reset win condition and hands played
        setWinConditionMet(false);
        setHandsPlayed(0);
        
        setIsGameSetup(true);
      } catch (error) {
        console.error("Error setting up game from JSON:", error);
        
        // Fallback to default values
        const defaultPlayer = {
          name: "Player",
          image: "/assets/characters/default.png",
          startingMoney: 1000
        };
        
        const defaultDealer = {
          name: "Dealer",
          image: "/assets/characters/default.png",
          startingMoney: 5000,
          eventName: "Default Table"
        };
        
        setGameData({
          player: defaultPlayer,
          dealers: [defaultDealer],
          playerEvent: { name: "Default Game", cost: 1000 },
          gameRules: { deckCount: 1, blackjackPayout: 1.5, specialRules: null }
        });
        
        setScores({
          player: 1000,
          opponents: [5000],
          initialPlayer: 1000,
          initialOpponents: [5000]
        });
        
        setCurrentNumOpponents(1);
        setIsGameSetup(true);
      }
    }
  }, [initialEvent]);
  
  // Update game when number of opponents changes
  useEffect(() => {
    if (currentNumOpponents > 0) {
      const newGame = new BlackjackGame(currentNumOpponents);
      newGame.initializeDeck();
      setGame(newGame);
      
      // Reset game state with new number of opponents
      setGameState(prevState => ({
        ...prevState,
        opponentHands: Array(currentNumOpponents).fill().map(() => []),
        winners: []
      }));
    }
  }, [currentNumOpponents]);
  
  useEffect(() => {
    // Only initialize the game after data has been loaded
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
    const playerProfit = scores.player - scores.initialPlayer;
    const targetProfit = scores.initialPlayer;
        
    if (playerProfit >= targetProfit) {
      setWinConditionMet(true);
      
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
    else if (scores.player < 5) {
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
      const blackjackMultiplier = gameData.gameRules.blackjackPayout || 1.5;
      
      winners.forEach((result, index) => {
        if (result === 'player') {
          if (isBlackjack) {
            const blackjackPayout = Math.floor(betAmount * blackjackMultiplier);
            newScores.player += blackjackPayout;
            newScores.opponents[index] -= blackjackPayout;
          } else {
            newScores.player += betAmount;
            newScores.opponents[index] -= betAmount;
          }
        } else if (result === 'opponent') {
          newScores.player -= betAmount;
          newScores.opponents[index] += betAmount;
        }
      });
      
      return newScores;
    });
  };

  // Calculate hand values
  const playerValue = gameState.playerHand.length > 0 ? game.calculateHandValue(gameState.playerHand) : 0;
  const opponentValues = gameState.opponentHands.map(hand => 
    hand.length > 0 ? game.calculateHandValue(hand) : 0
  );

  // Get game results in readable format
  const getGameResults = () => {
    if (!gameState.isGameOver) return null;
    return game.getResults();
  };

  // Don't render until game is set up
  if (!isGameSetup || !gameData.player || !gameData.dealers.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading game data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-800 flex flex-col p-4 overflow-hidden relative">
      {/* Enhanced Debug Info - Shows data from JSON */}
      {import.meta.env.DEV && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-90 text-white p-3 text-xs z-50 max-w-sm overflow-auto rounded">
          <div className="space-y-1">
            <div><strong>JSON Data Debug:</strong></div>
            <div>Player: {gameData.player?.name} (${gameData.player?.startingMoney})</div>
            <div>Dealers: {gameData.dealers?.map(d => `${d.name} ($${d.startingMoney})`).join(', ')}</div>
            <div>Event: {gameData.playerEvent?.name}</div>
            <div>Deck Count: {gameData.gameRules?.deckCount}</div>
            <div>Blackjack Payout: {gameData.gameRules?.blackjackPayout}x</div>
            <div>Special Rules: {gameData.gameRules?.specialRules || 'None'}</div>
            <div>Current Money: ${scores.player}</div>
            <div>Profit: ${scores.player - scores.initialPlayer}</div>
            <div>Hands Played: {handsPlayed}</div>
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
      
      {/* Game setup info - Multi-dealer notification */}
      {!gameState.betPlaced && currentNumOpponents > 1 && (
        <div className="mb-4 bg-black bg-opacity-30 p-3 rounded-lg flex justify-between items-center">
          <div className="text-white flex items-center">
            <span className="mr-2 text-yellow-300 font-bold">Playing {currentNumOpponents} Tables:</span>
            <span className="text-green-300 text-sm italic">
              {gameData.dealers.map(d => d.name).join(', ')} - You'll play the same hand against all dealers!
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
              name={gameData.player.name}
              avatarData={gameData.player} 
              score={scores.player}
              startingMoney={gameData.player.startingMoney}
              selectedEvent={gameData.playerEvent}
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
          
          {/* Betting controls */}
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
        
        {/* Center section - Game table */}
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
        
        {/* Right section - Dealers */}
        <div className="w-1/4 flex flex-col overflow-y-auto">
          <div className="flex-1 flex flex-col items-center justify-start w-full p-2">
            {/* Show dealer(s) name prominently */}
            <div className="w-full bg-black bg-opacity-50 text-yellow-300 text-center font-bold rounded-lg py-2 mb-2">
              {currentNumOpponents === 1 ? 
                `Dealer: ${gameData.dealers[0].name}` : 
                `${currentNumOpponents} Dealers`
              }
            </div>
            
            {/* Map through dealers from JSON data */}
            <div className={`w-full ${currentNumOpponents > 1 ? 'space-y-2' : ''}`}>
              {gameData.dealers.slice(0, currentNumOpponents).map((dealer, index) => (
                <div 
                  key={`dealer-${index}`} 
                  className={`w-full ${currentNumOpponents > 1 ? 'pb-2 border-b border-green-700' : ''}`}
                >
                  {/* Compact view for multiple dealers */}
                  {currentNumOpponents > 1 ? (
                    <div className="flex flex-col">
                      {/* Header with name and money in compact row */}
                      <div className="flex justify-between items-center mb-1 bg-green-900 bg-opacity-50 p-1 rounded-lg">
                        <div className="flex items-center">
                          {/* Small avatar circle */}
                          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-yellow-500 mr-2">
                            <img
                              src={dealer.image || '/default-avatar.png'}
                              alt={dealer.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/default-avatar.png';
                              }}
                            />
                          </div>
                          <span className="text-yellow-200 font-bold">{dealer.name}</span>
                        </div>
                        <div className="bg-black bg-opacity-50 px-2 py-1 rounded-full text-white text-sm">
                          ${scores.opponents[index]}
                        </div>
                      </div>
                      
                      {/* Table name */}
                      {dealer.eventName && (
                        <div className="text-xs text-green-300 text-center mb-1">{dealer.eventName}</div>
                      )}
                      
                      {/* Specialties */}
                      {dealer.specialties && (
                        <div className="text-xs text-blue-300 text-center mb-1">
                          {dealer.specialties.join(' • ')}
                        </div>
                      )}
                      
                      {/* Hand in compact mode */}
                      {gameState.betPlaced && (
                        <div className="w-full">
                          <Hand 
                            hand={gameState.opponentHands[index] || []} 
                            hidden={!gameState.isGameOver} 
                            label={`Table ${index + 1}`}
                            compact={true}
                          />
                          {gameState.isGameOver ? (
                            <div className="bg-black bg-opacity-40 rounded-lg px-3 py-1 text-center mt-1 text-sm shadow-inner">
                              <span className="text-green-300">Value:</span>
                              <span className="text-white font-bold ml-1">{opponentValues[index]}</span>
                              
                              {gameState.winners.length > index && (
                                <span className={`ml-2 ${
                                  gameState.winners[index] === 'player' ? 'text-green-400' : 
                                  gameState.winners[index] === 'opponent' ? 'text-red-400' : 
                                  'text-yellow-400'
                                }`}>
                                  ({
                                    gameState.winners[index] === 'player' ? 'Won' : 
                                    gameState.winners[index] === 'opponent' ? 'Lost' : 
                                    'Push'
                                  })
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="bg-black bg-opacity-40 rounded-lg px-3 py-1 text-center mt-1 text-sm shadow-inner">
                              <span className="text-red-300">Hidden</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Full-sized view for single dealer
                    <>
                      <PlayerView 
                        name={dealer.name}
                        avatarData={dealer} 
                        score={scores.opponents[index]}
                        startingMoney={dealer.startingMoney}
                        selectedEvent={{ name: dealer.eventName }}
                        isOpponent={true}
                      />
                      
                      {/* Table specialties */}
                      {dealer.specialties && (
                        <div className="text-xs text-blue-300 text-center mb-2">
                          {dealer.specialties.join(' • ')}
                        </div>
                      )}
                      
                      {gameState.betPlaced && (
                        <div className="my-3 w-full">
                          <Hand 
                            hand={gameState.opponentHands[index] || []} 
                            hidden={!gameState.isGameOver} 
                            label={`${dealer.name}'s Hand`}
                            compact={false}
                          />
                          {gameState.isGameOver ? (
                            <div className="bg-black bg-opacity-40 rounded-lg px-3 py-1 text-center mt-2 shadow-inner">
                              <span className="text-sm text-green-300">Hand Value:</span>
                              <span className="text-white text-lg font-bold ml-2">{opponentValues[index]}</span>
                              
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
              <li>• Blackjack pays {gameData.gameRules.blackjackPayout}x</li>
              <li>• Dealers must stand on 17 and draw to 16</li>
              <li>• Dealer wins ties except on blackjack</li>
              <li>• {gameData.gameRules.deckCount} deck(s) in play</li>
              {gameData.gameRules.specialRules && (
                <li>• Special: {gameData.gameRules.specialRules}</li>
              )}
              <li className="text-yellow-200 mt-2">• Goal: Double your initial money to win!</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Footer with game info */}
      <div className="mt-4 text-center text-xs text-green-400">
        &copy; 2025 Claude's Casino • Table Limits: $5 - $1,000 • 
        {gameData.playerEvent?.name ? ` Event: ${gameData.playerEvent.name}` : ''} • 
        {gameData.player.name} vs {gameData.dealers.slice(0, currentNumOpponents)
          .map(d => d.name)
          .join(', ')} • 
        Good Luck!
      </div>
    </div>
  );
};

export default BlackjackGameComponent;