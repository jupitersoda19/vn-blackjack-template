export const emotionColors = {
  // Positive emotions
  welcoming: "#4CAF50",
  friendly: "#8BC34A",
  proud: "#009688",
  explaining: "#2196F3",
  professional: "#3F51B5",
  inviting: "#9C27B0",
  
  // Neutral emotions
  neutral: "#9E9E9E",
  attentive: "#607D8B",
  guiding: "#795548",
  composed: "#5D4037",
  
  // Curious emotions
  curious: "#FF9800",
  interested: "#FFC107",
  pondering: "#FFB300",
  
  // Strong emotions
  impressed: "#E91E63",
  amazed: "#F44336",
  decided: "#D32F2F",
  reflective: "#673AB7",
  
  // Default for unknown emotions
  default: "#9E9E9E"
};

// Get color for a specific emotion with fallback
export const getEmotionColor = (emotion) => {
  return emotionColors[emotion] || emotionColors.default;
};

// Generate emotion aura styles
export const generateEmotionAura = (emotion, intensity = 0.7) => {
  const color = getEmotionColor(emotion);
  return {
    boxShadow: `0 0 15px 2px ${color}${Math.floor(intensity * 99).toString(16)}`,
    borderColor: color
  };
};