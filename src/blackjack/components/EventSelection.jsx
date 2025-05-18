// EventSelection.js - Component for selecting events before the game starts
import React, { useState } from 'react';
import JsonImport from './JsonImport';

const EventSelection = ({ playerData: initialPlayerData, onEventSelected }) => {
  const [playerData, setPlayerData] = useState(initialPlayerData);
  const [playerEvent, setPlayerEvent] = useState(null);
  const [dealerEvent, setDealerEvent] = useState(null);
  
  const handleImportData = (importedData) => {
    // Replace the player data with imported data
    setPlayerData(importedData);
    
    // Reset selections since the data has changed
    setPlayerEvent(null);
    setDealerEvent(null);
  };
  
  const handleStartGame = () => {
    if (playerEvent && dealerEvent) {
      onEventSelected({
        playerEvent,
        dealerEvent
      });
    }
  };
  
  return (
    <div className="p-6 bg-green-800 rounded-lg shadow-lg border border-green-700 max-w-4xl mx-auto">
      <h2 className="text-yellow-300 font-bold text-2xl mb-4 text-center tracking-wider">
        SELECT GAME EVENTS
      </h2>
      
      {/* JSON Import */}
      <JsonImport onImport={handleImportData} />
      
      <div className="grid grid-cols-2 gap-6">
        {/* Player Event Selection */}
        <div className="bg-green-700 p-4 rounded-lg">
          <h3 className="text-white font-bold mb-4">Player Character</h3>
          
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {playerData[0].blackjackevents.map((event) => (
              <div 
                key={event.name}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  playerEvent?.name === event.name 
                    ? 'bg-blue-600 border-2 border-blue-400' 
                    : 'bg-green-600 hover:bg-green-500'
                }`}
                onClick={() => setPlayerEvent(event)}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-800 rounded-lg overflow-hidden mr-3">
                    <img 
                      src={`${event.album_img}`} 
                      alt={event.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = "/api/placeholder/100/100";
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{event.name}</h4>
                    <p className="text-green-200 text-sm">Starting: ${event.cost}</p>
                    <p className="text-green-200 text-xs">{event.maxImageCount || 5} stages</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Dealer Event Selection */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-white font-bold mb-4">Dealer Character</h3>
          
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {playerData[0].blackjackevents.map((event) => (
              <div 
                key={event.name}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  dealerEvent?.name === event.name 
                    ? 'bg-red-600 border-2 border-red-400' 
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
                onClick={() => setDealerEvent(event)}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-800 rounded-lg overflow-hidden mr-3">
                    <img 
                      src={`${event.album_img}`} 
                      alt={event.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = "/api/placeholder/100/100";
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{event.name}</h4>
                    <p className="text-red-200 text-sm">Bank: ${event.cost}</p>
                    <p className="text-red-200 text-xs">{event.maxImageCount || 5} stages</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Start Game Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleStartGame}
          disabled={!playerEvent || !dealerEvent}
          className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg disabled:opacity-50 border border-yellow-500 transform transition-transform hover:scale-105 disabled:hover:scale-100 text-xl tracking-wide"
        >
          START GAME
        </button>
      </div>
      
      <p className="text-center text-green-300 text-xs mt-4">
        Select a character for both player and dealer to begin
      </p>
    </div>
  );
};

export default EventSelection;