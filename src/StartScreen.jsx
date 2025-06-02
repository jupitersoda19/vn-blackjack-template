import  { useState } from 'react';
import LevelEditor from './editor/LevelEditor';

const StartScreen = ({ onStartGame, onLoadCustomData, gameData }) => {
  const [showLevelEditor, setShowLevelEditor] = useState(false);
  
  // Use gameData.metadata for the title screen
  const metadata = gameData?.metadata || {
    title: "MY CASINO",
    description: "Experience the thrill of blackjack in an immersive visual novel",
    version: "1.0.0",
    backgroundImage: "/assets/backgrounds/default.png",
    titleScreenTheme: {
      primaryColor: "#F59E0B",
      secondaryColor: "#78350F",
      textColor: "#FBBF24"
    }
  };


  return (
    <div className="h-screen w-full bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center overflow-hidden">
      {showLevelEditor ? (
        <LevelEditor
          onSave={(customData) => {
            onLoadCustomData(customData);
            setShowLevelEditor(false);
          }}
          onCancel={() => setShowLevelEditor(false)}
          initialData={gameData}
        />
      ) : (
        <div 
          className="text-center p-8 bg-black bg-opacity-40 rounded-xl border"
          style={{ borderColor: metadata.titleScreenTheme?.secondaryColor || '#78350F' }}
        >
          <h1 
            className="text-5xl font-bold mb-6 tracking-wider"
            style={{ color: metadata.titleScreenTheme?.textColor || '#FBBF24' }}
          >
            {metadata.title}
          </h1>
          
          <p 
            className="text-xl mb-10"
            style={{ color: metadata.titleScreenTheme?.textColor || '#FBBF24' }}
          >
            {metadata.description}
          </p>
         
          <div className="relative mb-8 overflow-hidden rounded-lg">
            <img
              src={metadata.backgroundImage}
              alt="Casino"
              className="w-full h-64 object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/800x400/1a1a1a/ffcc00?text=Casino';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-white text-lg">Where fortunes are won and lost</p>
            </div>
          </div>
         
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-8">
            <button
              onClick={onStartGame}
              className="text-white font-bold py-4 px-8 rounded-lg text-xl shadow-lg transform transition hover:scale-105"
              style={{ 
                backgroundColor: metadata.titleScreenTheme?.primaryColor || '#F59E0B'
              }}
            >
              Start Game
            </button>
           
            <button
              onClick={() => setShowLevelEditor(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-lg text-xl shadow-lg transform transition hover:scale-105"
            >
              Level Editor
            </button>
          </div>
         
          <div className="text-gray-400 text-sm">
            <p>Version {metadata.version} | &copy; 2025 {metadata.author || "Claude's Casino"}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StartScreen;