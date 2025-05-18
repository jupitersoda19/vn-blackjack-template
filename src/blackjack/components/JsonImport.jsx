// JsonImport.js - Component for importing player data from JSON
import React, { useState } from 'react';

const JsonImport = ({ onImport }) => {
  const [error, setError] = useState(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [showExample, setShowExample] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Reset states
    setError(null);
    setImportSuccess(false);

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        
        // Validate the data structure
        if (!Array.isArray(jsonData)) {
          throw new Error('JSON data must be an array of characters');
        }
        
        // Validate each character in the array
        for (const character of jsonData) {
          if (!character.key || !character.name || !Array.isArray(character.blackjackevents)) {
            throw new Error('Invalid character data structure');
          }
          
          // Validate each event
          for (const event of character.blackjackevents) {
            if (!event.name || !event.cost || !event.slideimgpath || !event.album_img) {
              throw new Error(`Invalid event data for character '${character.name}'`);
            }
          }
        }
        
        // If we made it here, the data is valid
        onImport(jsonData);
        setImportSuccess(true);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        setError(error.message);
      }
    };
    
    reader.onerror = () => {
      setError('Error reading file');
    };
    
    reader.readAsText(file);
  };

  const exampleJson = `[
  {
    "key": "player1",
    "name": "Player",
    "thumb": "/player1/thumb.png",
    "profilepic": "/player1/profilepic.png",
    "blackjackevents": [
      {
        "name": "Casino Night",
        "cost": 1000,
        "slideimgpath": "/casinonight/image01.png",
        "album_img": "/casinonight/title.png",
        "maxImageCount": 5
      },
      {
        "name": "High Roller",
        "cost": 2000,
        "slideimgpath": "/highroller/image01.png",
        "album_img": "/highroller/title.png",
        "maxImageCount": 7
      }
    ]
  },
  {
    "key": "dealer1",
    "name": "Dealer",
    "thumb": "/dealer1/thumb.png",
    "profilepic": "/dealer1/profilepic.png",
    "blackjackevents": [
      {
        "name": "House Rules",
        "cost": 5000,
        "slideimgpath": "/houserules/image01.png",
        "album_img": "/houserules/title.png",
        "maxImageCount": 5
      }
    ]
  }
]`;

  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 mb-4">
      <h3 className="text-white font-bold mb-3">Import Characters & Events</h3>
      
      <div className="flex items-center justify-between">
        <label className="flex-1 relative overflow-hidden">
          <div className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded cursor-pointer text-center transition-colors border border-blue-500">
            Choose JSON File
          </div>
          <input 
            type="file" 
            accept=".json"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer" 
          />
        </label>
        
        {importSuccess && (
          <div className="ml-4 text-green-400 text-sm animate-pulse">
            ✓ Import successful!
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-2 text-red-400 text-sm">
          Error: {error}
        </div>
      )}
      
      <div className="mt-3 text-gray-400 text-xs flex items-center">
        <span>Upload a JSON file with custom characters and events.</span>
        <button 
          onClick={() => setShowExample(!showExample)} 
          className="text-blue-400 ml-1 hover:underline"
        >
          {showExample ? 'Hide' : 'View'} example format
        </button>
      </div>
      
      {showExample && (
        <div className="mt-3 p-3 bg-gray-900 rounded-lg text-gray-300 text-xs overflow-auto max-h-60">
          <pre>{exampleJson}</pre>
        </div>
      )}
    </div>
  );
};

export default JsonImport;