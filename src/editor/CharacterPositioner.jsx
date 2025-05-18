import React, { useState } from 'react';

const CharacterPositioner = ({ characters, onCharactersChange }) => {
  // Available positions for characters
  const positions = ['left', 'center', 'right'];
  
  // Available emotions
  const emotions = [
    'neutral', 'happy', 'sad', 'angry', 'surprised', 
    'concerned', 'professional', 'confused', 'excited'
  ];
  
  // Available states
  const states = [
    'default', 'entering', 'exiting', 'sitting', 'standing'
  ];
  
  // Add a character to a position
  const addCharacter = (position) => {
    if (characters[position]) return; // Position already occupied
    
    const newCharacters = {
      ...characters,
      [position]: {
        image: "/assets/characters/default.png",
        name: "Character",
        emotion: "neutral"
      }
    };
    
    onCharactersChange(newCharacters);
  };
  
  // Remove a character from a position
  const removeCharacter = (position) => {
    const newCharacters = { ...characters };
    delete newCharacters[position];
    
    onCharactersChange(newCharacters);
  };
  
  // Update a character's properties
  const updateCharacter = (position, property, value) => {
    const newCharacters = {
      ...characters,
      [position]: {
        ...characters[position],
        [property]: value
      }
    };
    
    onCharactersChange(newCharacters);
  };
  
  return (
    <div className="bg-gray-900 p-3 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-yellow-500 text-sm font-bold">Character Positions</h4>
        
        <div className="text-xs text-gray-400">
          Click a position to add/edit a character
        </div>
      </div>
      
      <div className="flex justify-between items-end h-32 border-b border-gray-700 mb-4 px-4 pb-2">
        {positions.map((position) => (
          <div key={position} className="flex flex-col items-center">
            <div className="text-xs text-yellow-400 mb-1 capitalize">{position}</div>
            
            {characters[position] ? (
              <div className="relative">
                <div 
                  className="w-16 h-24 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden border border-yellow-600"
                  onClick={() => removeCharacter(position)}
                >
                  <img 
                    src={characters[position].image}
                    alt={characters[position].name}
                    className="max-w-full max-h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/150/555555/FFCC00?text=Character';
                    }}
                  />
                </div>
                <div className="text-xs text-center mt-1 text-yellow-300 truncate max-w-16">
                  {characters[position].name}
                </div>
              </div>
            ) : (
              <div 
                className="w-16 h-24 bg-gray-800 rounded-lg border border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-700"
                onClick={() => addCharacter(position)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {Object.keys(characters).length > 0 && (
        <div className="space-y-4">
          {Object.keys(characters).map((position) => (
            <div key={position} className="bg-gray-800 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h5 className="text-yellow-400 text-sm font-bold capitalize">{position} Character</h5>
                
                <button
                  onClick={() => removeCharacter(position)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-yellow-400 text-xs mb-1">
                    Character Name
                  </label>
                  <input
                    type="text"
                    value={characters[position].name || ''}
                    onChange={(e) => updateCharacter(position, 'name', e.target.value)}
                    className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-1 px-2 text-sm focus:outline-none focus:border-yellow-500"
                    placeholder="Character Name"
                  />
                </div>
                
                <div>
                  <label className="block text-yellow-400 text-xs mb-1">
                    Image Path
                  </label>
                  <input
                    type="text"
                    value={characters[position].image || ''}
                    onChange={(e) => updateCharacter(position, 'image', e.target.value)}
                    className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-1 px-2 text-sm focus:outline-none focus:border-yellow-500"
                    placeholder="/assets/characters/character.png"
                  />
                </div>
                
                <div>
                  <label className="block text-yellow-400 text-xs mb-1">
                    Emotion
                  </label>
                  <select
                    value={characters[position].emotion || 'neutral'}
                    onChange={(e) => updateCharacter(position, 'emotion', e.target.value)}
                    className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-1 px-2 text-sm focus:outline-none focus:border-yellow-500"
                  >
                    {emotions.map((emotion) => (
                      <option key={emotion} value={emotion}>
                        {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-yellow-400 text-xs mb-1">
                    State
                  </label>
                  <select
                    value={characters[position].state || 'default'}
                    onChange={(e) => updateCharacter(position, 'state', e.target.value)}
                    className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-1 px-2 text-sm focus:outline-none focus:border-yellow-500"
                  >
                    {states.map((state) => (
                      <option key={state} value={state}>
                        {state.charAt(0).toUpperCase() + state.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CharacterPositioner;