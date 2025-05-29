// hooks/perkHooks.js - Streamlined perk logic hooks
import { useState, useEffect, useCallback, useMemo } from 'react';

// Round management hook
export const useRoundManagement = () => {
  const [gameData, setGameData] = useState({
    totalHandsCompleted: 0,
    perkSelectionState: 'none',
    allActivePerks: [],
    perkRoundsCompleted: 0
  });

  const getCurrentPerkRound = useCallback(() => gameData.perkRoundsCompleted + 1, [gameData.perkRoundsCompleted]);

  const getHandsUntilNextPerkRound = useCallback(() => {
    const nextPerkTrigger = (gameData.perkRoundsCompleted + 1) * 3;
    return Math.max(0, nextPerkTrigger - gameData.totalHandsCompleted);
  }, [gameData.perkRoundsCompleted, gameData.totalHandsCompleted]);

  const shouldShowPerkSelector = useCallback(() => {
    // First round - show immediately at start
    if (gameData.perkRoundsCompleted === 0 && gameData.totalHandsCompleted === 0) {
      return gameData.perkSelectionState !== 'completed';
    }
    
    // Subsequent rounds - show every 3 hands (after hands 3, 6, 9, etc.)
    if (gameData.totalHandsCompleted > 0 && 
        gameData.totalHandsCompleted % 3 === 0 && 
        gameData.perkSelectionState !== 'completed') {
      return true;
    }
    
    return false;
  }, [gameData]);

  const getMaxPerks = useCallback(() => {
    const perkRound = getCurrentPerkRound();
    if (perkRound >= 3) return 3;
    if (perkRound >= 2) return 2;
    return 1;
  }, [getCurrentPerkRound]);

  const completeHand = useCallback(() => {
    setGameData(prev => {
      const newData = { ...prev };
      newData.totalHandsCompleted += 1;
      
      // Clean up expired perks
      newData.allActivePerks = prev.allActivePerks.filter(entry => {
        if (!entry?.perk?.id) return false;
        const handsActive = newData.totalHandsCompleted - entry.addedAtHand;
        return handsActive < 3; // Perks last 3 hands
      });
      
      // Important: Reset perk selection state for new perk rounds
      // Check if we've reached a perk selection point (every 3 hands)
      if (newData.totalHandsCompleted % 3 === 0) {
        newData.perkSelectionState = 'none';
      }
      
      return newData;
    });
  }, []);

  const completePerkSelection = useCallback((selectedPerks) => {
    if (!Array.isArray(selectedPerks)) return;

    setGameData(prev => {
      const newData = { ...prev };
      newData.perkSelectionState = 'completed';
      newData.perkRoundsCompleted += 1;
      
      // Add new perks
      const newPerkEntries = selectedPerks
        .filter(perk => perk?.id && perk?.name)
        .map(perk => ({
          perk: { ...perk },
          addedAtHand: prev.totalHandsCompleted,
          addedInRound: newData.perkRoundsCompleted,
          id: `${perk.id}-${Date.now()}-${Math.random()}`
        }));
      
      newData.allActivePerks = [...prev.allActivePerks, ...newPerkEntries];
      
      return newData;
    });
  }, []);

  // Active perks
  const activePerks = useMemo(() => {
    return gameData.allActivePerks
      .map(entry => entry?.perk)
      .filter(perk => perk?.id && perk?.name);
  }, [gameData.allActivePerks, gameData.totalHandsCompleted]);

  const perkDetails = useMemo(() => {
    return gameData.allActivePerks
      .filter(entry => entry?.perk)
      .map(entry => {
        const handsActive = gameData.totalHandsCompleted - (entry.addedAtHand || 0);
        const handsRemaining = Math.max(0, 3 - handsActive);
        
        return {
          ...entry.perk,
          handsRemaining,
          addedInRound: entry.addedInRound,
          entryId: entry.id,
          addedAtHand: entry.addedAtHand,
          handsActive
        };
      });
  }, [gameData.allActivePerks, gameData.totalHandsCompleted]);

  const resetRoundManagement = useCallback(() => {
    setGameData({
      totalHandsCompleted: 0,
      perkSelectionState: 'none',
      allActivePerks: [],
      perkRoundsCompleted: 0
    });
  }, []);

  return {
    totalHandsPlayed: gameData.totalHandsCompleted,
    currentPerkRound: getCurrentPerkRound(),
    showPerkSelector: shouldShowPerkSelector(),
    maxPerks: getMaxPerks(),
    activePerks,
    perkDetails,
    handsUntilNextPerkRound: getHandsUntilNextPerkRound(),
    arePerksActive: useCallback(() => gameData.allActivePerks.length > 0, [gameData.allActivePerks.length]),
    completeHand,
    completePerkSelection,
    resetRoundManagement
  };
};

// Perk effect calculation hook
export const usePerkEffects = (activePerks) => {
  const combinedEffects = useMemo(() => {
    if (!activePerks || activePerks.length === 0) return {};

    const effects = {};
    
    // Helper functions
    const addNumeric = (key, value) => {
      if (typeof value === 'number' && !isNaN(value)) {
        effects[key] = (effects[key] || 0) + value;
      }
    };

    const maxNumeric = (key, value, defaultVal) => {
      if (typeof value === 'number' && !isNaN(value)) {
        effects[key] = Math.max(effects[key] || defaultVal, value);
      }
    };

    const minNumeric = (key, value, defaultVal) => {
      if (typeof value === 'number' && !isNaN(value)) {
        effects[key] = Math.min(effects[key] || defaultVal, value);
      }
    };
    
    activePerks.forEach(perk => {
      if (!perk?.effect) return;
      
      const perkEffect = perk.effect;
      
      // Additive effects
      addNumeric('winBonus', perkEffect.winBonus);
      addNumeric('lossReduction', perkEffect.lossReduction);
      addNumeric('luckyBonus', perkEffect.luckyBonus);
      addNumeric('pushBonus', perkEffect.pushBonus);
      addNumeric('startingMoney', perkEffect.startingMoney);
      addNumeric('aceBonus', perkEffect.aceBonus);
      addNumeric('splitBonus', perkEffect.splitBonus);
      addNumeric('preventBust', perkEffect.preventBust);
      addNumeric('undoActions', perkEffect.undoActions);
      addNumeric('faceCardBonus', perkEffect.faceCardBonus);

      // Face card count
      if (perkEffect.faceCardCount) effects.faceCardCount = perkEffect.faceCardCount;

      // Streak effects
      if (typeof perkEffect.streakBonus === 'number') {
        effects.streakBonus = perkEffect.streakBonus;
        effects.streakThreshold = perkEffect.streakThreshold;
      }

      // Bailout
      if (typeof perkEffect.bailoutAmount === 'number') {
        effects.bailoutAmount = perkEffect.bailoutAmount;
        effects.bailoutThreshold = perkEffect.bailoutThreshold;
      }
      
      // Lucky numbers
      if (Array.isArray(perkEffect.luckyNumbers) && perkEffect.luckyNumbers.length > 0) {
        effects.luckyNumbers = effects.luckyNumbers || [];
        effects.luckyNumbers.push(...perkEffect.luckyNumbers);
        effects.luckyNumbers = [...new Set(effects.luckyNumbers)].sort((a, b) => a - b);
      }
      
      // Maximum value effects
      maxNumeric('blackjackMultiplier', perkEffect.blackjackMultiplier, 1.5);
      maxNumeric('minBet', perkEffect.minBet, 5);
      maxNumeric('firstBetInsurance', perkEffect.firstBetInsurance, 0);
      
      if (typeof perkEffect.lowMoneyMultiplier === 'number') {
        maxNumeric('lowMoneyMultiplier', perkEffect.lowMoneyMultiplier, 1);
        if (perkEffect.lowMoneyThreshold) effects.lowMoneyThreshold = perkEffect.lowMoneyThreshold;
      }
      
      // Minimum value effects
      minNumeric('doubleWinInterval', perkEffect.doubleWinInterval, 999);
      minNumeric('goldenHandInterval', perkEffect.goldenHandInterval, 999);
      
      // Comeback effects
      if (typeof perkEffect.comebackMultiplier === 'number') {
        effects.comebackMultiplier = perkEffect.comebackMultiplier;
        effects.comebackTrigger = perkEffect.comebackTrigger;
        effects.comebackWins = perkEffect.comebackWins;
      }

      // Emergency effects
      if (typeof perkEffect.emergencyMinBet === 'number') {
        effects.emergencyMinBet = perkEffect.emergencyMinBet;
        effects.emergencyThreshold = perkEffect.emergencyThreshold;
      }

      // Free bet effect
      if (typeof perkEffect.freeBetAfterLosses === 'number') {
        effects.freeBetAfterLosses = perkEffect.freeBetAfterLosses;
      }
      
      // Boolean effects
      const booleanEffects = [
        'revealTenValue', 'showTenCount', 'showBustProbability', 'revealDealerValue',
        'freeInsurance', 'dealerHitSoft17', 'dealerHitHard16'
      ];
      
      booleanEffects.forEach(key => {
        if (perkEffect[key]) {
          effects[key] = true;
        }
      });
    });

    return effects;
  }, [activePerks]);

  return combinedEffects;
};

// Player stats hook
export const usePlayerStats = () => {
  const [stats, setStats] = useState({
    totalHands: 0,
    totalWins: 0,
    totalLosses: 0,
    totalPushes: 0,
    currentWinStreak: 0,
    currentLoseStreak: 0,
    maxWinStreak: 0,
    maxLoseStreak: 0,
    totalMoneyWon: 0,
    totalMoneyLost: 0,
    blackjacksHit: 0,
    bailoutUsed: false,
    consecutiveLosses: 0,
    freeBetsUsed: 0,
    handsWithPerks: 0,
    avgBetAmount: 0,
    totalBetAmount: 0
  });

  const updateStats = useCallback((gameResult, betAmount, isBlackjack = false, hasPerks = false) => {
    setStats(prev => {
      const newStats = { ...prev };
      newStats.totalHands += 1;
      newStats.totalBetAmount += betAmount;
      newStats.avgBetAmount = newStats.totalBetAmount / newStats.totalHands;
      
      if (hasPerks) newStats.handsWithPerks += 1;
      
      if (gameResult === 'win') {
        newStats.totalWins += 1;
        newStats.currentWinStreak += 1;
        newStats.currentLoseStreak = 0;
        newStats.consecutiveLosses = 0;
        newStats.maxWinStreak = Math.max(newStats.maxWinStreak, newStats.currentWinStreak);
        newStats.totalMoneyWon += betAmount;
        if (isBlackjack) newStats.blackjacksHit += 1;
      } else if (gameResult === 'loss') {
        newStats.totalLosses += 1;
        newStats.currentWinStreak = 0;
        newStats.currentLoseStreak += 1;
        newStats.consecutiveLosses += 1;
        newStats.maxLoseStreak = Math.max(newStats.maxLoseStreak, newStats.currentLoseStreak);
        newStats.totalMoneyLost += betAmount;
      } else if (gameResult === 'push') {
        newStats.totalPushes += 1;
        newStats.consecutiveLosses = 0;
      }
      
      return newStats;
    });
  }, []);

  const useBailout = useCallback(() => {
    setStats(prev => ({ ...prev, bailoutUsed: true }));
  }, []);

  const useFreeBet = useCallback(() => {
    setStats(prev => ({ 
      ...prev, 
      freeBetsUsed: prev.freeBetsUsed + 1,
      consecutiveLosses: 0
    }));
  }, []);

  const resetStats = useCallback(() => {
    setStats({
      totalHands: 0,
      totalWins: 0,
      totalLosses: 0,
      totalPushes: 0,
      currentWinStreak: 0,
      currentLoseStreak: 0,
      maxWinStreak: 0,
      maxLoseStreak: 0,
      totalMoneyWon: 0,
      totalMoneyLost: 0,
      blackjacksHit: 0,
      bailoutUsed: false,
      consecutiveLosses: 0,
      freeBetsUsed: 0,
      handsWithPerks: 0,
      avgBetAmount: 0,
      totalBetAmount: 0
    });
  }, []);

  // Computed stats
  const computedStats = useMemo(() => ({
    winRate: stats.totalHands > 0 ? (stats.totalWins / stats.totalHands * 100).toFixed(1) : '0.0',
    netMoney: stats.totalMoneyWon - stats.totalMoneyLost,
    perkEfficiency: stats.totalHands > 0 ? (stats.handsWithPerks / stats.totalHands * 100).toFixed(1) : '0.0'
  }), [stats]);

  return { 
    stats, 
    computedStats,
    updateStats, 
    useBailout, 
    useFreeBet, 
    resetStats 
  };
};