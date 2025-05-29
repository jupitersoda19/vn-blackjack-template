// components/TimeTravelerUI.js - UI component for Time Traveler undo functionality
import React from 'react';

const TimeTravelerUI = ({ game, onUndo, gameState }) => {
  if (!game || !game.getUndoInfo) {
    return null;
  }

  const undoInfo = game.getUndoInfo();
  
  // Don't show if Time Traveler isn't active
  if (!undoInfo.total || undoInfo.total === 0) {
    return null;
  }

  // Don't show during opponent's turn or when game is over
  if (gameState?.currentPlayer !== 'player' || gameState?.isGameOver) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-30">
      <div className="bg-purple-900 bg-opacity-90 border-2 border-purple-500 rounded-lg p-3 shadow-lg">
        <div className="text-center mb-2">
          <div className="text-purple-300 text-sm font-bold">⏰ Time Traveler</div>
          <div className="text-xs text-purple-200">
            {undoInfo.remaining}/{undoInfo.total} undos remaining
          </div>
        </div>
        
        <button
          onClick={onUndo}
          disabled={!undoInfo.available}
          className={`w-full px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${
            undoInfo.available 
              ? 'bg-purple-600 hover:bg-purple-500 text-white transform hover:scale-105 shadow-lg' 
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
          title={
            undoInfo.available 
              ? 'Undo your last action' 
              : undoInfo.hasHistory 
                ? 'No undos remaining this round' 
                : 'No actions to undo'
          }
        >
          {undoInfo.available ? '⏰ UNDO' : 'NO UNDOS'}
        </button>
        
        {undoInfo.used > 0 && (
          <div className="text-xs text-purple-300 mt-1 text-center">
            Used {undoInfo.used} time{undoInfo.used !== 1 ? 's' : ''} this round
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeTravelerUI;