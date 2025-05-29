// hooks/usePerkInfo.js - Enhanced Perk information and utilities hook
import { useState, useCallback, useMemo } from 'react';
import { usePerkEffects } from './perkHooks';

export const usePerkInfo = (activePerks, gameState, game) => {
  const [perkState, setPerkState] = useState({
    usedFreeBets: 0,
    preventedBusts: 0,
    bailoutUsed: false
  });

  const combinedEffects = usePerkEffects(activePerks);

  // Memoized utility functions
  const getMinBet = useCallback(() => {
    const standardMin = combinedEffects.minBet || 5;
    const emergencyMin = combinedEffects.emergencyMinBet || 5;
    return Math.max(standardMin, emergencyMin);
  }, [combinedEffects.minBet, combinedEffects.emergencyMinBet]);

  const getFreeBetInfo = useCallback((currentMoney, playerStats) => {
    if (!combinedEffects.freeBetAfterLosses || !playerStats) {
      return { available: false, amount: 0, lossesTillNext: 0 };
    }

    const hasEnoughLosses = playerStats.consecutiveLosses >= combinedEffects.freeBetAfterLosses;
    const lossesTillNext = Math.max(0, combinedEffects.freeBetAfterLosses - playerStats.consecutiveLosses);
   
    if (hasEnoughLosses) {
      const freeBetAmount = Math.min(50, Math.max(5, Math.floor(currentMoney * 0.1)));
      return { available: true, amount: freeBetAmount, lossesTillNext: 0 };
    }
    return { available: false, amount: 0, lossesTillNext };
  }, [combinedEffects.freeBetAfterLosses]);

  const getBailoutInfo = useCallback((currentMoney, playerStats) => {
    if (!combinedEffects.bailoutAmount || !combinedEffects.bailoutThreshold || !playerStats) {
      return { available: false, amount: 0, description: 'No bailout perk' };
    }

    const needsBailout = currentMoney < combinedEffects.bailoutThreshold;
    const notUsedYet = !playerStats.bailoutUsed;
    
    if (needsBailout && notUsedYet) {
      return { 
        available: true, 
        amount: combinedEffects.bailoutAmount,
        description: `Available when below $${combinedEffects.bailoutThreshold}`
      };
    }
    
    if (playerStats.bailoutUsed) {
      return { available: false, amount: 0, description: 'Already used' };
    }
    
    return { 
      available: false, 
      amount: 0, 
      description: `Available when below $${combinedEffects.bailoutThreshold}` 
    };
  }, [combinedEffects.bailoutAmount, combinedEffects.bailoutThreshold]);

  const getInsuranceInfo = useCallback((dealerHand, betAmount) => {
    if (!dealerHand || dealerHand.length === 0) {
      return { available: false, cost: 0, reason: 'No dealer hand' };
    }
   
    const dealerUpCard = dealerHand[0];
    const shouldOfferInsurance = dealerUpCard?.value === 'A';
   
    if (shouldOfferInsurance) {
      const cost = combinedEffects.freeInsurance ? 0 : Math.floor((betAmount || 0) / 2);
      return { 
        available: true, 
        cost: cost, 
        isFree: combinedEffects.freeInsurance,
        maxPayout: betAmount || 0,
        reason: combinedEffects.freeInsurance ? 'Free insurance perk' : 'Dealer showing Ace'
      };
    }
    return { available: false, cost: 0, reason: 'Dealer not showing Ace' };
  }, [combinedEffects.freeInsurance]);

  const getDealerInfo = useCallback((dealerHand, deck, gameState) => {
    const info = {};
   
    // Only show information during player's turn or when game is over
    const showInfo = !gameState || gameState.currentPlayer === 'player' || gameState.isGameOver;
    
    if (!showInfo) {
      console.log('🕵️ Dealer info hidden - not player turn');
      return info;
    }
   
    if (combinedEffects.revealTenValue && dealerHand?.length >= 2) {
      const holeCard = dealerHand[1];
      info.isTenValue = ['10', 'J', 'Q', 'K'].includes(holeCard?.value);
      info.holeCardValue = holeCard?.value;
      console.log('👁️ Double Vision: Hole card is', info.isTenValue ? '10-value' : 'not 10-value');
    }
   
    if (combinedEffects.showTenCount && Array.isArray(deck)) {
      info.tenCount = deck.filter(card => ['10', 'J', 'Q', 'K'].includes(card?.value)).length;
      info.tenPercent = deck.length > 0 ? ((info.tenCount / deck.length) * 100).toFixed(1) : '0.0';
      info.deckSize = deck.length;
      console.log('🧮 Card Counter: Tens remaining:', info.tenCount);
    }
   
    if (combinedEffects.revealDealerValue && dealerHand?.length >= 2 && game?.calculateHandValue) {
      try {
        info.dealerValue = game.calculateHandValue(dealerHand);
        info.dealerHand = dealerHand;
        console.log('🕵️ Dealer Tell: Dealer value is', info.dealerValue);
      } catch (error) {
        console.warn('Error calculating dealer value:', error);
        info.dealerValueError = true;
      }
    }
   
    return info;
  }, [combinedEffects.revealTenValue, combinedEffects.showTenCount, combinedEffects.revealDealerValue, game]);

  const getBustProbability = useCallback((playerHand, deck, gameState) => {
    // Only show during player's turn when they can still hit
    if (!gameState || gameState.currentPlayer !== 'player') {
      return null;
    }
    
    if (!combinedEffects.showBustProbability || !Array.isArray(deck) || !playerHand || !game?.calculateHandValue) {
      return null;
    }
   
    try {
      const currentValue = game.calculateHandValue(playerHand);
      if (!currentValue || currentValue >= 21) return null;
   
      const bustCards = deck.filter(card => {
        const cardValue = ['J', 'Q', 'K'].includes(card?.value) ? 10 :
                         card?.value === 'A' ? 1 : parseInt(card?.value);
        return !isNaN(cardValue) && currentValue + cardValue > 21;
      });
   
      const probability = deck.length > 0 ? Math.round((bustCards.length / deck.length) * 100) : 0;
      
      console.log('📊 Probability Master: Bust chance is', probability + '%');
      
      return {
        probability,
        bustCards: bustCards.length,
        totalCards: deck.length,
        currentValue,
        safe: probability < 30
      };
    } catch (error) {
      console.warn('Error calculating bust probability:', error);
      return null;
    }
  }, [combinedEffects.showBustProbability, game]);

  const getApplicablePerks = useCallback((situation) => {
    if (!activePerks || activePerks.length === 0) return [];
    
    return activePerks.filter(perk => {
      if (!perk?.triggers) return true; // Always applicable if no triggers specified
      
      return perk.triggers.some(trigger => {
        switch (trigger.type) {
          case 'handValue':
            return situation.handValue >= (trigger.min || 0) && situation.handValue <= (trigger.max || 21);
          case 'dealerUpCard':
            return trigger.values.includes(situation.dealerUpCard);
          case 'money':
            return situation.money <= (trigger.threshold || 0);
          case 'streak':
            return situation.streak >= (trigger.minimum || 0);
          default:
            return true;
        }
      });
    });
  }, [activePerks]);

  // Enhanced betting recommendations
  const getBettingRecommendations = useCallback((currentMoney, playerStats, gameContext = {}) => {
    const recommendations = [];
    
    // Check emergency situations
    if (combinedEffects.emergencyMinBet && combinedEffects.emergencyThreshold) {
      if (currentMoney < combinedEffects.emergencyThreshold) {
        recommendations.push({
          type: 'emergency',
          message: `Emergency betting active - minimum bet reduced to $${combinedEffects.emergencyMinBet}`,
          priority: 'high'
        });
      }
    }
    
    // Check bailout availability
    const bailoutInfo = getBailoutInfo(currentMoney, playerStats);
    if (bailoutInfo.available) {
      recommendations.push({
        type: 'bailout',
        message: `Bailout available: +$${bailoutInfo.amount} when money drops below $${combinedEffects.bailoutThreshold}`,
        priority: 'medium'
      });
    }
    
    // Check free bet availability
    const freeBetInfo = getFreeBetInfo(currentMoney, playerStats);
    if (freeBetInfo.available) {
      recommendations.push({
        type: 'freeBet',
        message: `Free bet available: $${freeBetInfo.amount}`,
        priority: 'high'
      });
    } else if (freeBetInfo.lossesTillNext > 0) {
      recommendations.push({
        type: 'freeBetProgress',
        message: `${freeBetInfo.lossesTillNext} more losses until free bet`,
        priority: 'low'
      });
    }
    
    // Check comeback multiplier
    if (combinedEffects.comebackMultiplier && playerStats.currentLoseStreak >= combinedEffects.comebackTrigger) {
      recommendations.push({
        type: 'comeback',
        message: `Comeback active: ${combinedEffects.comebackMultiplier}x multiplier on wins!`,
        priority: 'high'
      });
    }
    
    // Check low money multiplier
    if (combinedEffects.lowMoneyMultiplier && combinedEffects.lowMoneyThreshold) {
      if (currentMoney < combinedEffects.lowMoneyThreshold) {
        recommendations.push({
          type: 'lowMoney',
          message: `Phoenix Rising active: ${combinedEffects.lowMoneyMultiplier}x multiplier on wins!`,
          priority: 'high'
        });
      }
    }
    
    // Check streak bonuses
    if (combinedEffects.streakBonus && combinedEffects.streakThreshold) {
      if (playerStats.currentWinStreak >= combinedEffects.streakThreshold) {
        const bonusAmount = (playerStats.currentWinStreak - combinedEffects.streakThreshold + 1) * combinedEffects.streakBonus;
        recommendations.push({
          type: 'streak',
          message: `Win streak bonus: +${bonusAmount} (${playerStats.currentWinStreak} wins)`,
          priority: 'medium'
        });
      }
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [combinedEffects, getBailoutInfo, getFreeBetInfo]);

  // Get perk effectiveness analysis
  const getPerkEffectiveness = useCallback((gameHistory = []) => {
    if (!activePerks || activePerks.length === 0) return null;
    
    const analysis = {
      totalPerks: activePerks.length,
      economicImpact: 0,
      strategicValue: 0,
      riskReduction: 0,
      informationAdvantage: 0
    };
    
    activePerks.forEach(perk => {
      const effect = perk.effect || {};
      
      // Economic impact
      if (effect.winBonus) analysis.economicImpact += effect.winBonus;
      if (effect.lossReduction) analysis.economicImpact += effect.lossReduction;
      if (effect.pushBonus) analysis.economicImpact += effect.pushBonus;
      if (effect.startingMoney) analysis.economicImpact += effect.startingMoney;
      
      // Strategic value
      if (effect.blackjackMultiplier > 1.5) analysis.strategicValue += 20;
      if (effect.comebackMultiplier) analysis.strategicValue += 25;
      if (effect.streakBonus) analysis.strategicValue += 15;
      if (effect.doubleWinInterval) analysis.strategicValue += 10;
      
      // Risk reduction
      if (effect.preventBust) analysis.riskReduction += effect.preventBust * 10;
      if (effect.bailoutAmount) analysis.riskReduction += 30;
      if (effect.firstBetInsurance) analysis.riskReduction += 15;
      if (effect.freeInsurance) analysis.riskReduction += 10;
      
      // Information advantage
      if (effect.revealTenValue) analysis.informationAdvantage += 25;
      if (effect.revealDealerValue) analysis.informationAdvantage += 30;
      if (effect.showBustProbability) analysis.informationAdvantage += 20;
      if (effect.showTenCount) analysis.informationAdvantage += 15;
    });
    
    return analysis;
  }, [activePerks]);

  // Memoized combined effects for performance
  const memoizedEffects = useMemo(() => combinedEffects, [combinedEffects]);

  return {
    combinedEffects: memoizedEffects,
    getMinBet,
    getFreeBetInfo,
    getBailoutInfo,
    getInsuranceInfo,
    getDealerInfo,
    getBustProbability,
    getApplicablePerks,
    getBettingRecommendations,
    getPerkEffectiveness,
    perkState,
    setPerkState,
    
    // Utility functions for UI
    hasAnyInformationPerks: () => {
      return !!(memoizedEffects.revealTenValue || memoizedEffects.showTenCount || 
                memoizedEffects.showBustProbability || memoizedEffects.revealDealerValue);
    },
    
    hasAnyEconomicPerks: () => {
      return !!(memoizedEffects.winBonus || memoizedEffects.lossReduction || 
                memoizedEffects.pushBonus || memoizedEffects.blackjackMultiplier > 1.5);
    },
    
    hasAnyRiskPerks: () => {
      return !!(memoizedEffects.preventBust || memoizedEffects.bailoutAmount || 
                memoizedEffects.freeInsurance || memoizedEffects.undoActions);
    },
    
    // Quick status checks
    isEmergencyMode: (currentMoney) => {
      return memoizedEffects.emergencyThreshold && currentMoney < memoizedEffects.emergencyThreshold;
    },
    
    isLowMoneyMode: (currentMoney) => {
      return memoizedEffects.lowMoneyThreshold && currentMoney < memoizedEffects.lowMoneyThreshold;
    },
    
    getComebackStatus: (playerStats) => {
      if (!memoizedEffects.comebackMultiplier || !memoizedEffects.comebackTrigger) return null;
      
      return {
        active: playerStats.currentLoseStreak >= memoizedEffects.comebackTrigger,
        multiplier: memoizedEffects.comebackMultiplier,
        lossesNeeded: Math.max(0, memoizedEffects.comebackTrigger - playerStats.currentLoseStreak)
      };
    }
  };
};