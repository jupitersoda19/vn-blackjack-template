import React, { useState, useEffect } from 'react';
import DialogEditor from './DialogEditor';
import ChoiceEditor from './ChoiceEditor';

const EventEditor = ({ event, allEvents = [], onEventChange }) => {
  const [localEvent, setLocalEvent] = useState({ ...event });
  const [selectedDialogIndex, setSelectedDialogIndex] = useState(null);
  const [dialogType, setDialogType] = useState('pre'); // 'pre' or 'post'
  
  // Update local state when the selected event changes
  useEffect(() => {
    setLocalEvent({ ...event });
    setSelectedDialogIndex(null);
  }, [event]);

  // Handle basic input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    const updatedEvent = {
      ...localEvent,
      [name]: value
    };
    
    setLocalEvent(updatedEvent);
    onEventChange(updatedEvent);
  };
  
  // Handle changes to preDialog
  const handlePreDialogChange = (newPreDialog) => {
    const updatedEvent = {
      ...localEvent,
      preDialog: newPreDialog
    };
    
    setLocalEvent(updatedEvent);
    onEventChange(updatedEvent);
  };
  
  // Handle changes to postDialog
  const handlePostDialogChange = (newPostDialog) => {
    const updatedEvent = {
      ...localEvent,
      postDialog: newPostDialog
    };
    
    setLocalEvent(updatedEvent);
    onEventChange(updatedEvent);
  };
  
  // Get choices from the currently selected dialog
  const getSelectedDialogChoices = () => {
    if (selectedDialogIndex === null) return [];
    
    const dialogArray = dialogType === 'pre' ? 
      (localEvent.preDialog || []) : 
      (localEvent.postDialog || []);
    
    if (dialogArray[selectedDialogIndex]) {
      return dialogArray[selectedDialogIndex].choices || [];
    }
    return [];
  };

  // Update choices in the selected dialog
  const handleChoicesChange = (newChoices) => {
    if (selectedDialogIndex === null) return;
    
    const dialogArray = dialogType === 'pre' ? 'preDialog' : 'postDialog';
    
    const updatedDialogs = [...(localEvent[dialogArray] || [])];
    updatedDialogs[selectedDialogIndex] = {
      ...updatedDialogs[selectedDialogIndex],
      choices: newChoices
    };
    
    const updatedEvent = {
      ...localEvent,
      [dialogArray]: updatedDialogs
    };
    
    setLocalEvent(updatedEvent);
    onEventChange(updatedEvent);
  };

  // Handler to select a dialog for editing choices
  const selectDialogForChoices = (index, type) => {
    setSelectedDialogIndex(index);
    setDialogType(type);
  };

  // Handle nextEvent change
  const handleNextEventChange = (e) => {
    const value = e.target.value;
    
    const updatedEvent = {
      ...localEvent,
      nextEvent: value === '' ? null : value
    };
    
    setLocalEvent(updatedEvent);
    onEventChange(updatedEvent);
  };
  
  // Clear dialog selection
  const clearDialogSelection = () => {
    setSelectedDialogIndex(null);
  };
  
  // Add editor tags
  const handleEditorTagsChange = (e) => {
    const tagsValue = e.target.value;
    const tagsArray = tagsValue.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    const updatedEvent = {
      ...localEvent,
      editorTags: tagsArray.length > 0 ? tagsArray : undefined
    };
    
    setLocalEvent(updatedEvent);
    onEventChange(updatedEvent);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 p-4 rounded-lg">
        <h3 className="text-xl font-bold text-yellow-500 mb-4">Event Properties</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-yellow-400 text-sm font-bold mb-2" htmlFor="event-title">
              Event Title
            </label>
            <input
              id="event-title"
              name="title"
              type="text"
              value={localEvent.title || ''}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-2 px-3 focus:outline-none focus:border-yellow-500"
              placeholder="Event Title"
            />
          </div>
          
          <div>
            <label className="block text-yellow-400 text-sm font-bold mb-2" htmlFor="event-key">
              Event Key (Unique ID)
            </label>
            <input
              id="event-key"
              name="key"
              type="text"
              value={localEvent.key || ''}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-2 px-3 focus:outline-none focus:border-yellow-500"
              placeholder="unique_key"
            />
          </div>
          
          <div>
            <label className="block text-yellow-400 text-sm font-bold mb-2" htmlFor="next-event">
              Default Next Event
            </label>
            <select
              id="next-event"
              value={localEvent.nextEvent || ''}
              onChange={handleNextEventChange}
              className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-2 px-3 focus:outline-none focus:border-yellow-500"
            >
              <option value="">None (End or Choice-driven)</option>
              {allEvents && allEvents.map((e, index) => (
                <option key={index} value={e.key}>
                  {e.title} ({e.key})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-yellow-400 text-sm font-bold mb-2" htmlFor="editor-tags">
              Editor Tags (comma separated)
            </label>
            <input
              id="editor-tags"
              name="editorTags"
              type="text"
              value={(localEvent.editorTags || []).join(', ')}
              onChange={handleEditorTagsChange}
              className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-2 px-3 focus:outline-none focus:border-yellow-500"
              placeholder="beginning, tutorial, etc"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-gray-900 p-4 rounded-lg">
        <h3 className="text-xl font-bold text-yellow-500 mb-4">Pre-Dialog Sequence</h3>
        <p className="text-yellow-400 text-sm mb-4">
          This dialog is shown before any game action takes place.
        </p>
        
        <DialogEditor
          dialogSequence={localEvent.preDialog || []}
          onDialogChange={handlePreDialogChange}
        />
        
        {/* Dialog selection for choices editing */}
        <div className="mt-4 p-3 bg-gray-800 rounded-lg">
          <h4 className="text-yellow-500 font-bold mb-2">Edit Choices for Pre-Dialog:</h4>
          {(localEvent.preDialog || []).length === 0 ? (
            <p className="text-gray-400 text-sm">No pre-dialog entries to edit choices for.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {(localEvent.preDialog || []).map((dialog, index) => (
                <button
                  key={`pre-${index}`}
                  onClick={() => selectDialogForChoices(index, 'pre')}
                  className={`p-2 text-sm rounded-lg ${
                    selectedDialogIndex === index && dialogType === 'pre' 
                      ? 'bg-yellow-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Pre-Dialog #{index + 1}
                  {dialog.choices && dialog.choices.length > 0 && 
                    <span className="ml-1 bg-yellow-700 text-yellow-200 px-1 rounded-full text-xs">
                      {dialog.choices.length}
                    </span>
                  }
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Post-Dialog Section */}
      {(localEvent.postDialog || []).length > 0 && (
        <div className="bg-gray-900 p-4 rounded-lg">
          <h3 className="text-xl font-bold text-yellow-500 mb-4">Post-Dialog Sequence</h3>
          <p className="text-yellow-400 text-sm mb-4">
            This dialog is shown after the game action is completed.
          </p>
          
          <DialogEditor
            dialogSequence={localEvent.postDialog || []}
            onDialogChange={handlePostDialogChange}
          />
          
          {/* Dialog selection for choices editing */}
          <div className="mt-4 p-3 bg-gray-800 rounded-lg">
            <h4 className="text-yellow-500 font-bold mb-2">Edit Choices for Post-Dialog:</h4>
            <div className="grid grid-cols-3 gap-2">
              {(localEvent.postDialog || []).map((dialog, index) => (
                <button
                  key={`post-${index}`}
                  onClick={() => selectDialogForChoices(index, 'post')}
                  className={`p-2 text-sm rounded-lg ${
                    selectedDialogIndex === index && dialogType === 'post' 
                      ? 'bg-yellow-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Post-Dialog #{index + 1}
                  {dialog.choices && dialog.choices.length > 0 && 
                    <span className="ml-1 bg-yellow-700 text-yellow-200 px-1 rounded-full text-xs">
                      {dialog.choices.length}
                    </span>
                  }
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Show the ChoiceEditor only when a dialog is selected */}
      {selectedDialogIndex !== null && (
        <div className="bg-gray-900 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-yellow-500">
              Edit Choices for {dialogType === 'pre' ? 'Pre' : 'Post'}-Dialog #{selectedDialogIndex + 1}
            </h3>
            <button
              onClick={clearDialogSelection}
              className="bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-1 px-3 rounded text-sm"
            >
              Close Choices Editor
            </button>
          </div>
          
          <div className="p-4 bg-gray-800 rounded-lg mb-4">
            <h4 className="text-yellow-500 font-semibold mb-2">Dialog Text (For Reference):</h4>
            <p className="text-gray-300 italic">
              {dialogType === 'pre' 
                ? (localEvent.preDialog?.[selectedDialogIndex]?.text || "No text") 
                : (localEvent.postDialog?.[selectedDialogIndex]?.text || "No text")}
            </p>
          </div>
          
          <ChoiceEditor
            choices={getSelectedDialogChoices()}
            allEvents={allEvents || []}
            onChoicesChange={handleChoicesChange}
          />
        </div>
      )}
      
      {/* Add Post-Dialog Section button */}
      {!localEvent.postDialog && (
        <div className="flex justify-center">
          <button
            onClick={() => {
              const updatedEvent = {
                ...localEvent,
                postDialog: []
              };
              setLocalEvent(updatedEvent);
              onEventChange(updatedEvent);
            }}
            className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            Add Post-Dialog Section
          </button>
        </div>
      )}
    </div>
  );
};

export default EventEditor;