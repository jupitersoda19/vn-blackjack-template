// ExportGameButton.jsx
import React from 'react';

const ExportGameButton = ({ gameData }) => {
  const handleExport = () => {
    // Convert to JSON string with pretty formatting
    const jsonData = JSON.stringify(gameData, null, 2);
    
    // Create a blob and download
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'claude_casino_game.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-8 rounded-lg text-xl shadow-lg transform transition hover:scale-105"
    >
      Export Game
    </button>
  );
};

export default ExportGameButton;