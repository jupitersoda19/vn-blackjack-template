// BettingControls.js - Updated for multiple opponents
import React, { useState } from 'react';

const BettingControls = ({ onPlaceBet, maxBet = 1000, disabled = false }) => {
  const [betAmount, setBetAmount] = useState(25); // Default bet amount
  
  // Predefined quick bet amounts
  const quickBets = [10, 25, 50, 100, 500];
  
  // Handle placing the bet
  const handlePlaceBet = () => {
    if (betAmount > 0 && betAmount <= maxBet && !disabled) {
      onPlaceBet(betAmount);
    }
  };
  
  // Calculate minimum bet (to prevent tiny bets)
  const minBet = 5;
  
  return (
    <div className="w-full bg-black bg-opacity-50 rounded-lg p-4">
      <h3 className="text-yellow-300 font-bold text-center mb-2">PLACE YOUR BET</h3>
      
      {/* Quick bet buttons */}
      <div className="grid grid-cols-5 gap-1 mb-3">
        {quickBets.map(amount => (
          <button
            key={amount}
            onClick={() => setBetAmount(amount)}
            disabled={amount > maxBet || disabled}
            className={`
              py-1 px-2 rounded text-white text-sm font-bold
              ${betAmount === amount ? 'bg-yellow-600' : 'bg-green-800 hover:bg-green-700'}
              ${amount > maxBet || disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            ${amount}
          </button>
        ))}
      </div>
      
      {/* Bet amount slider */}
      <div className="mb-3">
        <input
          type="range"
          min={minBet}
          max={maxBet}
          step={5}
          value={betAmount}
          onChange={e => setBetAmount(parseInt(e.target.value))}
          disabled={disabled}
          className="w-full h-2 bg-green-900 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      
      {/* Bet amount display with +/- controls */}
      <div className="flex items-center mb-3">
        <button 
          className="bg-red-800 hover:bg-red-700 text-white font-bold px-3 py-1 rounded-l disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setBetAmount(Math.max(minBet, betAmount - 5))}
          disabled={disabled || betAmount <= minBet}
        >
          -
        </button>
        
        <div className="bg-black text-white text-center border-y border-gray-700 py-1 px-4 w-full font-bold">
          ${betAmount}
        </div>
        
        <button 
          className="bg-green-800 hover:bg-green-700 text-white font-bold px-3 py-1 rounded-r disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setBetAmount(Math.min(maxBet, betAmount + 5))}
          disabled={disabled || betAmount >= maxBet}
        >
          +
        </button>
      </div>
      
      {/* Place bet button */}
      <div className="flex items-center">
        <button
          onClick={handlePlaceBet}
          disabled={betAmount < minBet || betAmount > maxBet || disabled}
          className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          DEAL
        </button>
      </div>
      
      {/* Betting limits */}
      <div className="text-center mt-2 text-xs text-green-300">
        Max Bet: <span className="text-white">${maxBet}</span> • Table Min: <span className="text-white">${minBet}</span>
      </div>
    </div>
  );
};

export default BettingControls;