
// hooks/useScoreManager.js
import { useState, useEffect } from 'react';

export const useScoreManager = (gameData, onGameComplete) => {
  const [scores, setScores] = useState({
    player: 1000,
    opponents: [],
    initialPlayer: 1000,
    initialOpponents: []
  });
  const [winConditionMet, setWinConditionMet] = useState(false);

  // Initialize scores when game data is ready
  useEffect(() => {
    if (gameData.player && gameData.dealers.length > 0) {
      setScores({
        player: gameData.player.startingMoney,
        opponents: gameData.dealers.map(dealer => dealer.startingMoney),
        initialPlayer: gameData.player.startingMoney,
        initialOpponents: gameData.dealers.map(dealer => dealer.startingMoney)
      });
    }
  }, [gameData]);

  const updateScores = (updaterFunction) => {
    setScores(updaterFunction);
  };

  const checkWinCondition = (handsPlayed) => {
    const playerProfit = scores.player - scores.initialPlayer;
    const targetProfit = scores.initialPlayer;
    
    if (playerProfit >= targetProfit) {
      setWinConditionMet(true);
      setTimeout(() => {
        if (onGameComplete) {
          onGameComplete(`You've doubled your money! Final profit: ${playerProfit}`, {
            player: scores.player,
            opponents: scores.opponents,
            initialPlayer: scores.initialPlayer,
            initialOpponents: scores.initialOpponents,
            handsPlayed
          });
        }
      }, 2000);
    } else if (scores.player < 5) {
      setTimeout(() => {
        if (onGameComplete) {
          onGameComplete(`You've lost all your money after ${handsPlayed} hands.`, {
            player: scores.player,
            opponents: scores.opponents,
            initialPlayer: scores.initialPlayer,
            initialOpponents: scores.initialOpponents,
            handsPlayed
          });
        }
      }, 2000);
    }
  };

  return { scores, updateScores, checkWinCondition, winConditionMet };
};