import React from 'react';
import PlayerView from './PlayerView';
import Hand from './Hand';
import { EnhancedBettingControls } from './PerksSystem';

const PlayerSection = ({
  gameData,
  gameState,
  scores,
  playerValue,
  activePerks,
  perkInfo,
  onPlaceBet,
  winConditionMet
}) => {
  return (
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
          <EnhancedBettingControls 
            onPlaceBet={onPlaceBet}
            maxBet={scores.player}
            disabled={gameState.betPlaced || winConditionMet}
            activePerks={activePerks}
            currentMoney={scores.player}
            perkInfo={perkInfo}
          />
        </div>
      )}
    </div>
  );
};

export default PlayerSection;