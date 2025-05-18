import React, { useState } from 'react';
import CharacterPositioner from './CharacterPositioner';

const DialogSegmentEditor = ({ segment, onSegmentChange }) => {
  const [expanded, setExpanded] = useState(true);
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    const updatedSegment = {
      ...segment,
      [name]: value
    };
    
    onSegmentChange(updatedSegment);
  };
  
  // Handle speaker change
  const handleSpeakerChange = (e) => {
    const { value } = e.target;
    
    const updatedSegment = {
      ...segment,
      speaker: value
    };
    
    onSegmentChange(updatedSegment);
  };
  
  // Handle character changes
  const handleCharactersChange = (characters) => {
    const updatedSegment = {
      ...segment,
      characters
    };
    
    onSegmentChange(updatedSegment);
  };
  
  // Handle iframe changes
  const handleIframeChange = (iframe) => {
    const updatedSegment = {
      ...segment,
      iframe
    };
    
    onSegmentChange(updatedSegment);
  };
  
  // Toggle iframe section
  const toggleIframe = () => {
    if (!segment.iframe) {
      // Add default iframe properties
      const iframe = {
        url: "https://www.youtube.com/embed/example",
        width: "90%",
        height: "300px",
        position: "center",
        allowFullscreen: true
      };
      
      handleIframeChange(iframe);
    } else {
      // Remove iframe
      const { iframe, ...rest } = segment;
      onSegmentChange(rest);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          className="text-yellow-400 hover:text-yellow-300 focus:outline-none"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
      
      {expanded && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-yellow-400 text-sm font-bold mb-2">
                Background Image
              </label>
              <input
                type="text"
                name="background"
                value={segment.background || ''}
                onChange={handleInputChange}
                className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-2 px-3 focus:outline-none focus:border-yellow-500"
                placeholder="/assets/backgrounds/your-image.jpg"
              />
            </div>
            
            <div>
              <label className="block text-yellow-400 text-sm font-bold mb-2">
                Speaker
              </label>
              <input
                type="text"
                value={segment.speaker || ''}
                onChange={handleSpeakerChange}
                className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-2 px-3 focus:outline-none focus:border-yellow-500"
                placeholder="Character Name"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-yellow-400 text-sm font-bold mb-2">
              Dialog Text
            </label>
            <textarea
              name="text"
              value={segment.text || ''}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-2 px-3 focus:outline-none focus:border-yellow-500"
              rows="3"
              placeholder="What the character says..."
            />
          </div>
          
          <div>
            <label className="block text-yellow-400 text-sm font-bold mb-2">
              Characters
            </label>
            <CharacterPositioner 
              characters={segment.characters || {}}
              onCharactersChange={handleCharactersChange}
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id={`iframe-toggle-${segment.text?.substring(0, 10) || 'segment'}`}
              checked={!!segment.iframe}
              onChange={toggleIframe}
              className="mr-2"
            />
            <label 
              htmlFor={`iframe-toggle-${segment.text?.substring(0, 10) || 'segment'}`}
              className="text-yellow-400 text-sm font-bold"
            >
              Include embedded content (iframe)
            </label>
          </div>
          
          {segment.iframe && (
            <div className="bg-gray-900 p-3 rounded-lg">
              <h4 className="text-yellow-500 font-bold mb-2">Iframe Settings</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-yellow-400 text-xs mb-1">
                    URL
                  </label>
                  <input
                    type="text"
                    value={segment.iframe.url || ''}
                    onChange={(e) => handleIframeChange({...segment.iframe, url: e.target.value})}
                    className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-1 px-2 text-sm focus:outline-none focus:border-yellow-500"
                    placeholder="https://www.youtube.com/embed/video-id"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-yellow-400 text-xs mb-1">
                      Width
                    </label>
                    <input
                      type="text"
                      value={segment.iframe.width || ''}
                      onChange={(e) => handleIframeChange({...segment.iframe, width: e.target.value})}
                      className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-1 px-2 text-sm focus:outline-none focus:border-yellow-500"
                      placeholder="90%"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-yellow-400 text-xs mb-1">
                      Height
                    </label>
                    <input
                      type="text"
                      value={segment.iframe.height || ''}
                      onChange={(e) => handleIframeChange({...segment.iframe, height: e.target.value})}
                      className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-1 px-2 text-sm focus:outline-none focus:border-yellow-500"
                      placeholder="300px"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id={`fullscreen-${segment.text?.substring(0, 10) || 'segment'}`}
                  checked={!!segment.iframe.allowFullscreen}
                  onChange={(e) => handleIframeChange({...segment.iframe, allowFullscreen: e.target.checked})}
                  className="mr-2"
                />
                <label 
                  htmlFor={`fullscreen-${segment.text?.substring(0, 10) || 'segment'}`}
                  className="text-yellow-400 text-xs"
                >
                  Allow Fullscreen
                </label>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DialogSegmentEditor;