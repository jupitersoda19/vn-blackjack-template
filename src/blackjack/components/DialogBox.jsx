import React from 'react';

const DialogBox = ({ dialog, onNext, choices, onChoiceSelected }) => {
  if (!dialog) return null;
  
  // Check if dialog has an iframe
  const hasIframe = dialog.iframe && dialog.iframe.url;
  
  // Get iframe position
  const iframePosition = dialog.iframe?.position || 'center';
  
  // Calculate dynamic sizing based on iframe properties
  const iframeWidth = dialog.iframe?.width || '80%';
  const iframeHeight = dialog.iframe?.height || '300px';

  return (
    <div className="w-full bg-black bg-opacity-80 text-white p-4 rounded-t-lg border-t-2 border-yellow-500">
      {/* Speaker name if provided */}
      {dialog.speaker && (
        <div className="text-yellow-300 font-bold text-lg mb-1">
          {dialog.speaker}
        </div>
      )}
     
      {/* Dialog text */}
      <div className="text-lg mb-4">
        {dialog.text}
      </div>
      
      {/* Iframe container - using only Tailwind classes */}
      {hasIframe && (
        <div className={`
          mb-4 overflow-hidden relative rounded-lg shadow-lg
          ${iframePosition === 'top' ? 'absolute -top-80 left-1/2 transform -translate-x-1/2' : ''}
          ${iframePosition === 'center' ? 'mx-auto' : ''}
        `}
        style={{
          width: iframeWidth,
          height: iframeHeight
        }}>
          <iframe
            src={dialog.iframe.url}
            className="w-full h-full rounded-lg border border-yellow-700"
            frameBorder="0"
            allowFullScreen={dialog.iframe.allowFullscreen !== false}
            allow={`${dialog.iframe.autoplay ? 'autoplay;' : ''} fullscreen; picture-in-picture`}
          ></iframe>
        </div>
      )}
     
      {/* Choices if present */}
      {choices && choices.length > 0 ? (
        <div className="flex flex-col space-y-2 mt-4">
          {choices.map((choice, index) => (
            <button
              key={index}
              className="bg-yellow-700 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
              onClick={() => onChoiceSelected(choice)}
            >
              {choice.text}
            </button>
          ))}
        </div>
      ) : (
        /* Continue button if no choices */
        <div className="flex justify-end">
          <button
            className="bg-yellow-700 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded flex items-center"
            onClick={onNext}
          >
            <span>Continue</span>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default DialogBox;