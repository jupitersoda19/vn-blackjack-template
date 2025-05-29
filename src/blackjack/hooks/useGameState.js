// hooks/useGameState.js
import { useState } from 'react';
import BlackjackGame from '../BlackjackGame';

export const useGameState = (game, numOpponents) => {
  const [gameState, setGameState] = useState({
    playerHand: [],
    opponentHands: Array(numOpponents).fill().map(() => []),
    currentPlayer: 'player',
    isGameOver: false,
    winners: [],
    betPlaced: false,
    betAmount: 0,
    isFreeBet: false
  });

  const updateGameState = (currentGame, additionalState = {}) => {
    setGameState(prevState => {
      const opponentHands = [];
      for (let i = 0; i < numOpponents; i++) {
        opponentHands.push(currentGame.getOpponentHand(i));
      }
      
      const newState = {
        ...prevState,
        playerHand: currentGame.playerHand,
        opponentHands: opponentHands,
        currentPlayer: currentGame.currentPlayer,
        isGameOver: currentGame.isGameOver,
        ...additionalState
      };
      
      if (currentGame.isGameOver) {
        newState.winners = currentGame.determineWinners();
      }
      
      return newState;
    });
  };

  const initializeGame = () => {
    const newGame = new BlackjackGame(numOpponents);
    newGame.initializeDeck();
    setGameState(prevState => ({
      ...prevState,
      playerHand: [],
      opponentHands: Array(numOpponents).fill().map(() => []),
      currentPlayer: 'player',
      isGameOver: false,
      winners: [],
      betPlaced: false,
      betAmount: 0,
      isFreeBet: false
    }));
  };

  const resetGameState = (newNumOpponents) => {
    setGameState(prevState => ({
      ...prevState,
      opponentHands: Array(newNumOpponents).fill().map(() => []),
      winners: []
    }));
  };

  return { gameState, updateGameState, initializeGame, resetGameState };
};