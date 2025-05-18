// Updated PlayerView.js for direct image integration
import React from 'react';

const PlayerView = ({
  name,
  avatarData,
  score,
  startingMoney,
  selectedEvent,
  profit,
  isOpponent = false
}) => {
  // Get the profile image from all possible sources
  const getProfileImage = () => {
    // Check all possible sources in order of priority
    
    // 1. Direct image from selectedEvent
    if (selectedEvent?.image) return selectedEvent.image;
    
    // 2. Character image from selectedEvent
    if (selectedEvent?.character?.image) return selectedEvent.character.image;
    
    // 3. From avatarData direct properties
    if (avatarData?.image) return avatarData.image;
    if (avatarData?.profilepic) return avatarData.profilepic;
    
    // 4. Look for character objects in avatarData
    if (avatarData?.characters?.right?.image) return avatarData.characters.right.image;
    if (avatarData?.characters?.left?.image) return avatarData.characters.left.image;
    if (avatarData?.characters?.center?.image) return avatarData.characters.center.image;
    
    // 5. Try to construct a path based on character name
    if (selectedEvent?.name) {
      const characterName = selectedEvent.name.toLowerCase().replace(/\s+/g, '-');
      return `/assets/characters/${characterName}.png`;
    }
    
    if (name) {
      const characterName = name.toLowerCase().replace(/\s+/g, '-');
      return `/assets/characters/${characterName}.png`;
    }
    
    // Default fallback
    return '/default-avatar.png';
  };

  // Get profile image path
  const profilePic = getProfileImage();
  
  // Get the best available name
  const displayName = name || 
                      selectedEvent?.character?.name || 
                      selectedEvent?.name || 
                      avatarData?.name || 
                      (isOpponent ? 'Dealer' : 'Player');
 
  // Generate a color based on name for opponents
  const getAvatarBorderColor = () => {
    if (isOpponent) {
      // Generate a deterministic color based on name
      const colors = [
        'border-red-500',
        'border-blue-500',
        'border-purple-500',
        'border-pink-500',
        'border-indigo-500',
        'border-teal-500'
      ];
     
      // Simple hash
      let hash = 0;
      for (let i = 0; i < displayName.length; i++) {
        hash = ((hash << 5) - hash) + displayName.charCodeAt(i);
        hash |= 0;
      }
     
      return colors[Math.abs(hash) % colors.length];
    }
   
    return 'border-yellow-500'; // Default for player
  };
 
  return (
    <div className="w-full flex flex-col items-center">
      {/* Avatar image */}
      <div className={`w-20 h-20 rounded-full overflow-hidden border-4 ${getAvatarBorderColor()} shadow-lg mb-2`}>
        <img
          src={profilePic}
          alt={displayName}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.log(`Failed to load image: ${profilePic}, trying fallback`);
            e.target.onerror = null;
            e.target.src = '/default-avatar.png';
          }}
        />
      </div>
     
      {/* Player name */}
      <div className="text-yellow-200 font-bold text-lg">{displayName}</div>
     
      {/* Score display */}
      <div className="bg-black bg-opacity-50 px-4 py-2 rounded-full mt-2 text-center min-w-32">
        <div className="text-sm text-green-300">Bankroll</div>
        <div className="text-white text-xl font-bold">${score}</div>
       
        {/* Profit/Loss indicator (for player only) */}
        {typeof profit === 'number' && !isOpponent && (
          <div className={`text-xs mt-1 ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {profit >= 0 ? `+$${profit}` : `-$${Math.abs(profit)}`}
          </div>
        )}
      </div>
     
      {/* Selected event info - condensed for opponents */}
      {selectedEvent && (
        <div className={`mt-2 bg-black bg-opacity-40 p-2 rounded-lg w-full text-center ${isOpponent ? 'text-xs' : ''}`}>
          <div className="text-yellow-300 text-sm font-bold">
            {selectedEvent.name || 'Event'}
          </div>
         
          {/* Event image - only show for player or if space permits */}
          {selectedEvent.album_img && !isOpponent && (
            <div className="mt-1 h-12 flex justify-center">
              <img
                src={selectedEvent.album_img}
                alt={selectedEvent.name}
                className="h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
         
          {/* Only show buy-in if provided */}
          {startingMoney && (
            <div className="text-white text-xs mt-1">Buy-in: ${startingMoney}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlayerView;