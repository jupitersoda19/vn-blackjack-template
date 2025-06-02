// components/PerksSystem.js - Cleaned with consistent design system
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PERK_DEFINITIONS, PerkUtils } from '../../utils/PerkDefinitions';

// Export the hooks
export { useRoundManagement, usePerkEffects, usePlayerStats } from '../hooks/perkHooks';
export { usePerkInfo } from '../hooks/usePerkInfo';

// Design System Constants
const SPACING = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  xxl: '3rem',      // 48px
};

const COLORS = {
  primary: {
    50: 'rgb(248 250 252)',   // slate-50
    100: 'rgb(241 245 249)',  // slate-100
    200: 'rgb(226 232 240)',  // slate-200
    700: 'rgb(51 65 85)',     // slate-700
    800: 'rgb(30 41 59)',     // slate-800
    900: 'rgb(15 23 42)',     // slate-900
  },
  accent: {
    400: 'rgb(34 197 94)',    // green-500
    500: 'rgb(34 197 94)',    // green-500
    600: 'rgb(22 163 74)',    // green-600
  },
  warning: {
    400: 'rgb(251 191 36)',   // amber-400
    500: 'rgb(245 158 11)',   // amber-500
    600: 'rgb(217 119 6)',    // amber-600
  },
  error: {
    500: 'rgb(239 68 68)',    // red-500
    600: 'rgb(220 38 38)',    // red-600
  },
  info: {
    500: 'rgb(59 130 246)',   // blue-500
    600: 'rgb(37 99 235)',    // blue-600
  }
};

const TEXT_SIZES = {
  xs: 'text-xs',       // 12px
  sm: 'text-sm',       // 14px
  base: 'text-base',   // 16px
  lg: 'text-lg',       // 18px
  xl: 'text-xl',       // 20px
  '2xl': 'text-2xl',   // 24px
  '3xl': 'text-3xl',   // 30px
};

// Cleaned Perk Selector
export const PerkSelector = ({ 
  onPerksSelected, 
  playerStats = {}, 
  currentMoney = 1000,
  currentRound = 1,
  maxPerks = 1,
  onSkip,
  existingPerks = []
}) => {
  const [selectedPerks, setSelectedPerks] = useState([]);
  const [availablePerks, setAvailablePerks] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Generate perks once per round
  useEffect(() => {
    if (!isInitialized) {
      const allPerks = PerkUtils.getAllPerks();
      const existingPerkIds = existingPerks.map(p => p.id);
      const filteredPerks = PerkUtils.filterSituationalPerks(allPerks, playerStats, currentMoney, existingPerkIds);
      const roundSeed = currentRound * 12345 + (playerStats.totalHands || 0) * 67;
      const selectedPerks = PerkUtils.generateWeightedSelection(filteredPerks, Math.min(16, Math.max(12, maxPerks * 4)), roundSeed);
      
      setAvailablePerks(selectedPerks);
      setIsInitialized(true);
    }
  }, [isInitialized, currentRound, existingPerks, currentMoney, playerStats, maxPerks]);

  // Reset when round changes
  useEffect(() => {
    setIsInitialized(false);
    setSelectedPerks([]);
  }, [currentRound]);

  const handlePerkToggle = useCallback((perkId) => {
    setSelectedPerks(prev => {
      if (prev.includes(perkId)) {
        return prev.filter(id => id !== perkId);
      } else if (prev.length < maxPerks) {
        return [...prev, perkId];
      }
      return prev;
    });
  }, [maxPerks]);

  const handleConfirm = useCallback(() => {
    const selectedPerkObjects = selectedPerks.map(id => PerkUtils.getPerkById(id)).filter(Boolean);
    onPerksSelected(selectedPerkObjects);
  }, [selectedPerks, onPerksSelected]);

  const getSelectedPerkObjects = useMemo(() => {
    return selectedPerks.map(id => PerkUtils.getPerkById(id)).filter(Boolean);
  }, [selectedPerks]);

  const sortedPerks = useMemo(() => {
    return [...availablePerks].sort((a, b) => {
      const tierOrder = { legendary: 4, rare: 3, uncommon: 2, common: 1 };
      const aTier = tierOrder[a.tier] || 0;
      const bTier = tierOrder[b.tier] || 0;
      
      if (aTier !== bTier) return bTier - aTier;
      return a.name.localeCompare(b.name);
    });
  }, [availablePerks]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" style={{ padding: SPACING.md }}>
      <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-6xl max-h-[90vh] overflow-y-auto" style={{ padding: SPACING.xl }}>
        
        {/* Header */}
        <div className="text-center" style={{ marginBottom: SPACING.xl }}>
          <h2 className={`${TEXT_SIZES['3xl']} font-bold text-amber-400 mb-3`}>
            Perk Round {currentRound}
          </h2>
          <p className={`${TEXT_SIZES.lg} text-slate-300`}>
            Select up to {maxPerks} perks to add to your collection
          </p>
          <div className={`${TEXT_SIZES.sm} text-slate-400 flex justify-center items-center space-x-4`} style={{ marginTop: SPACING.sm }}>
            <span>Selected: {selectedPerks.length}/{maxPerks}</span>
            <span>•</span>
            <span>New perks last 3 hands</span>
            <span>•</span>
            <span>Money: ${currentMoney}</span>
          </div>
          
          {/* Existing perks */}
          {existingPerks.length > 0 && (
            <div className="bg-slate-700 bg-opacity-60 rounded-lg border border-slate-600" style={{ marginTop: SPACING.lg, padding: SPACING.lg }}>
              <div className={`${TEXT_SIZES.sm} font-semibold text-slate-300 mb-3`}>
                Currently Active Perks ({existingPerks.length}):
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {existingPerks.map((perk, index) => (
                  <div 
                    key={`${perk.id}-${index}`}
                    className={`relative ${TEXT_SIZES.xs} bg-slate-600 text-white rounded-full border border-slate-500`}
                    style={{ padding: `${SPACING.xs} ${SPACING.sm}` }}
                    title={`${perk.description} (${perk.handsRemaining || '?'} hands remaining)`}
                  >
                    {perk.icon} {perk.name}
                    {perk.handsRemaining !== undefined && (
                      <span className={`absolute -top-1 -right-1 rounded-full ${TEXT_SIZES.xs} w-5 h-5 flex items-center justify-center ${
                        perk.handsRemaining <= 1 ? 'bg-red-600' : 'bg-blue-600'
                      } text-white`}>
                        {perk.handsRemaining}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tier Legend */}
        <div className="flex justify-center space-x-6 bg-slate-900 bg-opacity-50 rounded-lg" style={{ marginBottom: SPACING.xl, padding: SPACING.md }}>
          <span className={`${TEXT_SIZES.sm} text-slate-400 flex items-center`}>⚪ Common</span>
          <span className={`${TEXT_SIZES.sm} text-green-400 flex items-center`}>🟢 Uncommon</span>
          <span className={`${TEXT_SIZES.sm} text-blue-400 flex items-center`}>🔵 Rare</span>
          <span className={`${TEXT_SIZES.sm} text-purple-400 flex items-center`}>🟣 Legendary</span>
        </div>

        {/* Selection Preview */}
        {selectedPerks.length > 0 && (
          <div className="bg-amber-900 bg-opacity-40 rounded-lg border border-amber-600" style={{ marginBottom: SPACING.xl, padding: SPACING.lg }}>
            <div className={`${TEXT_SIZES.base} font-semibold text-amber-300 text-center mb-3`}>
              Selected Perks Preview ({selectedPerks.length}/{maxPerks})
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {getSelectedPerkObjects.map(perk => (
                <div key={perk.id} className="bg-amber-800 bg-opacity-50 rounded" style={{ padding: SPACING.sm }}>
                  <div className={`${TEXT_SIZES.sm} font-semibold text-amber-200`}>{perk.icon} {perk.name}</div>
                  <div className={`${TEXT_SIZES.xs} text-amber-100`}>{perk.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Perk Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" style={{ marginBottom: SPACING.xl }}>
          {sortedPerks.map(perk => {
            const isSelected = selectedPerks.includes(perk.id);
            const isDisabled = !isSelected && selectedPerks.length >= maxPerks;
            
            return (
              <div
                key={perk.id}
                onClick={() => !isDisabled && handlePerkToggle(perk.id)}
                className={`
                  relative rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[160px] transform
                  ${isSelected 
                    ? 'border-amber-400 bg-amber-900 bg-opacity-30 scale-105 shadow-lg' 
                    : isDisabled 
                    ? 'border-slate-600 bg-slate-700 opacity-50 cursor-not-allowed'
                    : 'border-slate-500 bg-slate-800 hover:border-slate-400 hover:scale-102'
                  }
                `}
                style={{ padding: SPACING.lg }}
              >
                {/* Tier Badge */}
                <div className={`absolute top-2 right-2 rounded-full ${TEXT_SIZES.xs} font-semibold ${PerkUtils.getTierColor(perk.tier)} shadow-md`} style={{ padding: `${SPACING.xs} ${SPACING.sm}` }}>
                  {PerkUtils.getTierEmoji(perk.tier)}
                </div>

                {/* Perk Icon */}
                <div className={`${TEXT_SIZES['3xl']} text-center mb-3`}>
                  {perk.icon}
                </div>

                {/* Perk Name */}
                <h3 className={`${TEXT_SIZES.sm} font-semibold text-amber-300 text-center leading-tight mb-2`}>
                  {perk.name}
                </h3>

                {/* Perk Description */}
                <p className={`${TEXT_SIZES.xs} text-slate-300 text-center leading-relaxed`}>
                  {perk.description}
                </p>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute inset-0 border-2 border-amber-400 rounded-xl bg-amber-400 bg-opacity-20 flex items-center justify-center backdrop-blur-sm">
                    <div className={`bg-amber-400 text-black font-semibold rounded-full ${TEXT_SIZES.sm} shadow-lg`} style={{ padding: `${SPACING.sm} ${SPACING.md}` }}>
                      ✓ SELECTED
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={onSkip}
            className={`${TEXT_SIZES.base} font-semibold bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg`}
            style={{ padding: `${SPACING.md} ${SPACING.xl}` }}
          >
            Skip This Round
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={selectedPerks.length === 0}
            className={`${TEXT_SIZES.base} font-semibold bg-amber-600 hover:bg-amber-500 disabled:bg-slate-500 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-lg`}
            style={{ padding: `${SPACING.md} ${SPACING.xl}` }}
          >
            {selectedPerks.length > 0 
              ? `Add ${selectedPerks.length} Perk${selectedPerks.length > 1 ? 's' : ''}` 
              : 'No Perks Selected'
            }
          </button>
        </div>

        {/* Info Footer */}
        <div className={`${TEXT_SIZES.sm} text-center text-slate-400 bg-slate-900 bg-opacity-40 rounded-lg`} style={{ marginTop: SPACING.xl, padding: SPACING.md }}>
          <p className="font-medium mb-2">Strategy Tips:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <p className={TEXT_SIZES.xs}>• Perks accumulate - choose complementary effects</p>
            <p className={TEXT_SIZES.xs}>• Higher tier perks have stronger effects</p>
            <p className={TEXT_SIZES.xs}>• Consider your current money and play style</p>
            <p className={TEXT_SIZES.xs}>• Next perk selection in 3 hands</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Cleaned Perks Info Bar
export const PerksInfoBar = ({ activePerks, gameState, perkInfo, game, roundInfo }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const hasValidPerks = activePerks && Array.isArray(activePerks) && activePerks.length > 0;
  const validPerks = hasValidPerks ? activePerks.filter(perk => perk && perk.id && perk.name) : [];
  const shouldShow = hasValidPerks && validPerks.length > 0;
  
  if (!shouldShow) return null;

  const dealerInfo = perkInfo?.getDealerInfo(gameState?.opponentHands?.[0], game?.deck, gameState) || {};
  const bustProbability = perkInfo?.getBustProbability(gameState?.playerHand, game?.deck, gameState);
  const perkDetails = roundInfo?.perkDetails || [];

  const validPerkDetails = perkDetails.filter(perk => perk?.id && perk?.name);
  const expiringPerks = validPerkDetails.filter(p => p.handsRemaining <= 1);

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-slate-800 border-b border-slate-700 shadow-lg">
      <div className="container mx-auto" style={{ padding: `${SPACING.sm} ${SPACING.lg}` }}>
        
        {/* Main Info Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            
            {/* Perk Count */}
            <div className="flex items-center space-x-2">
              <div className={`${TEXT_SIZES.base} font-semibold text-amber-400 flex items-center`}>
                {validPerks.length} Active Perk{validPerks.length > 1 ? 's' : ''}
                {expiringPerks.length > 0 && (
                  <span className={`ml-2 bg-red-600 text-white rounded-full ${TEXT_SIZES.xs} animate-pulse`} style={{ padding: `${SPACING.xs} ${SPACING.sm}` }}>
                    {expiringPerks.length} Expiring!
                  </span>
                )}
              </div>
            </div>
            
            {/* Quick Perk Icons */}
            <div className="flex space-x-1">
              {validPerkDetails.length > 0 ? (
                validPerkDetails.slice(0, 6).map((perk, index) => (
                  <div 
                    key={`${perk.id}-${index}-${perk.handsRemaining || 0}`}
                    className="relative group"
                    title={`${perk.name}: ${perk.description} (${perk.handsRemaining || 0} hands left)`}
                  >
                    <span className={`${TEXT_SIZES.sm} rounded-full border cursor-help ${
                      (perk.handsRemaining || 0) <= 1 
                        ? 'bg-red-700 border-red-500 animate-pulse' 
                        : 'bg-slate-700 border-slate-500'
                    } text-white`} style={{ padding: `${SPACING.xs} ${SPACING.sm}` }}>
                      {perk.icon}
                    </span>
                    <span className={`absolute -top-1 -right-1 bg-blue-600 text-white rounded-full ${TEXT_SIZES.xs} w-4 h-4 flex items-center justify-center`}>
                      {perk.handsRemaining || 0}
                    </span>
                  </div>
                ))
              ) : (
                validPerks.slice(0, 6).map((perk, index) => (
                  <span 
                    key={`${perk.id}-${index}-fallback`}
                    className={`${TEXT_SIZES.sm} bg-slate-700 border border-slate-500 text-white rounded-full cursor-help`}
                    style={{ padding: `${SPACING.xs} ${SPACING.sm}` }}
                    title={perk.description}
                  >
                    {perk.icon}
                  </span>
                ))
              )}
              {validPerks.length > 6 && (
                <span className={`${TEXT_SIZES.sm} text-slate-400`} style={{ padding: `0 ${SPACING.sm}` }}>+{validPerks.length - 6}</span>
              )}
            </div>

            {/* Game Information */}
            <div className={`flex space-x-3 ${TEXT_SIZES.sm} text-white`}>
              {dealerInfo.isTenValue !== undefined && (
                <span className="bg-blue-800 border border-blue-600 rounded" style={{ padding: `${SPACING.xs} ${SPACING.sm}` }}>
                  Hole: {dealerInfo.isTenValue ? '10-Value' : 'Not 10'}
                </span>
              )}
              {dealerInfo.tenCount !== undefined && (
                <span className="bg-cyan-800 border border-cyan-600 rounded" style={{ padding: `${SPACING.xs} ${SPACING.sm}` }}>
                  Tens: {dealerInfo.tenCount}/{dealerInfo.deckSize || '?'}
                </span>
              )}
              {bustProbability && (
                <span className={`border rounded ${
                  bustProbability.safe ? 'bg-green-800 border-green-600' : 'bg-red-800 border-red-600'
                }`} style={{ padding: `${SPACING.xs} ${SPACING.sm}` }}>
                  Bust: {bustProbability.probability}%
                </span>
              )}
              {dealerInfo.dealerValue && (
                <span className="bg-orange-800 border border-orange-600 rounded" style={{ padding: `${SPACING.xs} ${SPACING.sm}` }}>
                  Dealer: {dealerInfo.dealerValue}
                </span>
              )}
            </div>
          </div>

          {/* Round Info & Controls */}
          <div className="flex items-center space-x-4">
            <div className="flex space-x-1">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className={`${TEXT_SIZES.sm} text-slate-400 hover:text-white border border-slate-600 hover:border-slate-400 rounded transition-colors`}
                style={{ padding: `${SPACING.xs} ${SPACING.sm}` }}
                title="Toggle detailed view"
              >
                {showDetails ? '📋' : '📊'}
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`${TEXT_SIZES.sm} text-slate-400 hover:text-white border border-slate-600 hover:border-slate-400 rounded transition-colors`}
                style={{ padding: `${SPACING.xs} ${SPACING.sm}` }}
              >
                {isExpanded ? '▲' : '▼'}
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t border-slate-600" style={{ marginTop: SPACING.lg, paddingTop: SPACING.lg }}>
            {showDetails ? (
              // Detailed view
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {validPerkDetails.length > 0 ? (
                  validPerkDetails.map((perk, index) => (
                    <div 
                      key={`detail-${perk.id}-${index}-${perk.handsRemaining || 0}`}
                      className={`${TEXT_SIZES.sm} relative border rounded-lg ${
                        (perk.handsRemaining || 0) <= 1 
                          ? 'bg-red-900 bg-opacity-60 border-red-500' 
                          : 'bg-slate-700 bg-opacity-60 border-slate-500'
                      }`}
                      style={{ padding: SPACING.md }}
                    >
                      <div className="font-semibold text-amber-300 flex items-center justify-between">
                        <span>{perk.icon} {perk.name}</span>
                        <span className={`${TEXT_SIZES.xs} rounded-full ${
                          (perk.handsRemaining || 0) <= 1 ? 'bg-red-600' : 'bg-blue-600'
                        } text-white`} style={{ padding: `${SPACING.xs} ${SPACING.sm}` }}>
                          {perk.handsRemaining || 0}h
                        </span>
                      </div>
                      <div className="text-slate-300 mt-1">
                        {perk.description}
                      </div>
                      <div className={`${TEXT_SIZES.xs} text-slate-500 flex justify-between`} style={{ marginTop: SPACING.sm }}>
                        <span>Round {perk.addedInRound || '?'}</span>
                        {(perk.handsRemaining || 0) <= 1 && (
                          <span className="text-red-400 font-semibold animate-pulse">EXPIRING!</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  validPerks.map((perk, index) => (
                    <div 
                      key={`basic-${perk.id}-${index}-fallback`}
                      className={`bg-slate-700 bg-opacity-60 border border-slate-500 rounded-lg ${TEXT_SIZES.sm}`}
                      style={{ padding: SPACING.md }}
                    >
                      <div className="font-semibold text-amber-300">
                        {perk.icon} {perk.name}
                      </div>
                      <div className="text-slate-300 mt-1">
                        {perk.description}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              // Summary view
              <div className="flex items-center space-x-4">
                <div className={`${TEXT_SIZES.sm} font-semibold bg-slate-700 text-white rounded-full`} style={{ padding: `${SPACING.sm} ${SPACING.md}` }}>
                  Active Perks
                </div>
                <div className="flex flex-wrap gap-2">
                  {validPerks.map((perk, index) => (
                    <span 
                      key={`${perk.id}-${index}-basic-summary`}
                      className={`${TEXT_SIZES.xs} bg-slate-700 text-white border border-slate-500 rounded cursor-help`}
                      style={{ padding: `${SPACING.xs} ${SPACING.sm}` }}
                      title={perk.description}
                    >
                      {perk.icon} {perk.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Cleaned Betting Controls
export const EnhancedBettingControls = ({ 
  onPlaceBet, 
  maxBet = 1000, 
  disabled = false,
  activePerks = [],
  currentMoney = 1000,
  perkInfo,
  playerStats = {}
}) => {
  const [betAmount, setBetAmount] = useState(25);
  
  const minBet = perkInfo?.getMinBet() || 5;
  const freeBetInfo = perkInfo?.getFreeBetInfo(currentMoney, playerStats) || { available: false, amount: 0 };
  const bailoutInfo = perkInfo?.getBailoutInfo(currentMoney, playerStats) || { available: false, amount: 0 };
  const recommendations = perkInfo?.getBettingRecommendations(currentMoney, playerStats) || [];
  
  // Smart bet suggestions
  const getSmartBets = useCallback(() => {
    const baseBets = [minBet, 25, 50, 100, 200, 500];
    const smartBets = baseBets.filter(bet => bet <= maxBet && bet >= minBet);
    
    const percentageBets = [
      Math.floor(currentMoney * 0.05), // 5%
      Math.floor(currentMoney * 0.1),  // 10%
      Math.floor(currentMoney * 0.2),  // 20%
    ].filter(bet => bet >= minBet && bet <= maxBet && !smartBets.includes(bet));
    
    return [...new Set([...smartBets, ...percentageBets])].sort((a, b) => a - b).slice(0, 6);
  }, [minBet, maxBet, currentMoney]);

  const smartBets = getSmartBets();

  const handlePlaceBet = useCallback(() => {
    if (betAmount >= minBet && betAmount <= maxBet && !disabled) {
      onPlaceBet(betAmount);
    }
  }, [betAmount, minBet, maxBet, disabled, onPlaceBet]);

  const handleFreeBet = useCallback(() => {
    if (freeBetInfo.available) {
      onPlaceBet(freeBetInfo.amount, { isFreeBet: true });
    }
  }, [freeBetInfo, onPlaceBet]);

  // Auto-adjust bet amount
  useEffect(() => {
    if (betAmount < minBet) {
      setBetAmount(minBet);
    }
  }, [minBet, betAmount]);

  return (
    <div className="w-full bg-slate-800 rounded-xl border border-slate-700 shadow-lg" style={{ padding: SPACING.lg }}>
      
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: SPACING.lg }}>
        <h3 className={`${TEXT_SIZES.lg} font-semibold text-amber-400`}>Place Your Bet</h3>
      </div>
      
      {/* High Priority Recommendations */}
      {recommendations.filter(r => r.priority === 'high').length > 0 && (
        <div className="space-y-2" style={{ marginBottom: SPACING.lg }}>
          {recommendations.filter(r => r.priority === 'high').map((rec, index) => (
            <div key={index} className={`${TEXT_SIZES.sm} bg-red-900 border border-red-500 text-red-200 rounded`} style={{ padding: SPACING.sm }}>
              <div className="font-semibold">⚠️ {rec.type.toUpperCase()}</div>
              <div>{rec.message}</div>
            </div>
          ))}
        </div>
      )}

      {/* Free Bet Section */}
      {freeBetInfo.available && (
        <div className="bg-gradient-to-r from-red-900 to-red-800 rounded-lg border border-red-500" style={{ marginBottom: SPACING.lg, padding: SPACING.md }}>
          <div className="text-center">
            <div className={`${TEXT_SIZES.sm} font-semibold text-red-300 flex items-center justify-center`} style={{ marginBottom: SPACING.sm }}>
              Free Bet Available!
            </div>
            <button
              onClick={handleFreeBet}
              disabled={disabled}
              className={`${TEXT_SIZES.base} font-semibold bg-red-600 hover:bg-red-500 disabled:bg-slate-600 text-white rounded-lg transition-colors transform hover:scale-105 disabled:scale-100`}
              style={{ padding: `${SPACING.sm} ${SPACING.lg}` }}
            >
              Use Free ${freeBetInfo.amount} Bet
            </button>
            <div className={`${TEXT_SIZES.xs} text-red-200`} style={{ marginTop: SPACING.xs }}>
              No money risked • Full winnings kept
            </div>
          </div>
        </div>
      )}

      {/* Bailout Info */}
      {bailoutInfo.available && (
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg border border-blue-500" style={{ marginBottom: SPACING.lg, padding: SPACING.md }}>
          <div className={`${TEXT_SIZES.sm} text-center text-blue-300`}>
            <div className="font-semibold">Emergency Bailout Ready</div>
            <div>+${bailoutInfo.amount} {bailoutInfo.description}</div>
          </div>
        </div>
      )}
     
      {/* Smart Bet Buttons */}
      <div className="grid grid-cols-3 gap-2" style={{ marginBottom: SPACING.lg }}>
        {smartBets.map(amount => (
          <button
            key={amount}
            onClick={() => setBetAmount(amount)}
            disabled={amount > maxBet || disabled}
            className={`${TEXT_SIZES.sm} font-semibold text-white rounded-lg transition-all duration-200 ${
              betAmount === amount 
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 shadow-lg scale-105' 
                : 'bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 hover:scale-102'
            } ${
              amount > maxBet || disabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''
            }`}
            style={{ padding: `${SPACING.sm} ${SPACING.sm}` }}
          >
            ${amount}
            {amount === Math.floor(currentMoney * 0.05) && <div className={`${TEXT_SIZES.xs} opacity-75`}>5%</div>}
            {amount === Math.floor(currentMoney * 0.1) && <div className={`${TEXT_SIZES.xs} opacity-75`}>10%</div>}
            {amount === Math.floor(currentMoney * 0.2) && <div className={`${TEXT_SIZES.xs} opacity-75`}>20%</div>}
          </button>
        ))}
      </div>
     
      {/* Custom Bet Amount Controls */}
      <div className="flex items-center" style={{ marginBottom: SPACING.lg }}>
        <button
          className={`${TEXT_SIZES.base} font-semibold bg-red-700 hover:bg-red-600 text-white rounded-l-lg disabled:opacity-50 transition-colors`}
          style={{ padding: `${SPACING.sm} ${SPACING.lg}` }}
          onClick={() => setBetAmount(Math.max(minBet, betAmount - 10))}
          disabled={disabled || betAmount <= minBet}
        >
          -10
        </button>
        
        <button
          className={`${TEXT_SIZES.base} font-semibold bg-red-600 hover:bg-red-500 text-white disabled:opacity-50 transition-colors`}
          style={{ padding: `${SPACING.sm} ${SPACING.md}` }}
          onClick={() => setBetAmount(Math.max(minBet, betAmount - 5))}
          disabled={disabled || betAmount <= minBet}
        >
          -5
        </button>
       
        <div className={`bg-slate-900 text-white text-center border-y-2 border-slate-600 flex-1 font-bold ${TEXT_SIZES.lg}`} style={{ padding: `${SPACING.sm} ${SPACING.lg}` }}>
          ${betAmount}
        </div>
        
        <button
          className={`${TEXT_SIZES.base} font-semibold bg-green-600 hover:bg-green-500 text-white disabled:opacity-50 transition-colors`}
          style={{ padding: `${SPACING.sm} ${SPACING.md}` }}
          onClick={() => setBetAmount(Math.min(maxBet, betAmount + 5))}
          disabled={disabled || betAmount >= maxBet}
        >
          +5
        </button>
       
        <button
          className={`${TEXT_SIZES.base} font-semibold bg-green-700 hover:bg-green-600 text-white rounded-r-lg disabled:opacity-50 transition-colors`}
          style={{ padding: `${SPACING.sm} ${SPACING.lg}` }}
          onClick={() => setBetAmount(Math.min(maxBet, betAmount + 10))}
          disabled={disabled || betAmount >= maxBet}
        >
          +10
        </button>
      </div>
     
      {/* Place Bet Button */}
      <button
        onClick={handlePlaceBet}
        disabled={betAmount < minBet || betAmount > maxBet || disabled}
        className={`w-full ${TEXT_SIZES.lg} font-bold bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-lg disabled:from-slate-600 disabled:to-slate-500 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-lg`}
        style={{ padding: `${SPACING.md} 0` }}
      >
        {disabled ? 'BETTING DISABLED' : `DEAL CARDS - ${betAmount}`}
      </button>
     
      {/* Betting Info */}
      <div className={`text-center ${TEXT_SIZES.xs} space-y-1`} style={{ marginTop: SPACING.md }}>
        <div className="text-green-400">
          Balance: ${maxBet} • Min: ${minBet} • Max: ${maxBet}
        </div>
        {minBet > 5 && (
          <div className="text-amber-400">
            High Roller active - Minimum bet increased
          </div>
        )}
      </div>
    </div>
  );
};