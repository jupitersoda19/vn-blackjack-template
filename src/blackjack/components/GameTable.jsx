// GameTable.js - Updated for multiple opponents
import React from 'react';

const GameTable = ({ 
  winners = [], 
  currentPlayer, 
  isGameOver, 
  betAmount, 
  handsPlayed = 0,
  numOpponents = 1,
  onHit,
  onStand,
  onNewGame,
  isPlayerTurn,
  disabled = false,
  gameResults = null
}) => {
  // Determine winner message
  const getGameStateMessage = () => {
    if (!isGameOver && isPlayerTurn) {
      return "Your Turn";
    } else if (!isGameOver) {
      return "Dealer's Turn";
    } else if (gameResults) {
      // If we have detailed results, show the first one
      const firstResult = gameResults[0];
      if (firstResult) {
        return firstResult.result;
      }
    }
    
    // Default handling if gameResults not available
    if (!winners || winners.length === 0) return "Game Over";
    
    // Simple case with one opponent
    if (numOpponents === 1) {
      const winner = winners[0];
      if (winner === 'player') return "You Win!";
      if (winner === 'opponent') return "Dealer Wins!";
      return "Push - It's a Tie!";
    }
    
    // Multiple opponents
    const playerWins = winners.filter(w => w === 'player').length;
    const dealerWins = winners.filter(w => w === 'opponent').length;
    const ties = winners.filter(w => w === 'tie').length;
    
    if (playerWins > dealerWins) {
      return `You Win (${playerWins}/${numOpponents})`;
    } else if (dealerWins > playerWins) {
      return `Dealers Win (${dealerWins}/${numOpponents})`;
    } else if (dealerWins === playerWins) {
      return `Tied Game (${playerWins}-${dealerWins})`;
    }
    
    return "Game Over";
  };
  
  // Determine result message styling
  const getResultStyling = () => {
    if (!isGameOver) return "";
   
    if (numOpponents === 1) {
      // Single opponent styling
      const winner = winners[0];
      if (winner === 'player') {
        return "bg-green-600 border-green-400";
      } else if (winner === 'opponent') {
        return "bg-red-600 border-red-400";
      } else {
        return "bg-yellow-600 border-yellow-400";
      }
    } else {
      // Multiple opponents styling based on overall outcome
      const playerWins = winners.filter(w => w === 'player').length;
      const dealerWins = winners.filter(w => w === 'opponent').length;
      
      if (playerWins > dealerWins) {
        return "bg-green-600 border-green-400";
      } else if (dealerWins > playerWins) {
        return "bg-red-600 border-red-400";
      } else {
        return "bg-yellow-600 border-yellow-400";
      }
    }
  };

  return (
    <div className="flex-1 bg-green-800 rounded-xl p-6 mx-4 flex flex-col items-center justify-between relative">
      {/* Decorative elements */}
      <div className="absolute inset-2 border-4 border-green-700 rounded-lg pointer-events-none"></div>
      <div className="absolute inset-4 border border-green-600 rounded-lg opacity-50 pointer-events-none"></div>
     
      {/* Casino name and hand counter */}
      <div className="w-full flex justify-between items-center mt-2">
        <div className="text-yellow-300 font-bold text-2xl tracking-wide">BLACKJACK</div>
        <div className="bg-black bg-opacity-50 px-4 py-1 rounded-full text-yellow-200 text-sm">
          Hand: {handsPlayed}
        </div>
      </div>
     
      {/* Game status area */}
      <div className="w-full flex justify-center mb-4">
        {isGameOver ? (
          <div className={`px-8 py-2 rounded-lg border-2 text-white font-bold text-3xl shadow-lg ${getResultStyling()}`}>
            {getGameStateMessage()}
          </div>
        ) : (
          <div className="bg-green-700 px-8 py-2 rounded-lg border-2 border-green-600 text-white font-bold text-xl shadow-md">
            {getGameStateMessage()}
          </div>
        )}
      </div>
     
      {/* Main table area */}
      <div className="bg-green-700 rounded-lg w-full flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Table controls - Only show when it's player's turn and game is not over */}
        {currentPlayer === 'player' && !isGameOver && betAmount > 0 && (
          <div className="absolute top-0 left-0 right-0 flex justify-center mt-8 z-10">
            <div className="flex space-x-4">
              <button
                className={`bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg flex items-center 
                  ${(!isPlayerTurn || disabled) ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={onHit}
                disabled={!isPlayerTurn || disabled}
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                HIT
              </button>
              
              <button
                className={`bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg flex items-center
                  ${(!isPlayerTurn || disabled) ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={onStand}
                disabled={!isPlayerTurn || disabled}
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                </svg>
                STAND
              </button>
            </div>
          </div>
        )}

        {/* New Game button - Only show when game is over */}
        {isGameOver && !disabled && (
          <div className="absolute top-0 left-0 right-0 flex justify-center mt-8 z-10">
            <button
              className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg flex items-center"
              onClick={onNewGame}
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              NEW HAND
            </button>
          </div>
        )}
        
        {/* Multiple opponents indicator */}
        {numOpponents > 1 && (
          <div className="absolute top-32 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 px-4 py-1 rounded-full text-green-300 text-sm">
            Playing {numOpponents} Tables
          </div>
        )}
       
        {/* Detailed results for multiple opponents */}
        {isGameOver && gameResults && numOpponents > 1 && (
          <div className="absolute top-48 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 p-3 rounded-lg text-white text-sm max-w-xs">
            <h3 className="text-yellow-300 text-center font-bold mb-2">Table Results</h3>
            <div className="space-y-1">
              {gameResults.map((result, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-300">Table {index + 1}:</span>
                  <span className={`font-bold ${
                    result.result === "You win" || result.result === "Blackjack!" || result.result === "Dealer busts" 
                      ? "text-green-400" 
                      : result.result === "Dealer wins" || result.result === "You bust" 
                        ? "text-red-400" 
                        : "text-yellow-400"
                  }`}>
                    {result.result}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
       
        {/* Center betting circle */}
        <div className="w-32 h-32 rounded-full border-4 border-yellow-300 flex items-center justify-center overflow-hidden">
          {betAmount > 0 ? (
            <div className="flex flex-col items-center">
              <div className="bg-yellow-400 text-black font-bold text-xl px-4 py-1 rounded-full mb-1">
                ${betAmount}
              </div>
              <div className="text-white text-xs">BET</div>
            </div>
          ) : (
            <div className="text-yellow-200 text-sm text-center">
              Place<br/>Your Bet
            </div>
          )}
        </div>
        
        {/* Chip stack visualization */}
        {betAmount > 0 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <ChipStack amount={betAmount} />
          </div>
        )}
       
        {/* Table markings */}
       
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-green-600 opacity-30"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-green-600 opacity-20"></div>
        </div>
      </div>
    </div>
  );
};

// Chip stack visualization component
const ChipStack = ({ amount }) => {
  // Calculate number of chips of each denomination to display
  const calculateChips = (amount) => {
    const chips = [];
    let remaining = amount;
    
    // Chip denominations and colors
    const denominations = [
      { value: 500, color: 'bg-black', borderColor: 'border-gray-400' },
      { value: 100, color: 'bg-purple-800', borderColor: 'border-purple-400' },
      { value: 25, color: 'bg-green-500', borderColor: 'border-green-400' },
      { value: 5, color: 'bg-red-700', borderColor: 'border-red-400' },
      { value: 1, color: 'bg-blue-700', borderColor: 'border-blue-400' }
    ];
    
    // Calculate chips for each denomination
    denominations.forEach(denom => {
      const count = Math.floor(remaining / denom.value);
      remaining %= denom.value;
      
      for (let i = 0; i < count; i++) {
        // Limit stack height for visual appeal
        if (chips.length < 12) {
          chips.push({
            value: denom.value,
            color: denom.color,
            borderColor: denom.borderColor
          });
        }
      }
    });
    
    return chips;
  };
  
  const chips = calculateChips(amount);
  
  return (
    <div className="relative">
      {chips.map((chip, index) => (
        <div 
          key={index} 
          className={`absolute w-12 h-3 rounded-full ${chip.color} ${chip.borderColor} shadow-md flex items-center justify-center text-xs text-white font-bold`}
          style={{ 
            bottom: `${index * 3}px`, 
            left: '0',
            zIndex: index,
            transform: `rotate(${Math.random() * 10 - 5}deg)`
          }}
        >
          {chip.value >= 100 && <span className="text-xs">${chip.value}</span>}
        </div>
      ))}
    </div>
  );
};

export default GameTable;