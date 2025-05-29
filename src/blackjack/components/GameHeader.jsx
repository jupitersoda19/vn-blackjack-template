import React from 'react';

const GameHeader = ({ winConditionMet, scores, handsPlayed, onGameComplete }) => {
  const handleReturnToStory = () => {
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
        onGameComplete(`You've finished with $${scores.player} after ${handsPlayed} hands.`, finalScores);
      }
    }
  };

  return (
    <>
      {/* Return to story button */}
      <button 
        className="absolute top-4 right-4 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg z-50 flex items-center"
        onClick={handleReturnToStory}
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
    </>
  );
};

export default GameHeader;
