// components/DealerView.js - Separate component for dealers
import React from 'react';

const DealerView = ({
  name,
  avatarData,
  score,
  startingMoney,
  eventName,
  specialties,
  compact = false
}) => {
  // Get dealer image
  const getDealerImage = () => {
    if (avatarData?.image) return avatarData.image;
    if (name) {
      const dealerName = name.toLowerCase().replace(/\s+/g, '-');
      return `/assets/dealers/${dealerName}.png`;
    }
    return '/assets/dealers/default-dealer.png';
  };

  const profilePic = getDealerImage();
  const displayName = name || 'Dealer';

  // Generate dealer-specific border color
  const getDealerBorderColor = () => {
    const colors = [
      'border-red-500',
      'border-blue-500', 
      'border-purple-500',
      'border-orange-500',
      'border-teal-500',
      'border-pink-500'
    ];
    
    let hash = 0;
    for (let i = 0; i < displayName.length; i++) {
      hash = ((hash << 5) - hash) + displayName.charCodeAt(i);
      hash |= 0;
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between bg-green-900 bg-opacity-50 p-2 rounded-lg">
        {/* Compact dealer info */}
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full overflow-hidden border-2 ${getDealerBorderColor()} mr-2`}>
            <img
              src={profilePic}
              alt={displayName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/assets/dealers/default-dealer.png';
              }}
            />
          </div>
          <div>
            <div className="text-red-200 font-bold text-sm">{displayName}</div>
            {eventName && (
              <div className="text-xs text-red-300">{eventName}</div>
            )}
          </div>
        </div>
        
        {/* Dealer bankroll */}
        <div className="bg-black bg-opacity-50 px-2 py-1 rounded-full text-white text-sm">
          ${score}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Dealer avatar - distinct styling from player */}
      <div className={`w-20 h-20 rounded-full overflow-hidden border-4 ${getDealerBorderColor()} shadow-lg mb-2`}>
        <img
          src={profilePic}
          alt={displayName}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/assets/dealers/default-dealer.png';
          }}
        />
      </div>
      
      {/* Dealer name with distinct styling */}
      <div className="text-red-200 font-bold text-lg">{displayName}</div>
      
      {/* Dealer bankroll with different styling than player */}
      <div className="bg-red-900 bg-opacity-50 px-4 py-2 rounded-full mt-2 text-center min-w-32 border border-red-500">
        <div className="text-sm text-red-300">House Bank</div>
        <div className="text-white text-xl font-bold">${score}</div>
      </div>
      
      {/* Table/Event info */}
      {eventName && (
        <div className="mt-2 bg-black bg-opacity-40 p-2 rounded-lg w-full text-center">
          <div className="text-red-300 text-sm font-bold">{eventName}</div>
          {startingMoney && (
            <div className="text-white text-xs mt-1">Table Bank: ${startingMoney}</div>
          )}
        </div>
      )}
      
      {/* Dealer specialties */}
      {specialties && specialties.length > 0 && (
        <div className="mt-2 text-xs text-orange-300 text-center">
          {specialties.join(' • ')}
        </div>
      )}
    </div>
  );
};

export default DealerView;