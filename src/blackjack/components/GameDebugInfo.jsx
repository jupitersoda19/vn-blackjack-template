import React from 'react';

const GameDebugInfo = ({ gameData, scores, handsPlayed }) => {
  if (!import.meta.env.DEV) return null;

  return (
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
  );
};

export default GameDebugInfo;