import React from 'react';

const GameFooter = ({ gameData, currentNumOpponents }) => {
  return (
    <div className="mt-4 text-center text-xs text-green-400">
      &copy; 2025 Claude's Casino • Table Limits: $5 - $1,000 • 
      {gameData.playerEvent?.name ? ` Event: ${gameData.playerEvent.name}` : ''} • 
      {gameData.player.name} vs {gameData.dealers.slice(0, currentNumOpponents)
        .map(d => d.name)
        .join(', ')} • 
      Good Luck!
    </div>
  );
};

export default GameFooter;