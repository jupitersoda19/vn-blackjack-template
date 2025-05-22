export const defaultTheme = {
  primaryColor: "#8B0000",    // Dark red
  secondaryColor: "#2D0000",  // Very dark red
  accentColor: "#FFD700",     // Gold
  textColor: "#F5F5DC",       // Beige
  backgroundColor: "#000000", // Black
};

export const applyTheme = (theme = {}) => {
  return {
    ...defaultTheme,
    ...theme
  };
};