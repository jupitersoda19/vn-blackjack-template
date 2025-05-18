// DynamicAvatar.js - Component for dynamic avatars based on money
import React, { useMemo } from 'react';

const DynamicAvatar = ({ playerData, currentMoney, startingMoney, selectedEvent, isDealer = false }) => {
  // Calculate which image to show based on money left
  const getImageNumber = useMemo(() => {
    if (!playerData || !selectedEvent) {
      return '01'; // Default image if no data
    }

    const { cost } = selectedEvent;
    
    // Calculate percentage of money remaining
    const moneyPercentage = currentMoney / startingMoney;
    
    // Determine max image count based on the selected event
    const maxImageCount = selectedEvent.maxImageCount || 5;
    
    // Calculate which image number to use based on percentage and max count
    const imageIndex = Math.floor((1 - moneyPercentage) * maxImageCount);
    const boundedIndex = Math.min(Math.max(imageIndex, 0), maxImageCount - 1);
    const imageNumber = (boundedIndex + 1).toString().padStart(2, '0');
    
    return imageNumber;
  }, [playerData, currentMoney, startingMoney, selectedEvent]);

  // Get current image path
  const imagePath = useMemo(() => {
    if (!playerData || !selectedEvent) {
      return null;
    }

    const basePath = `/${selectedEvent.slideimgpath.replace('image01.png', `image${getImageNumber}.png`)}`;
    
    return basePath;
  }, [playerData, getImageNumber, selectedEvent]);

  // Fallback image if data is not available
  if (!playerData || !selectedEvent || !imagePath) {
    return (
      <div className={`w-16 h-16 ${isDealer ? 'bg-gray-700' : 'bg-green-700'} rounded-full flex items-center justify-center z-10 relative overflow-hidden border-2 ${isDealer ? 'border-red-800' : 'border-blue-800'}`}>
        <img src="/api/placeholder/100/100" alt="Avatar" className="w-14 h-14 rounded-full opacity-90" />
      </div>
    );
  }

  return (
    <div className={`w-50 ${isDealer ? 'bg-gray-700' : 'bg-green-700'} flex items-center justify-center z-10 relative overflow-hidden border-2 ${isDealer ? 'border-red-800' : 'border-blue-800'}`}>
      <img 
        src={imagePath} 
        alt={playerData.name} 
        className="w-50  opacity-90" 
      />
    </div>
  );
};

export default DynamicAvatar;