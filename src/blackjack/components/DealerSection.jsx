// components/DealerSection.js - FIXED VERSION with proper error handling
import React from 'react';
import DealerView from './DealerView';
import Hand from './Hand';

const DealerSection = ({
  gameData,
  gameState,
  scores,
  opponentValues,
  currentNumOpponents,
  perkInfo,
  game
}) => {
  return (
    <div className="w-1/4 flex flex-col overflow-y-auto">
      <div className="flex-1 flex flex-col items-center justify-start w-full p-2">
        {/* Dealer header - clearly indicates this is the dealer side */}
        <div className="w-full bg-red-900 bg-opacity-50 text-red-200 text-center font-bold rounded-lg py-2 mb-2 border border-red-500">
          {currentNumOpponents === 1 ? 
            `🎰 ${gameData?.dealers?.[0]?.name || 'Dealer'}` : 
            `🎰 ${currentNumOpponents} Dealers`
          }
        </div>
        
        {/* Dealers */}
        <div className={`w-full ${currentNumOpponents > 1 ? 'space-y-2' : ''}`}>
          {gameData?.dealers?.slice(0, currentNumOpponents).map((dealer, index) => (
            <DealerCard
              key={`dealer-${index}`}
              dealer={dealer}
              index={index}
              gameState={gameState}
              scores={scores}
              opponentValues={opponentValues}
              currentNumOpponents={currentNumOpponents}
              perkInfo={perkInfo}
              game={game}
            />
          )) || null}
        </div>
      </div>
      
      {/* Game rules section */}
      <div className="bg-black bg-opacity-30 rounded-lg p-4 mt-auto w-full sticky bottom-0">
        <h3 className="text-yellow-300 font-bold mb-2 text-center">🃏 BLACKJACK RULES</h3>
        <ul className="text-xs text-green-300 space-y-1">
          <li>• Blackjack pays {gameData?.gameRules?.blackjackPayout || '1.5'}x</li>
          <li>• Dealers must stand on 17 and draw to 16</li>
          <li>• Dealer wins ties except on blackjack</li>
          <li>• {gameData?.gameRules?.deckCount || '1'} deck(s) in play</li>
          {gameData?.gameRules?.specialRules && (
            <li>• Special: {gameData.gameRules.specialRules}</li>
          )}
          <li className="text-yellow-200 mt-2">🎯 Goal: Double your initial money to win!</li>
        </ul>
      </div>
    </div>
  );
};

// Updated Dealer Card Component with proper error handling
const DealerCard = ({ 
  dealer, 
  index, 
  gameState, 
  scores, 
  opponentValues, 
  currentNumOpponents,
  perkInfo,
  game
}) => {
  const isCompact = currentNumOpponents > 1;
  
  // Safe access to game state properties
  const dealerHand = gameState?.opponentHands?.[index] || [];
  const dealerScore = scores?.opponents?.[index] || 0;
  const dealerValue = opponentValues?.[index] || 0;
  const winner = gameState?.winners?.[index]; // This might be undefined and that's OK

  if (isCompact) {
    return (
      <div className="w-full pb-2 border-b border-red-700">
        <DealerView
          name={dealer?.name || `Dealer ${index + 1}`}
          avatarData={dealer}
          score={dealerScore}
          startingMoney={dealer?.startingMoney || 5000}
          eventName={dealer?.eventName || 'Blackjack Table'}
          specialties={dealer?.specialties}
          compact={true}
        />
        
        {gameState?.betPlaced && (
          <div className="w-full mt-2">
            <Hand 
              hand={dealerHand} 
              hidden={!gameState?.isGameOver} 
              label={`${dealer?.name || 'Dealer'}'s Hand`}
              compact={true}
            />
            <HandValueDisplay
              isGameOver={gameState?.isGameOver || false}
              opponentValue={dealerValue}
              winner={winner}
              compact={true}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <DealerView
        name={dealer?.name || `Dealer ${index + 1}`}
        avatarData={dealer}
        score={dealerScore}
        startingMoney={dealer?.startingMoney || 5000}
        eventName={dealer?.eventName || 'Blackjack Table'}
        specialties={dealer?.specialties}
        compact={false}
      />
      
      {gameState?.betPlaced && (
        <div className="my-3 w-full">
          <Hand 
            hand={dealerHand} 
            hidden={!gameState?.isGameOver} 
            label={`${dealer?.name || 'Dealer'}'s Hand`}
            compact={false}
          />
          <HandValueDisplay
            isGameOver={gameState?.isGameOver || false}
            opponentValue={dealerValue}
            winner={winner}
            compact={false}
          />
        </div>
      )}
    </>
  );
};

// Fixed Hand Value Display Component with proper null checks
const HandValueDisplay = ({ isGameOver, opponentValue, winner, compact }) => {
  if (!isGameOver) {
    return (
      <div className={`bg-black bg-opacity-40 rounded-lg px-3 py-1 text-center ${compact ? 'mt-1 text-sm' : 'mt-2'} shadow-inner`}>
        <span className="text-red-300">{compact ? 'Hidden' : 'Value Hidden'}</span>
      </div>
    );
  }

  const getWinnerText = (result, compact) => {
    if (!result) return ''; // Handle undefined winner
    if (compact) {
      return result === 'player' ? 'Won' : result === 'opponent' ? 'Lost' : 'Push';
    }
    return result === 'player' ? 'You Won' : result === 'opponent' ? 'Dealer Won' : 'Push';
  };

  const getWinnerColor = (result) => {
    if (!result) return 'text-gray-400'; // Handle undefined winner
    return result === 'player' ? 'text-green-400' : 
           result === 'opponent' ? 'text-red-400' : 'text-yellow-400';
  };

  return (
    <div className={`bg-black bg-opacity-40 rounded-lg px-3 py-1 text-center ${compact ? 'mt-1 text-sm' : 'mt-2'} shadow-inner`}>
      <span className="text-green-300">{compact ? 'Value:' : 'Hand Value:'}</span>
      <span className={`text-white font-bold ml-${compact ? '1' : '2'} ${compact ? '' : 'text-lg'}`}>
        {opponentValue || 0}
      </span>
      
      {winner && (
        <span className={`ml-2 ${compact ? 'text-sm' : 'text-sm'} ${getWinnerColor(winner)}`}>
          ({getWinnerText(winner, compact)})
        </span>
      )}
    </div>
  );
};

export default DealerSection;