// BlackjackGameComponent.js - Streamlined version with fixed perk loading
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import BlackjackGame from './BlackjackGame';
import GameUI from './components/GameUI';
import TimeTravelerUI from './components/TimeTravelerUI';
import {
  PerkSelector,
  useRoundManagement,
  usePlayerStats,
  usePerkInfo,
  PerksInfoBar,
  EnhancedBettingControls,
  usePerkEffects
} from './components/PerksSystem';

const BlackjackGameComponent = ({
  initialEvent,
  onGameComplete,
  playerData,
  selectedCharacters,
  numOpponents = 1,
  persistentGameState = null
}) => {
  // Core game state
  const [game, setGame] = useState(() => new BlackjackGame(numOpponents));
  const [gameState, setGameState] = useState({
    playerHand: [],
    opponentHands: Array(numOpponents).fill().map(() => []),
    currentPlayer: 'player',
    isGameOver: false,
    winners: [],
    betPlaced: false,
    betAmount: 0,
    isFreeBet: false,
    handNumber: 0
  });

  // Game setup and scoring
  const [gameData, setGameData] = useState({
    player: null,
    dealers: [],
    playerEvent: null,
    gameRules: {}
  });
  const [isGameSetup, setIsGameSetup] = useState(false);
  const [scores, setScores] = useState({
    player: 1000,
    opponents: [],
    initialPlayer: 1000,
    initialOpponents: []
  });

  // UI state
  const [gameMessage, setGameMessage] = useState('');
  const [messageType, setMessageType] = useState('info');

  // Perk system
  const roundInfo = useRoundManagement();
  const { stats, computedStats, updateStats, useBailout, useFreeBet, resetStats } = usePlayerStats();
  const combinedPerkEffects = usePerkEffects(roundInfo.activePerks);
  const perkInfo = usePerkInfo(roundInfo.activePerks, gameState, game);

  // Memoized values
  const isLowMoney = useMemo(() => scores.player < 50, [scores.player]);
  const hasActivePerks = useMemo(() => roundInfo.activePerks.length > 0, [roundInfo.activePerks]);

  // Initialize game data
  useEffect(() => {
    if (!isGameSetup && initialEvent?.action === 'startGame') {
      try {
        const eventParams = initialEvent.eventParams || {};
        
        const playerData = eventParams.player || {
          name: "Player",
          image: "/assets/characters/default.png",
          startingMoney: 1000
        };
        
        const dealersData = eventParams.dealers || [{
          name: "Dealer",
          image: "/assets/characters/default.png", 
          startingMoney: 5000,
          eventName: "Default Table"
        }];
        
        setGameData({
          player: playerData,
          dealers: dealersData,
          playerEvent: {
            name: eventParams.playerEvent || "Blackjack Game",
            cost: eventParams.playerCost || 1000
          },
          gameRules: eventParams.gameRules || {}
        });
        
        const startingMoney = playerData.startingMoney;
        setScores({
          player: startingMoney,
          opponents: dealersData.map(dealer => dealer.startingMoney),
          initialPlayer: startingMoney,
          initialOpponents: dealersData.map(dealer => dealer.startingMoney)
        });
        
        setIsGameSetup(true);
        setGameMessage(`Welcome! Starting with $${startingMoney}`);
        setMessageType('success');
      } catch (error) {
        setGameMessage('Error setting up game. Using defaults.');
        setMessageType('error');
        setIsGameSetup(true);
      }
    }
  }, [initialEvent, isGameSetup]);

  // Apply perk effects
  useEffect(() => {
    if (game && Object.keys(combinedPerkEffects).length > 0) {
      game.setPerkEffects(combinedPerkEffects);
    }
  }, [game, combinedPerkEffects]);

  // Starting money bonus
  useEffect(() => {
    if (combinedPerkEffects.startingMoney && 
        roundInfo.totalHandsPlayed === 0 && 
        scores.player === scores.initialPlayer) {
      
      const bonus = combinedPerkEffects.startingMoney;
      setScores(prev => ({
        ...prev,
        player: prev.player + bonus
      }));
      
      setGameMessage(`💰 Starting bonus: +$${bonus}`);
      setMessageType('success');
    }
  }, [combinedPerkEffects.startingMoney, roundInfo.totalHandsPlayed, scores.player, scores.initialPlayer]);

  // Auto-bailout
  useEffect(() => {
    const bailoutInfo = perkInfo.getBailoutInfo(scores.player, stats);
    if (bailoutInfo.available && scores.player < 20) {
      const bailoutAmount = bailoutInfo.amount;
      setScores(prev => ({ ...prev, player: prev.player + bailoutAmount }));
      useBailout();
      
      setGameMessage(`🆘 Emergency bailout: +$${bailoutAmount}`);
      setMessageType('success');
    }
  }, [scores.player, stats, perkInfo, useBailout]);

  // Handle perk selection
  const handlePerksSelected = useCallback((selectedPerks) => {
    roundInfo.completePerkSelection(selectedPerks);
    
    if (game && game.resetRoundStats) {
      game.resetRoundStats();
    }
    
    if (selectedPerks.length > 0) {
      setGameMessage(`✨ Added ${selectedPerks.length} perk${selectedPerks.length > 1 ? 's' : ''}`);
      setMessageType('success');
    }
    
    if (roundInfo.totalHandsPlayed === 0) {
      initializeGame();
    }
  }, [roundInfo, game]);

  const handleSkipPerks = useCallback(() => {
    roundInfo.completePerkSelection([]);
    setGameMessage('Skipped perk selection');
    setMessageType('info');
    
    if (roundInfo.totalHandsPlayed === 0) {
      initializeGame();
    }
  }, [roundInfo]);

  // Initialize game
  const initializeGame = useCallback(() => {
    try {
      const newGame = new BlackjackGame(numOpponents);
      
      if (Object.keys(combinedPerkEffects).length > 0) {
        newGame.setPerkEffects(combinedPerkEffects);
      }
      
      newGame.initializeDeck();
      setGame(newGame);
      
      setGameState({
        playerHand: [],
        opponentHands: Array(numOpponents).fill().map(() => []),
        currentPlayer: 'player',
        isGameOver: false,
        winners: [],
        betPlaced: false,
        betAmount: 0,
        isFreeBet: false,
        handNumber: 0
      });
      
    } catch (error) {
      setGameMessage('Error initializing game. Please refresh.');
      setMessageType('error');
    }
  }, [numOpponents, combinedPerkEffects]);

  // Place bet
  const handlePlaceBet = useCallback((amount, options = {}) => {
    let effectiveMinBet = combinedPerkEffects.minBet || 5;
    
    if (combinedPerkEffects.emergencyMinBet && combinedPerkEffects.emergencyThreshold) {
      if (scores.player < combinedPerkEffects.emergencyThreshold) {
        effectiveMinBet = Math.min(effectiveMinBet, combinedPerkEffects.emergencyMinBet);
      }
    }
    
    if (amount < effectiveMinBet) {
      setGameMessage(`❌ Minimum bet is $${effectiveMinBet}`);
      setMessageType('error');
      return;
    }
    
    if (amount > scores.player && !options.isFreeBet) {
      setGameMessage(`❌ Insufficient funds. You have $${scores.player}`);
      setMessageType('error');
      return;
    }
    
    if (options.isFreeBet) {
      useFreeBet();
      setGameMessage(`🎯 Using free bet of $${amount}`);
      setMessageType('success');
    }
    
    game.placeBet(amount);
    setGameState(prevState => ({
      ...prevState,
      betPlaced: true,
      betAmount: amount,
      isFreeBet: options.isFreeBet || false
    }));
    
    startNewHand();
  }, [game, scores.player, combinedPerkEffects, useFreeBet]);

  // Update scores with perks
  const updateScoresWithPerks = useCallback((winners, betAmount, isFreeBet = false) => {
    setScores(prevScores => {
      const newScores = { ...prevScores };
      const playerValue = game.calculateHandValue(gameState.playerHand);
      const isBlackjack = playerValue === 21 && gameState.playerHand.length === 2;
      
      const perkBonuses = game.calculatePerkBonuses();
      const insurancePayout = game.calculateInsurancePayout();
      
      winners.forEach((result, index) => {
        let winAmount = betAmount;
        let lossAmount = betAmount;
        let bonusAmount = 0;
        
        if (result === 'player') {
          // Win bonuses
          if (combinedPerkEffects.winBonus) {
            bonusAmount += combinedPerkEffects.winBonus;
          }
          
          if (isBlackjack && combinedPerkEffects.blackjackMultiplier) {
            winAmount = Math.floor(betAmount * combinedPerkEffects.blackjackMultiplier);
          }
          
          if (combinedPerkEffects.doubleWinInterval) {
            const totalWins = stats.totalWins + 1;
            if (totalWins % combinedPerkEffects.doubleWinInterval === 0) {
              winAmount *= 2;
            }
          }
          
          if (combinedPerkEffects.luckyNumbers?.includes(playerValue) && combinedPerkEffects.luckyBonus) {
            bonusAmount += combinedPerkEffects.luckyBonus;
          }
          
          if (combinedPerkEffects.streakBonus && combinedPerkEffects.streakThreshold) {
            const currentStreak = stats.currentWinStreak + 1;
            if (currentStreak >= combinedPerkEffects.streakThreshold) {
              const streakBonus = (currentStreak - combinedPerkEffects.streakThreshold + 1) * combinedPerkEffects.streakBonus;
              bonusAmount += streakBonus;
            }
          }
          
          if (combinedPerkEffects.comebackMultiplier && stats.currentLoseStreak >= combinedPerkEffects.comebackTrigger) {
            winAmount *= combinedPerkEffects.comebackMultiplier;
          }
          
          if (combinedPerkEffects.lowMoneyMultiplier && combinedPerkEffects.lowMoneyThreshold) {
            if (newScores.player < combinedPerkEffects.lowMoneyThreshold) {
              winAmount *= combinedPerkEffects.lowMoneyMultiplier;
            }
          }
          
          bonusAmount += perkBonuses.aceBonus + perkBonuses.faceCardBonus + perkBonuses.splitBonus;
          
          const totalWin = winAmount + bonusAmount;
          newScores.player += totalWin;
          if (newScores.opponents[index]) newScores.opponents[index] -= totalWin;
          
          updateStats('win', totalWin, isBlackjack, hasActivePerks);
          setGameMessage(`🎉 Won $${totalWin}${bonusAmount > 0 ? ` (+$${bonusAmount} bonuses)` : ''}`);
          setMessageType('success');
          
        } else if (result === 'opponent') {
          // Loss reductions
          if (combinedPerkEffects.lossReduction) {
            lossAmount = Math.max(1, lossAmount - combinedPerkEffects.lossReduction);
          }
          
          if (combinedPerkEffects.firstBetInsurance && roundInfo.totalHandsPlayed === 1) {
            const insurance = Math.floor(lossAmount * combinedPerkEffects.firstBetInsurance);
            lossAmount -= insurance;
          }
          
          if (!isFreeBet) {
            newScores.player -= lossAmount;
            if (newScores.opponents[index]) newScores.opponents[index] += lossAmount;
          }
          
          updateStats('loss', lossAmount, false, hasActivePerks);
          setGameMessage(`😞 Lost $${isFreeBet ? 0 : lossAmount}${isFreeBet ? ' (Free bet!)' : ''}`);
          setMessageType(isFreeBet ? 'info' : 'error');
          
        } else {
          // Push
          if (combinedPerkEffects.pushBonus) {
            bonusAmount += combinedPerkEffects.pushBonus;
            newScores.player += bonusAmount;
          }
          
          updateStats('push', 0, false, hasActivePerks);
          setGameMessage(`🤝 Push${bonusAmount > 0 ? ` +$${bonusAmount}` : ''}`);
          setMessageType('info');
        }
      });
      
      if (insurancePayout !== 0) {
        newScores.player += insurancePayout;
      }
      
      return newScores;
    });
  }, [game, gameState.playerHand, combinedPerkEffects, stats, roundInfo.totalHandsPlayed, hasActivePerks, updateStats]);

  // Handle game end
  const handleGameEnd = useCallback((winners, betAmount) => {
    updateScoresWithPerks(winners, betAmount, gameState.isFreeBet);
    
    setTimeout(() => {
      roundInfo.completeHand();
    }, 500);
  }, [updateScoresWithPerks, gameState.isFreeBet, roundInfo]);

  // Update game state
  const updateGameState = useCallback((currentGame) => {
    const newState = {
      playerHand: currentGame.playerHand || [],
      opponentHands: currentGame.opponentHands || [],
      currentPlayer: currentGame.currentPlayer,
      isGameOver: currentGame.isGameOver,
      handNumber: currentGame.handNumber || 0,
      betPlaced: gameState.betPlaced,
      betAmount: gameState.betAmount,
      isFreeBet: gameState.isFreeBet
    };
    
    if (currentGame.isGameOver) {
      const winners = currentGame.determineWinners();
      newState.winners = winners;
      setTimeout(() => handleGameEnd(winners, gameState.betAmount), 200);
    }
    
    setGameState(newState);
  }, [gameState.betPlaced, gameState.betAmount, gameState.isFreeBet, handleGameEnd]);

  // Game actions
  const handleHit = useCallback(() => {
    if (game.playerHit()) {
      updateGameState(game);
    }
  }, [game, updateGameState]);

  const handleStand = useCallback(() => {
    if (game.playerStand()) {
      updateGameState(game);
    }
  }, [game, updateGameState]);

  const handleDouble = useCallback(() => {
    if (game.playerDouble && game.playerDouble()) {
      updateGameState(game);
    }
  }, [game, updateGameState]);

  const handleSplit = useCallback(() => {
    if (game.playerSplit()) {
      updateGameState(game);
      setGameMessage('✂️ Hand split!');
      setMessageType('info');
    }
  }, [game, updateGameState]);

  const handleInsurance = useCallback(() => {
    const amount = game.takeInsurance();
    if (amount >= 0) {
      updateGameState(game);
      setGameMessage(`📋 Insurance taken: $${amount}`);
      setMessageType('info');
    }
  }, [game, updateGameState]);

  const handleUndo = useCallback(() => {
    if (!game.canUndo()) {
      setGameMessage('❌ Cannot undo');
      setMessageType('error');
      return;
    }
    
    const result = game.undoLastAction();
    
    if (result.success) {
      updateGameState(game);
      setGameMessage(`⏰ ${result.message}`);
      setMessageType('success');
    } else {
      setGameMessage(`❌ ${result.message}`);
      setMessageType('error');
    }
  }, [game, updateGameState]);

  const handleNewGame = useCallback(() => {
    initializeGame();
    setGameMessage('🆕 New game started');
    setMessageType('info');
  }, [initializeGame]);

  const startNewHand = useCallback(() => {
    try {
      game.dealInitialCards();
      const currentGameState = game.getGameState();
      
      setGameState(prevState => ({
        ...prevState,
        playerHand: currentGameState.playerHand || [],
        opponentHands: currentGameState.opponentHands || [],
        currentPlayer: currentGameState.currentPlayer || 'player',
        isGameOver: currentGameState.isGameOver || false,
        handNumber: currentGameState.handNumber || 0,
        winners: []
      }));
      
    } catch (error) {
      setGameMessage('Error dealing cards. Please try again.');
      setMessageType('error');
    }
  }, [game]);

  const handleResetSession = useCallback(() => {
    game.resetSession();
    roundInfo.resetRoundManagement();
    resetStats();
    setScores({
      player: scores.initialPlayer,
      opponents: [...scores.initialOpponents],
      initialPlayer: scores.initialPlayer,
      initialOpponents: [...scores.initialOpponents]
    });
    initializeGame();
    setGameMessage('🔄 Session reset');
    setMessageType('info');
  }, [game, roundInfo, resetStats, scores.initialPlayer, scores.initialOpponents, initializeGame]);

  // Show perk selector
  if (roundInfo.showPerkSelector && isGameSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-800">
        <PerkSelector
          onPerksSelected={handlePerksSelected}
          onSkip={handleSkipPerks}
          playerStats={stats}
          currentMoney={scores.player}
          currentRound={roundInfo.currentPerkRound}
          maxPerks={roundInfo.maxPerks}
          existingPerks={roundInfo.activePerks}
        />
      </div>
    );
  }

  // Loading screen
  if (!isGameSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  // Main game UI
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-800 flex flex-col relative">
      
      {/* Perks info bar */}
      <PerksInfoBar
        activePerks={roundInfo.activePerks}
        gameState={gameState}
        perkInfo={perkInfo}
        game={game}
        roundInfo={roundInfo}
      />
      
      {/* Game messages */}
      {gameMessage && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg text-white font-bold shadow-lg transition-all duration-300 ${
          messageType === 'success' ? 'bg-green-600' :
          messageType === 'error' ? 'bg-red-600' : 'bg-blue-600'
        }`}>
          {gameMessage}
          <button 
            onClick={() => setGameMessage('')}
            className="ml-3 text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      )}
      
      {/* Time Traveler UI */}
      <TimeTravelerUI 
        game={game}
        onUndo={handleUndo}
        gameState={gameState}
      />
      
      {/* Main game area */}
      <div className="flex-1 p-4" style={{ 
        paddingTop: hasActivePerks ? '80px' : '20px'
      }}>
        
        <GameUI
          gameState={gameState}
          gameData={gameData}
          scores={scores}
          winConditionMet={false}
          currentNumOpponents={numOpponents}
          activePerks={roundInfo.activePerks || []}
          perkEffects={combinedPerkEffects}
          onPlaceBet={handlePlaceBet}
          onHit={handleHit}
          onStand={handleStand}
          onDouble={handleDouble}
          onSplit={handleSplit}
          onInsurance={handleInsurance}
          onUndo={handleUndo}
          onNewGame={handleNewGame}
          onGameComplete={onGameComplete}
          game={game}
          stats={stats}
          computedStats={computedStats}
          perkInfo={perkInfo}
          roundInfo={roundInfo}
          playerStats={stats}
          useBailout={useBailout}
          useFreeBet={useFreeBet}
          isLowMoney={isLowMoney}
          hasActivePerks={hasActivePerks}
        />
      </div>
    </div>
  );
};

export default BlackjackGameComponent;