import React, { useState, useEffect, useRef } from 'react';
import DialogEditor from './DialogEditor';
import ChoiceEditor from './ChoiceEditor';

// Basic activity detection helper
const detectActivity = (event) => {
  const allChoices = [];
  
  // Collect choices from pre-dialog
  if (event.preDialog) {
    event.preDialog.forEach(dialog => {
      if (dialog.choices) {
        allChoices.push(...dialog.choices);
      }
    });
  }
  
  // Collect choices from post-dialog  
  if (event.postDialog) {
    event.postDialog.forEach(dialog => {
      if (dialog.choices) {
        allChoices.push(...dialog.choices);
      }
    });
  }
  
  // Find activity-triggering choices
  const activities = allChoices.filter(choice => choice.action);
  
  return {
    hasActivity: activities.length > 0,
    activities,
    hasPreDialog: event.preDialog && event.preDialog.length > 0,
    hasPostDialog: event.postDialog && event.postDialog.length > 0
  };
};

// Enhanced Activity Editor component for center column
const ActivityEditor = ({ activityInfo, eventTitle, event, onEventChange }) => {
  const [editingActivity, setEditingActivity] = useState(null);
  
  if (!activityInfo.hasActivity) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center border-2 border-dashed border-gray-600">
        <div className="text-gray-400 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h4 className="text-gray-400 font-semibold mb-1">No Activity</h4>
        <p className="text-gray-500 text-sm">Add choices with actions to enable activities</p>
        <div className="mt-4 text-xs text-gray-500">
          <div className="mb-2"><strong>Available Actions:</strong></div>
          <div>🎰 startGame - Blackjack Game</div>
          <div>💃 startDance - Dance Game</div>
          <div>🎯 startDart - Dart Game</div>
          <div>🚪 exit - Exit Game</div>
        </div>
      </div>
    );
  }
  
  const getActivityIcon = (action) => {
    switch (action) {
      case 'startGame': return '🎰';
      case 'startDance': return '💃';
      case 'startDart': return '🎯';
      case 'exit': return '🚪';
      default: return '⚡';
    }
  };
  
  const getActivityLabel = (action) => {
    switch (action) {
      case 'startGame': return 'Blackjack Game';
      case 'startDance': return 'Dance Game';
      case 'startDart': return 'Dart Game';
      case 'exit': return 'Exit Game';
      default: return 'Custom Action';
    }
  };
  
  const getActivityColor = (action) => {
    switch (action) {
      case 'startGame': return 'blue';
      case 'startDance': return 'purple';
      case 'startDart': return 'green';
      case 'exit': return 'red';
      default: return 'yellow';
    }
  };
  
  // Find and update activity parameters
  const updateActivityParams = (activityIndex, newParams) => {
    const activity = activityInfo.activities[activityIndex];
    
    // Find the choice in the event and update its eventParams
    const updateChoice = (choices) => {
      return choices.map(choice => {
        if (choice.action === activity.action && choice.text === activity.text) {
          return { ...choice, eventParams: newParams };
        }
        return choice;
      });
    };
    
    let updatedEvent = { ...event };
    
    // Update preDialog choices
    if (event.preDialog) {
      updatedEvent.preDialog = event.preDialog.map(dialog => ({
        ...dialog,
        choices: dialog.choices ? updateChoice(dialog.choices) : dialog.choices
      }));
    }
    
    // Update postDialog choices
    if (event.postDialog) {
      updatedEvent.postDialog = event.postDialog.map(dialog => ({
        ...dialog,
        choices: dialog.choices ? updateChoice(dialog.choices) : dialog.choices
      }));
    }
    
    onEventChange(updatedEvent);
  };
  
  return (
    <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-yellow-500">
      <h4 className="text-yellow-500 font-semibold mb-3 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Activity Flow
      </h4>
      
      <div className="space-y-3">
        {activityInfo.activities.map((activity, index) => {
          const color = getActivityColor(activity.action);
          const isEditing = editingActivity === index;
          
          return (
            <div key={index} className={`bg-${color}-900 bg-opacity-50 rounded-lg p-3 border border-${color}-700`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getActivityIcon(activity.action)}</span>
                  <span className={`text-${color}-300 font-semibold text-sm`}>
                    {getActivityLabel(activity.action)}
                  </span>
                </div>
                <button
                  onClick={() => setEditingActivity(isEditing ? null : index)}
                  className={`px-2 py-1 rounded text-xs ${
                    isEditing 
                      ? 'bg-green-600 hover:bg-green-500 text-white' 
                      : `bg-${color}-700 hover:bg-${color}-600 text-${color}-200`
                  }`}
                >
                  {isEditing ? '✓ Done' : '⚙️ Edit'}
                </button>
              </div>
              
              <div className="text-gray-300 text-sm mb-2">
                <strong>Choice:</strong> "{activity.text}"
              </div>
              
              {/* Activity Parameters Editor */}
              {activity.eventParams && (
                <div className="mt-3">
                  {isEditing ? (
                    <div className="bg-gray-700 rounded p-3">
                      <h5 className="text-yellow-400 text-sm font-semibold mb-2">Edit Parameters</h5>
                      
                      {/* Blackjack Game Parameters */}
                      {activity.action === 'startGame' && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-gray-300 text-xs mb-1">Stakes ($)</label>
                            <input
                              type="number"
                              value={activity.eventParams.playerCost || ''}
                              onChange={(e) => {
                                const newParams = {
                                  ...activity.eventParams,
                                  playerCost: parseInt(e.target.value) || 0
                                };
                                updateActivityParams(index, newParams);
                              }}
                              className="w-full bg-gray-600 text-white border border-gray-500 rounded py-1 px-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-xs mb-1">Deck Count</label>
                            <input
                              type="number"
                              value={activity.eventParams.deckCount || ''}
                              onChange={(e) => {
                                const newParams = {
                                  ...activity.eventParams,
                                  deckCount: parseInt(e.target.value) || 2
                                };
                                updateActivityParams(index, newParams);
                              }}
                              className="w-full bg-gray-600 text-white border border-gray-500 rounded py-1 px-2 text-sm"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-gray-300 text-xs mb-1">Event Name</label>
                            <input
                              type="text"
                              value={activity.eventParams.playerEvent || ''}
                              onChange={(e) => {
                                const newParams = {
                                  ...activity.eventParams,
                                  playerEvent: e.target.value
                                };
                                updateActivityParams(index, newParams);
                              }}
                              className="w-full bg-gray-600 text-white border border-gray-500 rounded py-1 px-2 text-sm"
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Dance Game Parameters */}
                      {activity.action === 'startDance' && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-gray-300 text-xs mb-1">Partner</label>
                            <input
                              type="text"
                              value={activity.eventParams.partner || ''}
                              onChange={(e) => {
                                const newParams = {
                                  ...activity.eventParams,
                                  partner: e.target.value
                                };
                                updateActivityParams(index, newParams);
                              }}
                              className="w-full bg-gray-600 text-white border border-gray-500 rounded py-1 px-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-xs mb-1">Difficulty</label>
                            <select
                              value={activity.eventParams.difficulty || 'medium'}
                              onChange={(e) => {
                                const newParams = {
                                  ...activity.eventParams,
                                  difficulty: e.target.value
                                };
                                updateActivityParams(index, newParams);
                              }}
                              className="w-full bg-gray-600 text-white border border-gray-500 rounded py-1 px-2 text-sm"
                            >
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-gray-300 text-xs mb-1">BPM</label>
                            <input
                              type="number"
                              value={activity.eventParams.song?.bpm || ''}
                              onChange={(e) => {
                                const newParams = {
                                  ...activity.eventParams,
                                  song: {
                                    ...activity.eventParams.song,
                                    bpm: parseInt(e.target.value) || 120
                                  }
                                };
                                updateActivityParams(index, newParams);
                              }}
                              className="w-full bg-gray-600 text-white border border-gray-500 rounded py-1 px-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-xs mb-1">Duration (sec)</label>
                            <input
                              type="number"
                              value={activity.eventParams.song?.duration || ''}
                              onChange={(e) => {
                                const newParams = {
                                  ...activity.eventParams,
                                  song: {
                                    ...activity.eventParams.song,
                                    duration: parseInt(e.target.value) || 30
                                  }
                                };
                                updateActivityParams(index, newParams);
                              }}
                              className="w-full bg-gray-600 text-white border border-gray-500 rounded py-1 px-2 text-sm"
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Dart Game Parameters */}
                      {activity.action === 'startDart' && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-gray-300 text-xs mb-1">Opponent Name</label>
                            <input
                              type="text"
                              value={activity.eventParams.opponentName || ''}
                              onChange={(e) => {
                                const newParams = {
                                  ...activity.eventParams,
                                  opponentName: e.target.value
                                };
                                updateActivityParams(index, newParams);
                              }}
                              className="w-full bg-gray-600 text-white border border-gray-500 rounded py-1 px-2 text-sm"
                              placeholder="e.g., Morgan"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-xs mb-1">Opponent Skill</label>
                            <select
                              value={activity.eventParams.opponentSkill || 'medium'}
                              onChange={(e) => {
                                const newParams = {
                                  ...activity.eventParams,
                                  opponentSkill: e.target.value
                                };
                                updateActivityParams(index, newParams);
                              }}
                              className="w-full bg-gray-600 text-white border border-gray-500 rounded py-1 px-2 text-sm"
                            >
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-gray-300 text-xs mb-1">Darts Per Player</label>
                            <input
                              type="number"
                              value={activity.eventParams.dartsPerPlayer || ''}
                              onChange={(e) => {
                                const newParams = {
                                  ...activity.eventParams,
                                  dartsPerPlayer: parseInt(e.target.value) || 9
                                };
                                updateActivityParams(index, newParams);
                              }}
                              className="w-full bg-gray-600 text-white border border-gray-500 rounded py-1 px-2 text-sm"
                              placeholder="e.g., 9"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-xs mb-1">Game Mode</label>
                            <select
                              value={activity.eventParams.gameMode || 'highest_score'}
                              onChange={(e) => {
                                const newParams = {
                                  ...activity.eventParams,
                                  gameMode: e.target.value
                                };
                                updateActivityParams(index, newParams);
                              }}
                              className="w-full bg-gray-600 text-white border border-gray-500 rounded py-1 px-2 text-sm"
                            >
                              <option value="highest_score">Highest Score</option>
                              <option value="501">501 Classic</option>
                              <option value="301">301 Quick</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-xs">
                      {/* Blackjack Display */}
                      {activity.action === 'startGame' && (
                        <>
                          <div><strong>Stakes:</strong> ${activity.eventParams.playerCost || 'Not set'}</div>
                          <div><strong>Decks:</strong> {activity.eventParams.deckCount || 'Default'}</div>
                          <div><strong>Event:</strong> {activity.eventParams.playerEvent || 'Default'}</div>
                        </>
                      )}
                      
                      {/* Dance Display */}
                      {activity.action === 'startDance' && (
                        <>
                          <div><strong>Partner:</strong> {activity.eventParams.partner || 'Not set'}</div>
                          <div><strong>Difficulty:</strong> {activity.eventParams.difficulty || 'Not set'}</div>
                          <div><strong>BPM:</strong> {activity.eventParams.song?.bpm || 'Not set'}</div>
                          <div><strong>Duration:</strong> {activity.eventParams.song?.duration || 'Not set'}s</div>
                        </>
                      )}
                      
                      {/* Dart Display */}
                      {activity.action === 'startDart' && (
                        <>
                          <div><strong>Opponent:</strong> {activity.eventParams.opponentName || 'Not set'}</div>
                          <div><strong>Skill Level:</strong> {activity.eventParams.opponentSkill || 'Not set'}</div>
                          <div><strong>Darts Per Player:</strong> {activity.eventParams.dartsPerPlayer || 'Not set'}</div>
                          <div><strong>Game Mode:</strong> {activity.eventParams.gameMode || 'Not set'}</div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {activity.macros && activity.macros.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {activity.macros.map((macro, mIndex) => (
                    <span key={mIndex} className="bg-green-800 text-green-200 px-2 py-1 rounded-full text-xs">
                      {macro}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {activityInfo.hasPostDialog && (
        <div className="mt-4 p-3 bg-gray-700 rounded-lg">
          <div className="flex items-center text-yellow-400 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
            </svg>
            Activity results flow to Post-Dialog
          </div>
        </div>
      )}
    </div>
  );
};

const EventEditor = ({ event, allEvents = [], onEventChange }) => {
  const [localEvent, setLocalEvent] = useState({ ...event });
  const [selectedDialogIndex, setSelectedDialogIndex] = useState(null);
  const [dialogType, setDialogType] = useState('pre'); // 'pre' or 'post'
  const [activityInfo, setActivityInfo] = useState({});
  
  // Use useRef to track the previous event key
  const prevEventKeyRef = useRef(event.key);
  
  // Update local state when the selected event changes
  useEffect(() => {
    // Only reset selectedDialogIndex if we're switching to a completely different event
    const isDifferentEvent = event.key !== prevEventKeyRef.current;
    
    setLocalEvent({ ...event });
    if (isDifferentEvent) {
      setSelectedDialogIndex(null);
    }
    setActivityInfo(detectActivity(event));
    
    // Update the ref for next time
    prevEventKeyRef.current = event.key;
  }, [event]);
  
  // Update activity info when dialogs change
  useEffect(() => {
    setActivityInfo(detectActivity(localEvent));
  }, [localEvent.preDialog, localEvent.postDialog]);

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
      {/* Event Properties - Full Width */}
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
      
      {/* Three Column Layout */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column - Pre-Dialog */}
        <div className="col-span-4">
          <div className="bg-gray-900 p-4 rounded-lg h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-yellow-500">Pre-Dialog</h3>
              <span className="bg-yellow-700 text-yellow-200 px-2 py-1 rounded-full text-xs">
                {(localEvent.preDialog || []).length} dialogs
              </span>
            </div>
            <p className="text-yellow-400 text-sm mb-4">
              Dialog shown before any game action takes place.
            </p>
            
            <DialogEditor
              dialogSequence={localEvent.preDialog || []}
              onDialogChange={handlePreDialogChange}
              allEvents={allEvents}
              onSelectForChoices={selectDialogForChoices}
              dialogType="pre"
              selectedIndex={selectedDialogIndex}
              selectedType={dialogType}
            />
          </div>
        </div>
        
        {/* Center Column - Activity Flow */}
        <div className="col-span-4">
          <div className="sticky top-4">
            <ActivityEditor 
              activityInfo={activityInfo} 
              eventTitle={localEvent.title}
              event={localEvent}
              onEventChange={(updatedEvent) => {
                setLocalEvent(updatedEvent);
                onEventChange(updatedEvent);
              }}
            />
            
            {/* Flow indicators */}
            <div className="flex items-center justify-center my-4 text-gray-400">
              <div className="flex items-center space-x-2">
                <span className="text-sm">Pre</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                </svg>
                <span className="text-sm">Activity</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                </svg>
                <span className="text-sm">Post</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Post-Dialog */}
        <div className="col-span-4">
          <div className="bg-gray-900 p-4 rounded-lg h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-yellow-500">Post-Dialog</h3>
              <span className="bg-yellow-700 text-yellow-200 px-2 py-1 rounded-full text-xs">
                {(localEvent.postDialog || []).length} dialogs
              </span>
            </div>
            <p className="text-yellow-400 text-sm mb-4">
              Dialog shown after the game action is completed.
            </p>
            
            {(localEvent.postDialog || []).length > 0 ? (
              <DialogEditor
                dialogSequence={localEvent.postDialog || []}
                onDialogChange={handlePostDialogChange}
                allEvents={allEvents}
                onSelectForChoices={selectDialogForChoices}
                dialogType="post"
                selectedIndex={selectedDialogIndex}
                selectedType={dialogType}
              />
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-gray-400 mb-4">No post-dialog yet.</p>
                <button
                  onClick={() => {
                    const updatedEvent = {
                      ...localEvent,
                      postDialog: []
                    };
                    setLocalEvent(updatedEvent);
                    onEventChange(updatedEvent);
                  }}
                  className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded flex items-center mx-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  Add Post-Dialog Section
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Choice Editor - Full Width when dialog selected */}
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
    </div>
  );
};

export default EventEditor;