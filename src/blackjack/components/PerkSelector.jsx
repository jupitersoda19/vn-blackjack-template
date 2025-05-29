// components/PerkSelector.js - Perk selection interface
import React, { useState, useEffect } from 'react';
import { PerkUtils } from '../data/PerkDefinitions';

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

  useEffect(() => {
    if (!isInitialized) {
      const allPerks = PerkUtils.getAllPerks();
      const existingPerkIds = existingPerks.map(p => p.id);
      const filteredPerks = PerkUtils.filterSituationalPerks(allPerks, playerStats, currentMoney, existingPerkIds);
      const selectedPerks = PerkUtils.generateWeightedSelection(filteredPerks, 12, currentRound * 12345);
      
      setAvailablePerks(selectedPerks);
      setIsInitialized(true);
    }
  }, [isInitialized, currentRound, existingPerks, currentMoney, playerStats]);

  useEffect(() => {
    setIsInitialized(false);
    setSelectedPerks([]);
  }, [currentRound]);

  const handlePerkToggle = (perkId) => {
    setSelectedPerks(prev => {
      if (prev.includes(perkId)) {
        return prev.filter(id => id !== perkId);
      } else if (prev.length < maxPerks) {
        return [...prev, perkId];
      }
      return prev;
    });
  };

  const handleConfirm = () => {
    const selectedPerkObjects = selectedPerks.map(id => PerkUtils.getPerkById(id));
    onPerksSelected(selectedPerkObjects);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-green-900 to-green-800 rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-yellow-300 mb-2">
            🎰 Perk Round {currentRound} 🎰
          </h2>
          <p className="text-green-300">Select up to {maxPerks} perks to ADD to your collection</p>
          <div className="text-sm text-gray-300 mt-2">
            Selected: {selectedPerks.length}/{maxPerks} • New perks last 3 hands
          </div>
          
          {existingPerks.length > 0 && (
            <div className="mt-4 p-3 bg-purple-900 bg-opacity-50 rounded-lg">
              <div className="text-sm font-bold text-purple-300 mb-2">
                Currently Active Perks ({existingPerks.length}):
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {existingPerks.map(perk => (
                  <span 
                    key={perk.id}
                    className="text-xs bg-purple-700 text-white px-2 py-1 rounded-full"
                    title={perk.description}
                  >
                    {perk.icon} {perk.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center mb-4 space-x-4 text-sm">
          <span className="text-gray-400">⚪ Common</span>
          <span className="text-green-400">🟢 Uncommon</span>
          <span className="text-blue-400">🔵 Rare</span>
          <span className="text-purple-400">🟣 Legendary</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-6">
          {availablePerks.map(perk => {
            const isSelected = selectedPerks.includes(perk.id);
            const isDisabled = !isSelected && selectedPerks.length >= maxPerks;
            
            return (
              <div
                key={perk.id}
                onClick={() => !isDisabled && handlePerkToggle(perk.id)}
                className={`
                  relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 min-h-[140px]
                  ${isSelected 
                    ? 'border-yellow-400 bg-yellow-900 bg-opacity-30 scale-105' 
                    : isDisabled 
                    ? 'border-gray-600 bg-gray-800 opacity-50 cursor-not-allowed'
                    : 'border-gray-400 bg-black bg-opacity-30 hover:border-white hover:bg-opacity-50 hover:scale-102'
                  }
                `}
              >
                <div className={`absolute top-1 right-1 px-2 py-1 rounded text-xs font-bold bg-gradient-to-r ${PerkUtils.getTierColor(perk.tier)}`}>
                  {PerkUtils.getTierEmoji(perk.tier)}
                </div>

                <div className="text-3xl mb-2 text-center">{perk.icon}</div>

                <h3 className="text-sm font-bold text-yellow-300 mb-2 text-center leading-tight">
                  {perk.name}
                </h3>

                <p className="text-xs text-green-300 text-center leading-relaxed">
                  {perk.description}
                </p>

                {isSelected && (
                  <div className="absolute inset-0 border-2 border-yellow-400 rounded-lg bg-yellow-400 bg-opacity-10 flex items-center justify-center">
                    <div className="bg-yellow-400 text-black font-bold px-2 py-1 rounded-full text-xs">
                      ✓ SELECTED
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={onSkip}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg"
          >
            No New Perks
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={selectedPerks.length === 0}
            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-lg"
          >
            Add {selectedPerks.length > 0 ? `${selectedPerks.length} perks` : 'no perks'}
          </button>
        </div>

        <div className="mt-4 text-center text-xs text-gray-400">
          <p>💡 New perks last for 3 hands • Next perk selection after 3 more hands</p>
        </div>
      </div>
    </div>
  );
};