import React, { useState } from 'react';
import StartScreen from './StartScreen';
import VisualNovelEngine from './vn/VisualNovelEngine';
import defaultGameData from './data/gameData.json';

/**
 * Main App component - simplified without character selection
 */
const App = () => {
  const [gameState, setGameState] = useState('start'); // 'start', 'game'
  const [gameData, setGameData] = useState(defaultGameData);

  const handleStartGame = () => {
    // Immediately start the game with default characters
    setGameState('game');
  };

  const handleLoadCustomData = (customData) => {
    // Set the complete game data
    setGameData(customData);
    
    // Update document title based on metadata
    if (customData.metadata && customData.metadata.title) {
      document.title = customData.metadata.title;
    }
    
    // Immediately start the game with default characters
    setGameState('game');
  };

  return (
    <div className="app w-full h-screen overflow-hidden">
      {gameState === 'start' && (
        <StartScreen
          onStartGame={handleStartGame}
          onLoadCustomData={handleLoadCustomData}
          gameData={gameData}
        />
      )}
      
      {gameState === 'game' && (
        <VisualNovelEngine
          playerData={gameData.events}
          selectedCharacters={selectedCharacters}
          gameMetadata={gameData.metadata}
        />
      )}
    </div>
  );
};

export default App;