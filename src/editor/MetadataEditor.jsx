import React, { useState } from 'react';
import ColorPicker from './ColorPicker';

const MetadataEditor = ({ metadata, onMetadataChange }) => {
  // Local state for form handling
  const [formData, setFormData] = useState({...metadata});
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Update parent component state
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      onMetadataChange({
        ...metadata,
        [parent]: {
          ...metadata[parent],
          [child]: value
        }
      });
    } else {
      onMetadataChange({
        ...metadata,
        [name]: value
      });
    }
  };
  
  // Handle color changes
  const handleColorChange = (colorType, color) => {
    setFormData({
      ...formData,
      titleScreenTheme: {
        ...formData.titleScreenTheme,
        [colorType]: color
      }
    });
    
    onMetadataChange({
      ...metadata,
      titleScreenTheme: {
        ...metadata.titleScreenTheme,
        [colorType]: color
      }
    });
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left side - Form controls */}
      <div className="space-y-6">
        <div className="bg-gray-800 p-4 rounded-lg border border-yellow-700">
          <h3 className="text-xl font-bold text-yellow-500 mb-4">Game Information</h3>
          
          <div className="mb-4">
            <label className="block text-yellow-400 text-sm font-bold mb-2" htmlFor="title">
              Game Title
            </label>
            <input
              className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-2 px-3 focus:outline-none focus:border-yellow-500"
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter game title"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-yellow-400 text-sm font-bold mb-2" htmlFor="version">
              Version
            </label>
            <input
              className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-2 px-3 focus:outline-none focus:border-yellow-500"
              id="version"
              name="version"
              type="text"
              value={formData.version}
              onChange={handleInputChange}
              placeholder="1.0.0"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-yellow-400 text-sm font-bold mb-2" htmlFor="author">
              Author
            </label>
            <input
              className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-2 px-3 focus:outline-none focus:border-yellow-500"
              id="author"
              name="author"
              type="text"
              value={formData.author}
              onChange={handleInputChange}
              placeholder="Your name"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-yellow-400 text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-2 px-3 focus:outline-none focus:border-yellow-500"
              id="description"
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your game"
            />
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg border border-yellow-700">
          <h3 className="text-xl font-bold text-yellow-500 mb-4">Visual Theming</h3>
          
          <div className="mb-4">
            <label className="block text-yellow-400 text-sm font-bold mb-2" htmlFor="backgroundImage">
              Background Image URL
            </label>
            <input
              className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-2 px-3 focus:outline-none focus:border-yellow-500"
              id="backgroundImage"
              name="backgroundImage"
              type="text"
              value={formData.backgroundImage}
              onChange={handleInputChange}
              placeholder="/assets/backgrounds/your-image.png"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-yellow-400 text-sm font-bold mb-2">
              Primary Color
            </label>
            <ColorPicker 
              color={formData.titleScreenTheme.primaryColor} 
              onChange={(color) => handleColorChange('primaryColor', color)}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-yellow-400 text-sm font-bold mb-2">
              Secondary Color
            </label>
            <ColorPicker 
              color={formData.titleScreenTheme.secondaryColor} 
              onChange={(color) => handleColorChange('secondaryColor', color)}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-yellow-400 text-sm font-bold mb-2">
              Text Color
            </label>
            <ColorPicker 
              color={formData.titleScreenTheme.textColor} 
              onChange={(color) => handleColorChange('textColor', color)}
            />
          </div>
        </div>
      </div>
      
      {/* Right side - Preview */}
      <div>
        <div className="bg-gray-800 p-4 rounded-lg border border-yellow-700 h-full">
          <h3 className="text-xl font-bold text-yellow-500 mb-4">Title Screen Preview</h3>
          
          <div className="relative rounded-lg overflow-hidden border border-gray-700 mb-4" style={{height: '300px'}}>
            <div 
              className="absolute inset-0 bg-black bg-opacity-50"
              style={{
                backgroundImage: `url(${formData.backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center p-6 text-center">
                <h1 
                  className="text-4xl font-bold mb-4"
                  style={{ color: formData.titleScreenTheme.textColor }}
                >
                  {formData.title}
                </h1>
                
                <p 
                  className="text-lg mb-8"
                  style={{ color: formData.titleScreenTheme.textColor }}
                >
                  {formData.description}
                </p>
                
                <button
                  className="font-bold py-3 px-6 rounded-lg shadow-lg"
                  style={{ 
                    backgroundColor: formData.titleScreenTheme.primaryColor,
                    color: formData.titleScreenTheme.textColor
                  }}
                >
                  Start Game
                </button>
                
                <div className="absolute bottom-4 left-0 right-0 text-center text-sm opacity-75"
                  style={{ color: formData.titleScreenTheme.textColor }}
                >
                  Version {formData.version} | {formData.author ? `© 2025 ${formData.author}` : ''}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 p-3 rounded-lg">
            <h4 className="text-yellow-500 font-bold mb-2">Theme Colors</h4>
            <div className="flex gap-4 mb-2">
              <div>
                <div className="text-xs text-yellow-400 mb-1">Primary</div>
                <div 
                  className="w-16 h-16 rounded-lg shadow-inner"
                  style={{ backgroundColor: formData.titleScreenTheme.primaryColor }}
                ></div>
              </div>
              <div>
                <div className="text-xs text-yellow-400 mb-1">Secondary</div>
                <div 
                  className="w-16 h-16 rounded-lg shadow-inner"
                  style={{ backgroundColor: formData.titleScreenTheme.secondaryColor }}
                ></div>
              </div>
              <div>
                <div className="text-xs text-yellow-400 mb-1">Text</div>
                <div 
                  className="w-16 h-16 rounded-lg shadow-inner"
                  style={{ backgroundColor: formData.titleScreenTheme.textColor }}
                ></div>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              Preview is approximate. Check the game for exact appearance.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetadataEditor;