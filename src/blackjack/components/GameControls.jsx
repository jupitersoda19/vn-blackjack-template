// GameControls.js - Component for game control buttons
import React from 'react';

const GameControls = ({ onHit, onStand, onNewGame, isPlayerTurn, isGameOver }) => {
  return (
    <div className="mt-6 p-4 bg-green-700 rounded-lg shadow-lg border border-green-600 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="w-full h-full grid grid-cols-10 grid-rows-8">
          {Array(80).fill().map((_, i) => (
            <div key={i} className="border-b border-r border-green-600"></div>
          ))}
        </div>
      </div>
      
      {/* Title */}
      <h3 className="text-yellow-300 font-bold text-xl mb-4 text-center tracking-wider">GAME ACTIONS</h3>
      
      <div className="flex flex-col space-y-3">
        {/* Hit button */}
        <button 
          onClick={onHit} 
          disabled={!isPlayerTurn || isGameOver}
          className="relative bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md disabled:opacity-50 border border-blue-600 transform transition-transform hover:scale-105 disabled:hover:scale-100"
        >
          <div className="flex items-center justify-center">
            <span className="mr-2 text-xl">🃏</span>
            <span className="tracking-wide text-lg">HIT</span>
          </div>
          <div className="absolute top-0 left-0 w-full h-full rounded-lg overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white opacity-10"></div>
          </div>
        </button>
        
        {/* Stand button */}
        <button 
          onClick={onStand} 
          disabled={!isPlayerTurn || isGameOver}
          className="relative bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white font-bold py-3 px-4 rounded-lg shadow-md disabled:opacity-50 border border-red-600 transform transition-transform hover:scale-105 disabled:hover:scale-100"
        >
          <div className="flex items-center justify-center">
            <span className="mr-2 text-xl">✋</span>
            <span className="tracking-wide text-lg">STAND</span>
          </div>
          <div className="absolute top-0 left-0 w-full h-full rounded-lg overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white opacity-10"></div>
          </div>
        </button>
        
        {/* New Game button */}
        <button 
          onClick={onNewGame}
          className="relative bg-gradient-to-b from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-white font-bold py-3 px-4 rounded-lg shadow-md border border-green-600 transform transition-transform hover:scale-105 mt-2"
        >
          <div className="flex items-center justify-center">
            <span className="mr-2 text-xl">🔄</span>
            <span className="tracking-wide text-lg">NEW GAME</span>
          </div>
          <div className="absolute top-0 left-0 w-full h-full rounded-lg overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white opacity-10"></div>
          </div>
        </button>
      </div>
      
      {/* Status indicator */}
      <div className="mt-4 flex justify-center">
        <div className={`h-3 w-3 rounded-full ${isPlayerTurn && !isGameOver ? 'bg-green-400 animate-pulse' : 'bg-gray-500'} mr-2`}></div>
        <p className="text-xs text-green-200">
          {isPlayerTurn && !isGameOver ? 'Your Turn - Make a Move' : 'Waiting for Next Game'}
        </p>
      </div>
    </div>
  );
};

export default GameControls;