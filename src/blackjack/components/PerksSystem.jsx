// components/PerksSystem.js - Streamlined perk system components
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PERK_DEFINITIONS, PerkUtils } from '../../data/PerkDefinitions';

// Export the hooks
export { useRoundManagement, usePerkEffects, usePlayerStats } from '../hooks/perkHooks';
export { usePerkInfo } from '../hooks/usePerkInfo';

// Streamlined Perk Selector
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
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-green-900 to-green-800 rounded-xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-yellow-500">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold text-yellow-300 mb-2 animate-pulse">
            🎰 Perk Round {currentRound} 🎰
          </h2>
          <p className="text-green-300 text-lg">Select up to {maxPerks} perks to ADD to your collection</p>
          <div className="text-sm text-gray-300 mt-2 flex justify-center items-center space-x-4">
            <span>Selected: {selectedPerks.length}/{maxPerks}</span>
            <span>•</span>
            <span>New perks last 3 hands</span>
            <span>•</span>
            <span>Money: ${currentMoney}</span>
          </div>
          
          {/* Existing perks */}
          {existingPerks.length > 0 && (
            <div className="mt-4 p-4 bg-purple-900 bg-opacity-60 rounded-lg border border-purple-500">
              <div className="text-sm font-bold text-purple-300 mb-3">
                📋 Currently Active Perks ({existingPerks.length}):
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {existingPerks.map((perk, index) => (
                  <div 
                    key={`${perk.id}-${index}`}
                    className="relative text-xs bg-purple-700 text-white px-3 py-2 rounded-full border border-purple-400"
                    title={`${perk.description} (${perk.handsRemaining || '?'} hands remaining)`}
                  >
                    {perk.icon} {perk.name}
                    {perk.handsRemaining !== undefined && (
                      <span className={`absolute -top-1 -right-1 rounded-full text-xs w-5 h-5 flex items-center justify-center ${
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
        <div className="flex justify-center mb-6 space-x-6 text-sm bg-black bg-opacity-40 p-3 rounded-lg">
          <span className="text-gray-400 flex items-center">⚪ <span className="ml-1">Common</span></span>
          <span className="text-green-400 flex items-center">🟢 <span className="ml-1">Uncommon</span></span>
          <span className="text-blue-400 flex items-center">🔵 <span className="ml-1">Rare</span></span>
          <span className="text-purple-400 flex items-center">🟣 <span className="ml-1">Legendary</span></span>
        </div>

        {/* Selection Preview */}
        {selectedPerks.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-900 bg-opacity-50 rounded-lg border border-yellow-500">
            <div className="text-yellow-300 font-bold mb-2 text-center">
              ✨ Selected Perks Preview ({selectedPerks.length}/{maxPerks})
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {getSelectedPerkObjects.map(perk => (
                <div key={perk.id} className="bg-yellow-800 bg-opacity-60 p-2 rounded text-xs">
                  <div className="font-bold text-yellow-200">{perk.icon} {perk.name}</div>
                  <div className="text-yellow-100 text-xs">{perk.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Perk Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-6">
          {sortedPerks.map(perk => {
            const isSelected = selectedPerks.includes(perk.id);
            const isDisabled = !isSelected && selectedPerks.length >= maxPerks;
            
            return (
              <div
                key={perk.id}
                onClick={() => !isDisabled && handlePerkToggle(perk.id)}
                className={`
                  relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[160px] transform
                  ${isSelected 
                    ? 'border-yellow-400 bg-gradient-to-b from-yellow-900 to-yellow-800 scale-105 shadow-lg shadow-yellow-500/30' 
                    : isDisabled 
                    ? 'border-gray-600 bg-gray-800 opacity-50 cursor-not-allowed'
                    : 'border-gray-400 bg-gradient-to-b from-black to-gray-900 hover:border-green-400 hover:scale-102'
                  }
                `}
              >
                {/* Tier Badge */}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${PerkUtils.getTierColor(perk.tier)} shadow-lg`}>
                  {PerkUtils.getTierEmoji(perk.tier)}
                </div>

                {/* Perk Icon */}
                <div className="text-4xl mb-3 text-center">
                  {perk.icon}
                </div>

                {/* Perk Name */}
                <h3 className="text-sm font-bold text-yellow-300 mb-2 text-center leading-tight">
                  {perk.name}
                </h3>

                {/* Perk Description */}
                <p className="text-xs text-green-300 text-center leading-relaxed">
                  {perk.description}
                </p>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute inset-0 border-2 border-yellow-400 rounded-xl bg-yellow-400 bg-opacity-20 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-yellow-400 text-black font-bold px-3 py-2 rounded-full text-sm shadow-lg animate-pulse">
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
            className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Skip This Round
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={selectedPerks.length === 0}
            className="px-8 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 disabled:from-gray-500 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-lg"
          >
            {selectedPerks.length > 0 
              ? `Add ${selectedPerks.length} Perk${selectedPerks.length > 1 ? 's' : ''}` 
              : 'No Perks Selected'
            }
          </button>
        </div>

        {/* Info Footer */}
        <div className="mt-6 text-center text-sm text-gray-300 bg-black bg-opacity-40 p-3 rounded-lg">
          <p className="mb-1">💡 <strong>Strategy Tips:</strong></p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <p>• Perks accumulate - choose complementary effects</p>
            <p>• Higher tier perks have stronger effects</p>
            <p>• Consider your current money and play style</p>
            <p>• Next perk selection in 3 hands</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Streamlined Perks Info Bar
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
    <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 border-b-2 border-purple-400 shadow-lg">
      <div className="container mx-auto px-4 py-3">
        
        {/* Main Info Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            
            {/* Perk Count */}
            <div className="flex items-center space-x-2">
              <div className="text-yellow-300 font-bold text-lg flex items-center">
                🎯 {validPerks.length} Active Perk{validPerks.length > 1 ? 's' : ''}
                {expiringPerks.length > 0 && (
                  <span className="ml-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs animate-pulse">
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
                    <span className={`text-sm px-2 py-1 rounded-full border ${
                      (perk.handsRemaining || 0) <= 1 
                        ? 'bg-red-700 border-red-500 animate-pulse' 
                        : 'bg-purple-700 border-purple-500'
                    } text-white cursor-help`}>
                      {perk.icon}
                    </span>
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                      {perk.handsRemaining || 0}
                    </span>
                  </div>
                ))
              ) : (
                validPerks.slice(0, 6).map((perk, index) => (
                  <span 
                    key={`${perk.id}-${index}-fallback`}
                    className="text-sm bg-purple-700 border border-purple-500 text-white px-2 py-1 rounded-full cursor-help"
                    title={perk.description}
                  >
                    {perk.icon}
                  </span>
                ))
              )}
              {validPerks.length > 6 && (
                <span className="text-sm text-purple-300 px-2">+{validPerks.length - 6}</span>
              )}
            </div>

            {/* Game Information */}
            <div className="flex space-x-3 text-sm text-white">
              {dealerInfo.isTenValue !== undefined && (
                <span className="bg-blue-800 px-2 py-1 rounded border border-blue-600">
                  👁️ Hole: {dealerInfo.isTenValue ? '10-Value' : 'Not 10'}
                </span>
              )}
              {dealerInfo.tenCount !== undefined && (
                <span className="bg-cyan-800 px-2 py-1 rounded border border-cyan-600">
                  🧮 Tens: {dealerInfo.tenCount}/{dealerInfo.deckSize || '?'}
                </span>
              )}
              {bustProbability && (
                <span className={`px-2 py-1 rounded border ${
                  bustProbability.safe ? 'bg-green-800 border-green-600' : 'bg-red-800 border-red-600'
                }`}>
                  📊 Bust: {bustProbability.probability}%
                </span>
              )}
              {dealerInfo.dealerValue && (
                <span className="bg-orange-800 px-2 py-1 rounded border border-orange-600">
                  🎯 Dealer: {dealerInfo.dealerValue}
                </span>
              )}
            </div>
          </div>

          {/* Round Info & Controls */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-purple-200">
              <div>Round {roundInfo?.currentPerkRound || '?'}</div>
              <div className="text-xs">{roundInfo?.handsUntilNextPerkRound || '?'} until next</div>
            </div>
            
            <div className="flex space-x-1">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-purple-300 hover:text-white text-sm px-2 py-1 rounded border border-purple-600 hover:border-purple-400 transition-colors"
                title="Toggle detailed view"
              >
                {showDetails ? '📋' : '📊'}
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-purple-300 hover:text-white text-sm px-2 py-1 rounded border border-purple-600 hover:border-purple-400 transition-colors"
              >
                {isExpanded ? '▲' : '▼'}
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-purple-600">
            {showDetails ? (
              // Detailed view
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {validPerkDetails.length > 0 ? (
                  validPerkDetails.map((perk, index) => (
                    <div 
                      key={`detail-${perk.id}-${index}-${perk.handsRemaining || 0}`}
                      className={`p-3 rounded-lg text-sm relative border ${
                        (perk.handsRemaining || 0) <= 1 
                          ? 'bg-red-900 bg-opacity-60 border-red-500' 
                          : 'bg-purple-800 bg-opacity-60 border-purple-500'
                      }`}
                    >
                      <div className="font-bold text-yellow-300 flex items-center justify-between">
                        <span>{perk.icon} {perk.name}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          (perk.handsRemaining || 0) <= 1 ? 'bg-red-600' : 'bg-blue-600'
                        } text-white`}>
                          {perk.handsRemaining || 0}h
                        </span>
                      </div>
                      <div className="text-purple-200 mt-1">
                        {perk.description}
                      </div>
                      <div className="text-xs text-gray-400 mt-2 flex justify-between">
                        <span>Round {perk.addedInRound || '?'}</span>
                        {(perk.handsRemaining || 0) <= 1 && (
                          <span className="text-red-400 font-bold animate-pulse">EXPIRING!</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  validPerks.map((perk, index) => (
                    <div 
                      key={`basic-${perk.id}-${index}-fallback`}
                      className="bg-purple-800 bg-opacity-60 p-3 rounded-lg text-sm border border-purple-500"
                    >
                      <div className="font-bold text-yellow-300">
                        {perk.icon} {perk.name}
                      </div>
                      <div className="text-purple-200 mt-1">
                        {perk.description}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              // Summary view
              <div className="flex items-center space-x-4">
                <div className="text-sm font-bold px-3 py-1 rounded-full bg-purple-600 text-white">
                  Active Perks
                </div>
                <div className="flex flex-wrap gap-2">
                  {validPerks.map((perk, index) => (
                    <span 
                      key={`${perk.id}-${index}-basic-summary`}
                      className="text-xs bg-purple-700 text-white px-2 py-1 rounded border border-purple-400"
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

// Streamlined Betting Controls
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
  const [showAdvanced, setShowAdvanced] = useState(false);
  
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
    <div className="w-full bg-gradient-to-b from-gray-900 to-black rounded-xl p-4 border border-gray-700 shadow-lg">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-yellow-300 font-bold text-lg">💰 PLACE YOUR BET</h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          {showAdvanced ? '▼ Simple' : '▲ Advanced'}
        </button>
      </div>
      
      {/* High Priority Recommendations */}
      {recommendations.filter(r => r.priority === 'high').length > 0 && (
        <div className="mb-4 space-y-2">
          {recommendations.filter(r => r.priority === 'high').map((rec, index) => (
            <div key={index} className="p-2 rounded border text-sm bg-red-900 border-red-500 text-red-200">
              <div className="font-bold">⚠️ {rec.type.toUpperCase()}</div>
              <div>{rec.message}</div>
            </div>
          ))}
        </div>
      )}

      {/* Free Bet Section */}
      {freeBetInfo.available && (
        <div className="mb-4 p-3 bg-gradient-to-r from-red-900 to-red-800 rounded-lg border border-red-500">
          <div className="text-center">
            <div className="text-red-300 text-sm font-bold mb-2 flex items-center justify-center">
              🎯 FREE BET AVAILABLE! 🎯
            </div>
            <button
              onClick={handleFreeBet}
              disabled={disabled}
              className="bg-red-600 hover:bg-red-500 disabled:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors transform hover:scale-105 disabled:scale-100"
            >
              Use Free ${freeBetInfo.amount} Bet
            </button>
            <div className="text-xs text-red-200 mt-1">
              No money risked • Full winnings kept
            </div>
          </div>
        </div>
      )}

      {/* Bailout Info */}
      {bailoutInfo.available && (
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg border border-blue-500">
          <div className="text-center text-blue-300 text-sm">
            <div className="font-bold">💸 Emergency Bailout Ready</div>
            <div>+${bailoutInfo.amount} {bailoutInfo.description}</div>
          </div>
        </div>
      )}
     
      {/* Smart Bet Buttons */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {smartBets.map(amount => (
          <button
            key={amount}
            onClick={() => setBetAmount(amount)}
            disabled={amount > maxBet || disabled}
            className={`py-2 px-2 rounded-lg text-white text-sm font-bold transition-all duration-200 ${
              betAmount === amount 
                ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 shadow-lg scale-105' 
                : 'bg-gradient-to-r from-green-800 to-green-700 hover:from-green-700 hover:to-green-600 hover:scale-102'
            } ${
              amount > maxBet || disabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''
            }`}
          >
            ${amount}
            {amount === Math.floor(currentMoney * 0.05) && <div className="text-xs opacity-75">5%</div>}
            {amount === Math.floor(currentMoney * 0.1) && <div className="text-xs opacity-75">10%</div>}
            {amount === Math.floor(currentMoney * 0.2) && <div className="text-xs opacity-75">20%</div>}
          </button>
        ))}
      </div>
     
      {/* Custom Bet Amount Controls */}
      <div className="flex items-center mb-4">
        <button
          className="bg-red-800 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-l-lg disabled:opacity-50 transition-colors"
          onClick={() => setBetAmount(Math.max(minBet, betAmount - 10))}
          disabled={disabled || betAmount <= minBet}
        >
          -10
        </button>
        
        <button
          className="bg-red-700 hover:bg-red-600 text-white font-bold px-3 py-2 disabled:opacity-50 transition-colors"
          onClick={() => setBetAmount(Math.max(minBet, betAmount - 5))}
          disabled={disabled || betAmount <= minBet}
        >
          -5
        </button>
       
        <div className="bg-black text-white text-center border-y-2 border-gray-700 py-2 px-4 flex-1 font-bold text-lg">
          ${betAmount}
        </div>
        
        <button
          className="bg-green-700 hover:bg-green-600 text-white font-bold px-3 py-2 disabled:opacity-50 transition-colors"
          onClick={() => setBetAmount(Math.min(maxBet, betAmount + 5))}
          disabled={disabled || betAmount >= maxBet}
        >
          +5
        </button>
       
        <button
          className="bg-green-800 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-r-lg disabled:opacity-50 transition-colors"
          onClick={() => setBetAmount(Math.min(maxBet, betAmount + 10))}
          disabled={disabled || betAmount >= maxBet}
        >
          +10
        </button>
      </div>

      {/* Advanced Controls */}
      {showAdvanced && (
        <div className="mb-4 p-3 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-600">
          <div className="text-sm text-gray-300 mb-2 font-bold">Quick Set:</div>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => setBetAmount(minBet)}
              className="text-xs py-1 px-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
            >
              Min
            </button>
            <button
              onClick={() => setBetAmount(Math.floor(maxBet * 0.25))}
              className="text-xs py-1 px-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
            >
              25%
            </button>
            <button
              onClick={() => setBetAmount(Math.floor(maxBet * 0.5))}
              className="text-xs py-1 px-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
            >
              50%
            </button>
            <button
              onClick={() => setBetAmount(maxBet)}
              className="text-xs py-1 px-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
            >
              Max
            </button>
          </div>
        </div>
      )}
     
      {/* Place Bet Button */}
      <button
        onClick={handlePlaceBet}
        disabled={betAmount < minBet || betAmount > maxBet || disabled}
        className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white font-bold py-3 rounded-lg disabled:from-gray-600 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-lg text-lg"
      >
        {disabled ? 'BETTING DISABLED' : `DEAL CARDS - ${betAmount}`}
      </button>
     
      {/* Betting Info */}
      <div className="text-center mt-3 text-xs space-y-1">
        <div className="text-green-300">
          Balance: ${maxBet} • Min: ${minBet} • Max: ${maxBet}
        </div>
        {minBet > 5 && (
          <div className="text-yellow-300">
            💎 High Roller active - Minimum bet increased
          </div>
        )}
        {showAdvanced && recommendations.filter(r => r.priority !== 'high').length > 0 && (
          <div className="text-left mt-2 p-2 bg-gray-800 bg-opacity-50 rounded text-xs">
            <div className="font-bold text-gray-300 mb-1">Additional Tips:</div>
            {recommendations.filter(r => r.priority !== 'high').map((rec, index) => (
              <div key={index} className="text-gray-400">• {rec.message}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};