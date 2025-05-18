// Hand.js - Updated for multiple opponents
import React from 'react';

// Card component
const Card = ({ card, hidden = false }) => {
  const { suit, value } = card;
  
  // If hidden, show card back
  if (hidden) {
    return (
      <div className="w-16 h-24 rounded-lg overflow-hidden border-2 border-red-700 bg-gradient-to-br from-red-800 to-red-900 shadow-md">
        <div className="h-full w-full flex items-center justify-center">
          <div className="w-12 h-16 border-2 border-red-300 rounded opacity-30"></div>
          <div className="absolute font-bold text-red-300 text-2xl">?</div>
        </div>
      </div>
    );
  }
  
  // Determine card color
  const isRed = suit === 'hearts' || suit === 'diamonds';
  const textColor = isRed ? 'text-red-600' : 'text-black';
  
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
  
  return (
    <div className="w-16 h-24 bg-white rounded-lg overflow-hidden border-2 border-gray-300 shadow-md relative">
      <div className={`absolute top-1 left-1 font-bold ${textColor}`}>{value}</div>
      <div className={`absolute bottom-1 right-1 font-bold ${textColor}`}>{value}</div>
      <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl ${textColor}`}>
        {getSuitSymbol()}
      </div>
    </div>
  );
};

const Hand = ({ hand, hidden = false, label, compact = false }) => {
  // If no cards in hand, show empty slots
  if (!hand || hand.length === 0) {
    return (
      <div className="flex flex-col items-center mb-2">
        <div className={`text-white font-bold mb-2 text-center px-4 py-1 bg-green-900 rounded-lg border border-green-700 ${compact ? 'text-xs' : ''}`}>
          {label}
        </div>
        <div className="flex flex-row">
          <div className={`${compact ? 'w-12 h-18' : 'w-16 h-24'} border-2 border-dashed border-green-600 rounded-lg mx-1 opacity-30`}></div>
          <div className={`${compact ? 'w-12 h-18' : 'w-16 h-24'} border-2 border-dashed border-green-600 rounded-lg mx-1 opacity-30`}></div>
        </div>
      </div>
    );
  }
  
  // Reduce overlap for compact mode (useful for multiple opponents)
  const cardOffset = compact ? 15 : 30;
  const rotationFactor = compact ? 2 : 5;
  const cardScale = compact ? 0.7 : 1.0;

  return (
    <div className="flex flex-col items-center mb-2">
      {/* Label with decorative styling - smaller for compact mode */}
      <div className={`text-white font-bold mb-2 text-center px-4 py-1 bg-green-900 rounded-lg border border-green-700 shadow-md ${compact ? 'text-xs' : ''}`}>
        {label}
      </div>
     
      {/* Cards with fanned out effect */}
      <div 
        className="relative flex items-center justify-center" 
        style={{ 
          height: compact ? '22px' : '28px', 
          minWidth: `${hand.length * cardOffset + (compact ? 20 : 30)}px` 
        }}
      >
        {hand.map((card, index) => (
          <div
            key={index}
            className="absolute transform transition-transform duration-300"
            style={{
              left: `${index * cardOffset}px`,
              transform: `rotate(${(index - (hand.length - 1) / 2) * rotationFactor}deg) scale(${cardScale})`,
              transformOrigin: 'bottom center',
              zIndex: index
            }}
          >
            <Card card={card} hidden={hidden && index !== 0} compact={compact} />
          </div>
        ))}
      </div>
     
      {/* Total cards in hand - smaller for compact mode */}
      <div className={`text-xs text-green-300 mt-1 ${compact ? 'text-xs' : ''}`}>
        {hand.length} {hand.length === 1 ? 'card' : 'cards'}
      </div>
    </div>
  );
};

export default Hand;