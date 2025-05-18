import React, { useState, useRef, useEffect } from 'react';

const ColorPicker = ({ color, onChange }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [inputValue, setInputValue] = useState(color);
  const colorPickerRef = useRef(null);
  
  // Update the input value when the color prop changes
  useEffect(() => {
    setInputValue(color);
  }, [color]);
  
  // Handle clicking outside the color picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setShowColorPicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [colorPickerRef]);
  
  // Handle color input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Validate if it's a proper hex color
    if (/^#([0-9A-F]{3}){1,2}$/i.test(value)) {
      onChange(value);
    }
  };
  
  // Handle color selection from color picker
  const handleColorChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    onChange(value);
  };
  
  return (
    <div className="flex items-center space-x-2 relative" ref={colorPickerRef}>
      <div 
        className="w-10 h-10 rounded-lg cursor-pointer border border-gray-600"
        style={{ backgroundColor: color }}
        onClick={() => setShowColorPicker(!showColorPicker)}
      />
      
      <input
        type="text"
        className="bg-gray-700 text-white border border-yellow-600 rounded py-2 px-3 focus:outline-none focus:border-yellow-500 w-32"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="#RRGGBB"
      />
      
      {showColorPicker && (
        <div className="absolute left-0 top-12 z-10 p-2 bg-gray-800 border border-yellow-700 rounded-lg shadow-lg">
          <input
            type="color"
            value={color}
            onChange={handleColorChange}
            className="w-48 h-48 cursor-pointer"
          />
        </div>
      )}
    </div>
  );
};

export default ColorPicker;