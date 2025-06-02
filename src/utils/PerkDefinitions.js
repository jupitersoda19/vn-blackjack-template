// data/PerkDefinitions.js - All perk definitions and data
export const PERK_DEFINITIONS = {
  // === ECONOMIC PERKS ===
  LUCKY_START: {
    id: 'LUCKY_START',
    name: 'Lucky Start',
    description: 'Start with +$100 bonus money',
    icon: '🍀',
    tier: 'common',
    rarity: 0.8,
    effect: { startingMoney: 100 }
  },

  MONEY_MAGNET: {
    id: 'MONEY_MAGNET',
    name: 'Money Magnet',
    description: 'All wins give +$5 bonus',
    icon: '🧲',
    tier: 'common',
    rarity: 0.7,
    effect: { winBonus: 5 }
  },

  PENNY_PINCHER: {
    id: 'PENNY_PINCHER',
    name: 'Penny Pincher',
    description: 'Reduce all losses by $5 (minimum $1)',
    icon: '🪙',
    tier: 'common',
    rarity: 0.6,
    effect: { lossReduction: 5 }
  },

  HIGH_ROLLER: {
    id: 'HIGH_ROLLER',
    name: 'High Roller',
    description: 'Start with +$300, but minimum bet is $50',
    icon: '💎',
    tier: 'rare',
    rarity: 0.3,
    effect: { startingMoney: 300, minBet: 50 }
  },

  DEBT_FORGIVENESS: {
    id: 'DEBT_FORGIVENESS',
    name: 'Debt Forgiveness',
    description: 'If you go below $50, get $100 bailout (once per game)',
    icon: '🏦',
    tier: 'rare',
    rarity: 0.3,
    effect: { bailoutAmount: 100, bailoutThreshold: 50 }
  },

  // === PAYOUT PERKS ===
  BLACKJACK_BOOST: {
    id: 'BLACKJACK_BOOST',
    name: 'Blackjack Boost',
    description: 'Blackjacks pay 2.5x instead of 1.5x',
    icon: '⚡',
    tier: 'uncommon',
    rarity: 0.5,
    effect: { blackjackMultiplier: 2.5 }
  },

  DOUBLE_TROUBLE: {
    id: 'DOUBLE_TROUBLE',
    name: 'Double Trouble',
    description: 'Every 4th win pays double',
    icon: '🎯',
    tier: 'uncommon',
    rarity: 0.4,
    effect: { doubleWinInterval: 4 }
  },

  LUCKY_SEVENS: {
    id: 'LUCKY_SEVENS',
    name: 'Lucky Sevens',
    description: 'Hands totaling 7, 17, or 21 pay +$25',
    icon: '7️⃣',
    tier: 'uncommon',
    rarity: 0.4,
    effect: { luckyNumbers: [7, 17, 21], luckyBonus: 25 }
  },

  STREAK_MASTER: {
    id: 'STREAK_MASTER',
    name: 'Streak Master',
    description: 'Win streaks of 3+ give +$10 per extra win',
    icon: '🔥',
    tier: 'rare',
    rarity: 0.3,
    effect: { streakBonus: 10, streakThreshold: 3 }
  },

  // === PROTECTION PERKS ===
  SAFE_BET: {
    id: 'SAFE_BET',
    name: 'Safe Bet',
    description: 'First bet of each round is insured (50% back if lost)',
    icon: '🛡️',
    tier: 'common',
    rarity: 0.6,
    effect: { firstBetInsurance: 0.5 }
  },

  PUSH_PROTECTOR: {
    id: 'PUSH_PROTECTOR',
    name: 'Push Protector',
    description: 'Ties give you $10 instead of returning bet',
    icon: '🤝',
    tier: 'common',
    rarity: 0.6,
    effect: { pushBonus: 10 }
  },

  GUARDIAN_ANGEL: {
    id: 'GUARDIAN_ANGEL',
    name: 'Guardian Angel',
    description: 'Prevent one bust per round (converts to 21)',
    icon: '👼',
    tier: 'rare',
    rarity: 0.2,
    effect: { preventBust: 1 }
  },

  SECOND_CHANCE: {
    id: 'SECOND_CHANCE',
    name: 'Second Chance',
    description: 'If you lose 3 hands in a row, next bet is free',
    icon: '🎲',
    tier: 'uncommon',
    rarity: 0.4,
    effect: { freeBetAfterLosses: 3 }
  },

  // === INFORMATION PERKS ===
  DOUBLE_VISION: {
    id: 'DOUBLE_VISION',
    name: 'Double Vision',
    description: 'See if dealer\'s hole card is 10-value',
    icon: '👁️',
    tier: 'common',
    rarity: 0.5,
    effect: { revealTenValue: true }
  },

  CARD_COUNTER: {
    id: 'CARD_COUNTER',
    name: 'Card Counter',
    description: 'See how many 10-value cards are left',
    icon: '🧮',
    tier: 'uncommon',
    rarity: 0.4,
    effect: { showTenCount: true }
  },

  PROBABILITY_MASTER: {
    id: 'PROBABILITY_MASTER',
    name: 'Probability Master',
    description: 'See your bust probability before hitting',
    icon: '📊',
    tier: 'uncommon',
    rarity: 0.4,
    effect: { showBustProbability: true }
  },

  DEALER_TELL: {
    id: 'DEALER_TELL',
    name: 'Dealer Tell',
    description: 'See dealer\'s exact hand value (hidden cards)',
    icon: '🕵️',
    tier: 'rare',
    rarity: 0.2,
    effect: { revealDealerValue: true }
  },

  // === COMEBACK PERKS ===
  PHOENIX_RISING: {
    id: 'PHOENIX_RISING',
    name: 'Phoenix Rising',
    description: 'When below $200, wins pay double',
    icon: '🔥',
    tier: 'rare',
    rarity: 0.3,
    effect: { lowMoneyMultiplier: 2, lowMoneyThreshold: 200 }
  },

  UNDERDOG: {
    id: 'UNDERDOG',
    name: 'Underdog',
    description: 'When losing streak hits 3, next 2 wins pay triple',
    icon: '💪',
    tier: 'rare',
    rarity: 0.2,
    effect: { comebackMultiplier: 3, comebackTrigger: 3, comebackWins: 2 }
  },

  LAST_STAND: {
    id: 'LAST_STAND',
    name: 'Last Stand',
    description: 'When below $100, minimum bet becomes $5',
    icon: '⚔️',
    tier: 'uncommon',
    rarity: 0.4,
    effect: { emergencyMinBet: 5, emergencyThreshold: 100 }
  },

  // === SPECIAL PERKS ===
  INSURANCE_FREE: {
    id: 'INSURANCE_FREE',
    name: 'Free Insurance',
    description: 'Insurance bets are free when dealer shows Ace',
    icon: '📋',
    tier: 'uncommon',
    rarity: 0.4,
    effect: { freeInsurance: true }
  },

  SPLIT_MASTER: {
    id: 'SPLIT_MASTER',
    name: 'Split Master',
    description: 'Splitting pairs gives +$15 bonus regardless of outcome',
    icon: '✂️',
    tier: 'uncommon',
    rarity: 0.4,
    effect: { splitBonus: 15 }
  },

  ACE_AFFINITY: {
    id: 'ACE_AFFINITY',
    name: 'Ace Affinity',
    description: 'Hands with Aces (not blackjack) give +$10',
    icon: '🅰️',
    tier: 'common',
    rarity: 0.5,
    effect: { aceBonus: 10 }
  },

  FACE_CARD_FRIEND: {
    id: 'FACE_CARD_FRIEND',
    name: 'Face Card Friend',
    description: 'Hands with 2+ face cards give +$8',
    icon: '👑',
    tier: 'common',
    rarity: 0.5,
    effect: { faceCardBonus: 8, faceCardCount: 2 }
  },

  // === LEGENDARY PERKS ===
  MIDAS_TOUCH: {
    id: 'MIDAS_TOUCH',
    name: 'Midas Touch',
    description: 'Every 5th hand, all cards become face cards',
    icon: '👑',
    tier: 'legendary',
    rarity: 0.1,
    effect: { goldenHandInterval: 5 }
  },

  TIME_TRAVELER: {
    id: 'TIME_TRAVELER',
    name: 'Time Traveler',
    description: 'Once per round, undo your last action',
    icon: '⏰',
    tier: 'legendary',
    rarity: 0.1,
    effect: { undoActions: 1 }
  },

  DEALERS_NIGHTMARE: {
    id: 'DEALERS_NIGHTMARE',
    name: 'Dealer\'s Nightmare',
    description: 'Dealer must hit on soft 17 and hard 16',
    icon: '😈',
    tier: 'legendary',
    rarity: 0.1,
    effect: { dealerHitSoft17: true, dealerHitHard16: true }
  }
};

// Helper functions for perk management
export const PerkUtils = {
  // Get all perks as array
  getAllPerks: () => Object.values(PERK_DEFINITIONS),
  
  // Get perk by ID
  getPerkById: (id) => PERK_DEFINITIONS[id],
  
  // Get perks by tier
  getPerksByTier: (tier) => Object.values(PERK_DEFINITIONS).filter(perk => perk.tier === tier),
  
  // Get tier colors for UI
  getTierColor: (tier) => {
    switch (tier) {
      case 'common': return 'from-gray-500 to-gray-600';
      case 'uncommon': return 'from-green-500 to-green-600';
      case 'rare': return 'from-blue-500 to-blue-600';
      case 'legendary': return 'from-purple-500 to-yellow-500';
      default: return 'from-gray-500 to-gray-600';
    }
  },
  
  // Get tier emoji for UI
  getTierEmoji: (tier) => {
    switch (tier) {
      case 'common': return '⚪';
      case 'uncommon': return '🟢';
      case 'rare': return '🔵';
      case 'legendary': return '🟣';
      default: return '⚪';
    }
  },
  
  // Filter perks based on player situation
  filterSituationalPerks: (allPerks, playerStats, currentMoney, existingPerkIds = []) => {
    return allPerks.filter(perk => {
      // Don't show duplicates
      if (existingPerkIds.includes(perk.id)) return false;
      
      // Situational filtering
      if (perk.effect.lowMoneyMultiplier && currentMoney > 500) return false;
      if (perk.effect.comebackMultiplier && (playerStats.currentLoseStreak || 0) < 2) return false;
      if (perk.effect.minBet > 25 && currentMoney < 500) return false;
      
      return true;
    });
  },
  
  // Generate weighted random selection
  generateWeightedSelection: (perks, maxCount = 12, seed = null) => {
    // Create weighted array
    const weightedSelection = [];
    perks.forEach(perk => {
      const count = Math.ceil(perk.rarity * 10);
      for (let i = 0; i < count; i++) {
        weightedSelection.push(perk);
      }
    });

    // Shuffle (deterministic if seed provided)
    let shuffled = [...weightedSelection];
    if (seed !== null) {
      // Deterministic shuffle using seed
      let randomIndex = seed;
      for (let i = shuffled.length - 1; i > 0; i--) {
        randomIndex = (randomIndex * 1103515245 + 12345) & 0x7fffffff;
        const j = randomIndex % (i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
    } else {
      // Random shuffle
      shuffled = shuffled.sort(() => 0.5 - Math.random());
    }
    
    // Remove duplicates and limit count
    const unique = shuffled.filter((perk, index, arr) => 
      arr.findIndex(p => p.id === perk.id) === index
    );

    return unique.slice(0, Math.min(maxCount, unique.length));
  }
};