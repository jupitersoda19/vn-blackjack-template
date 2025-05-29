import React from 'react';
import GameHeader from './GameHeader';
import PlayerSection from './PlayerSection';
import GameTable from './GameTable';
import DealerSection from './DealerSection';
import GameFooter from './GameFooter';

const GameUI = ({
  gameState,
  gameData,
  scores,
  handsPlayed,
  winConditionMet,
  currentNumOpponents,
  activePerks,
  perkEffects,
  perkInfo,
  roundInfo,
  onPlaceBet,
  onHit,
  onStand,
  onDouble,
  onSplit,
  onInsurance,
  onUndo,
  onNewGame,
  onGameComplete,
  game,
  stats,
  computedStats,
  perkRecommendations,
  isLowMoney,
  hasActivePerks
}) => {
  // Safe calculation of hand values with null checks
  const playerValue = gameState?.playerHand?.length > 0 && game?.calculateHandValue ? 
    game.calculateHandValue(gameState.playerHand) : 0;
  
  const opponentValues = gameState?.opponentHands?.map(hand =>
    hand?.length > 0 && game?.calculateHandValue ? game.calculateHandValue(hand) : 0
  ) || [];
  
  const getGameResults = () => {
    if (!gameState?.isGameOver || !game?.getResults) return null;
    try {
      return game.getResults();
    } catch (error) {
      console.warn('Error getting game results:', error);
      return null;
    }
  };

  // ENHANCED: Calculate if perks are currently active with safety checks
  const perksActive = activePerks?.length > 0 && 
    roundInfo && typeof roundInfo.arePerksActive === 'function' && roundInfo.arePerksActive();

  // Safe access to game data with defaults
  const safeGameData = {
    player: gameData?.player || { name: 'Player', startingMoney: 1000 },
    dealers: gameData?.dealers || [{ name: 'Dealer', startingMoney: 5000 }],
    gameRules: gameData?.gameRules || { blackjackPayout: '1.5x', deckCount: 1 },
    ...gameData
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-800 flex flex-col p-4 overflow-hidden relative">
      
      {/* Header - Enhanced with round progress */}
      <GameHeader
        winConditionMet={winConditionMet}
        scores={scores}
        handsPlayed={roundInfo?.totalHandsPlayed ?? handsPlayed ?? 0}
        roundInfo={roundInfo}
        onGameComplete={onGameComplete}
      />
      
      {/* Multi-dealer notification */}
      {!gameState?.betPlaced && currentNumOpponents > 1 && (
        <div className="mb-4 bg-black bg-opacity-30 p-3 rounded-lg flex justify-between items-center">
          <div className="text-white flex items-center">
            <span className="mr-2 text-yellow-300 font-bold">Playing {currentNumOpponents} Tables:</span>
            <span className="text-green-300 text-sm italic">
              {safeGameData.dealers.slice(0, currentNumOpponents).map(d => d?.name || 'Dealer').join(', ')} - You'll play the same hand against all dealers!
            </span>
          </div>
        </div>
      )}

      {/* Main Game Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Player Section - Enhanced with perk info */}
        <PlayerSection
          gameData={safeGameData}
          gameState={gameState}
          scores={scores}
          playerValue={playerValue}
          activePerks={activePerks}
          perkInfo={perkInfo}
          roundInfo={roundInfo}
          onPlaceBet={onPlaceBet}
          winConditionMet={winConditionMet}
          stats={stats}
          computedStats={computedStats}
          perkRecommendations={perkRecommendations}
          isLowMoney={isLowMoney}
        />
        
        {/* Game Table - Enhanced with round info */}
        <GameTable
          winners={gameState?.winners || []}
          currentPlayer={gameState?.currentPlayer || 'player'}
          isGameOver={gameState?.isGameOver || false}
          betAmount={gameState?.betAmount || 0}
          handsPlayed={roundInfo?.totalHandsPlayed ?? handsPlayed ?? 0}
          numOpponents={currentNumOpponents}
          roundInfo={roundInfo}
          activePerks={activePerks}
          onHit={onHit}
          onStand={onStand}
          onDouble={onDouble}
          onSplit={onSplit}
          onInsurance={onInsurance}
          onUndo={onUndo}
          onNewGame={onNewGame}
          isPlayerTurn={gameState?.currentPlayer === 'player'}
          disabled={winConditionMet}
          gameResults={getGameResults()}
          game={game}
          gameState={gameState}
          perkInfo={perkInfo}
        />
        
        {/* Dealer Section - Enhanced with perk info */}
        <DealerSection
          gameData={safeGameData}
          gameState={gameState}
          scores={scores}
          opponentValues={opponentValues}
          currentNumOpponents={currentNumOpponents}
          perkInfo={perkInfo}
          roundInfo={roundInfo}
          game={game}
        />
      </div>
      
      {/* Footer - Enhanced with round info */}
      <GameFooter 
        gameData={safeGameData} 
        currentNumOpponents={currentNumOpponents}
        roundInfo={roundInfo}
        activePerks={activePerks}
        stats={stats}
        computedStats={computedStats}
      />
    </div>
  );
};

export default GameUI;