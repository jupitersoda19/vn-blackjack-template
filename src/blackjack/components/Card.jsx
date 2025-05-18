// Card.js - Component for rendering a playing card
import React from 'react';

const Card = ({ card, hidden = false, compact = false }) => {
  // If no card provided, show empty slot
  if (!card) {
    return (
      <div className={`${compact ? 'w-12 h-18' : 'w-16 h-24'} border-2 border-dashed border-green-600 rounded-lg opacity-30`}></div>
    );
  }
  
  const { suit, value } = card;
  
  // If hidden, show card back
  if (hidden) {
    return (
      <div className={`${compact ? 'w-12 h-18' : 'w-16 h-24'} rounded-lg overflow-hidden border-2 border-red-700 bg-gradient-to-br from-red-800 to-red-900 shadow-md`}>
        <div className="h-full w-full flex items-center justify-center">
          <div className={`${compact ? 'w-9 h-14' : 'w-12 h-16'} border-2 border-red-300 rounded opacity-30`}></div>
          <div className={`absolute font-bold text-red-300 ${compact ? 'text-xl' : 'text-2xl'}`}>?</div>
        </div>
      </div>
    );
  }
  
  // Determine card color
  const isRed = suit === 'hearts' || suit === 'diamonds';
  const textColor = isRed ? 'text-red-600' : 'text-black';
  
  // Map card values to display
  const getDisplayValue = () => {
    switch (value) {
      case 'A': return 'A';
      case 'K': return 'K';
      case 'Q': return 'Q';
      case 'J': return 'J';
      default: return value;
    }
  };
  
  // Map suits to symbols
  const getSuitSymbol = () => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '';
    }
  };
  
  // Get suit style class 
  const getSuitClass = () => {
    switch (suit) {
      case 'hearts': return 'text-red-600';
      case 'diamonds': return 'text-red-600';
      case 'clubs': return 'text-black';
      case 'spades': return 'text-black';
      default: return '';
    }
  };
  
  return (
    <div className={`${compact ? 'w-12 h-18' : 'w-16 h-24'} bg-white rounded-lg overflow-hidden border-2 border-gray-300 shadow-md relative`}>
      {/* Card corners */}
      <div className={`absolute top-1 left-1 font-bold ${textColor} ${compact ? 'text-sm' : ''}`}>
        {getDisplayValue()}
        <div className={`${getSuitClass()} ${compact ? 'text-xs' : 'text-xs'}`}>{getSuitSymbol()}</div>
      </div>
      <div className={`absolute bottom-1 right-1 font-bold rotate-180 ${textColor} ${compact ? 'text-sm' : ''}`}>
        {getDisplayValue()}
        <div className={`${getSuitClass()} ${compact ? 'text-xs' : 'text-xs'}`}>{getSuitSymbol()}</div>
      </div>
      
      {/* Card center */}
      <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${textColor} ${compact ? 'text-xl' : 'text-3xl'}`}>
        {getSuitSymbol()}
      </div>
    </div>
  );
};

export default Card;