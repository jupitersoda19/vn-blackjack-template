import React from 'react';

// You'll need to replace this with your actual drag-and-drop implementation
// (either react-beautiful-dnd with legacy-peer-deps or @dnd-kit)
// For this example, I'll create a simple version without drag functionality
const ChoiceEditor = ({ choices = [], allEvents = [], onChoicesChange }) => {
  // Add a new choice
  const addChoice = () => {
    const newChoice = {
      text: "New choice",
      nextEvent: null
    };
    
    onChoicesChange([...choices, newChoice]);
  };
  
  // Remove a choice
  const removeChoice = (index) => {
    const newChoices = [...choices];
    newChoices.splice(index, 1);
    onChoicesChange(newChoices);
  };
  
  // Update a choice
  const updateChoice = (index, field, value) => {
    const newChoices = [...choices];
    
    // Handle different field types
    if (field === 'action' && value === 'nextEvent') {
      // Convert to nextEvent type
      const { action, eventParams, ...rest } = newChoices[index];
      newChoices[index] = {
        ...rest,
        nextEvent: null
      };
    } else if (field === 'action' && value === 'startGame') {
      // Convert to startGame type
      const { nextEvent, ...rest } = newChoices[index];
      newChoices[index] = {
        ...rest,
        action: 'startGame',
        eventParams: {
          playerEvent: "Game Event",
          playerCost: 100,
          opponentIndices: [1],
          opponentEvents: [
            { name: "Opponent Event", cost: 500 }
          ]
        }
      };
    } else if (field === 'action' && value === 'exit') {
      // Convert to exit type
      const { nextEvent, ...rest } = newChoices[index];
      newChoices[index] = {
        ...rest,
        action: 'exit'
      };
    } else if (field.startsWith('eventParams.')) {
      // Handle nested eventParams fields
      const subField = field.split('.')[1];
      newChoices[index] = {
        ...newChoices[index],
        eventParams: {
          ...newChoices[index].eventParams,
          [subField]: value
        }
      };
    } else {
      // Handle regular fields
      newChoices[index] = {
        ...newChoices[index],
        [field]: value
      };
    }
    
    onChoicesChange(newChoices);
  };

  // Debug info - log choices to console to verify data flow
  console.log("Choices received in ChoiceEditor:", choices);
  
  return (
    <div>
      <div className="space-y-4">
        {choices.length === 0 ? (
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <p className="text-yellow-400">No choices yet. Add your first choice!</p>
          </div>
        ) : (
          choices.map((choice, index) => (
            <div
              key={index}
              className="bg-gray-800 p-4 rounded-lg border border-gray-700"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="cursor-move bg-gray-700 p-1 rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
                
                <span className="text-yellow-500 font-semibold">Choice #{index + 1}</span>
                
                <button
                  onClick={() => removeChoice(index)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-yellow-400 text-sm font-bold mb-2">
                    Choice Text
                  </label>
                  <input
                    type="text"
                    value={choice.text || ''}
                    onChange={(e) => updateChoice(index, 'text', e.target.value)}
                    className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-2 px-3 focus:outline-none focus:border-yellow-500"
                    placeholder="What the player can choose..."
                  />
                </div>
                
                <div>
                  <label className="block text-yellow-400 text-sm font-bold mb-2">
                    Action Type
                  </label>
                  <select
                    value={choice.action || (choice.nextEvent !== undefined ? 'nextEvent' : '')}
                    onChange={(e) => updateChoice(index, 'action', e.target.value)}
                    className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-2 px-3 focus:outline-none focus:border-yellow-500"
                  >
                    <option value="nextEvent">Go to Next Event</option>
                    <option value="startGame">Start Game (Blackjack)</option>
                    <option value="exit">Exit Game</option>
                  </select>
                </div>
                
                {/* Show appropriate fields based on action type */}
                {(!choice.action || choice.action === 'nextEvent' || choice.nextEvent !== undefined) && (
                  <div>
                    <label className="block text-yellow-400 text-sm font-bold mb-2">
                      Next Event
                    </label>
                    <select
                      value={choice.nextEvent || ''}
                      onChange={(e) => updateChoice(index, 'nextEvent', e.target.value || null)}
                      className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-2 px-3 focus:outline-none focus:border-yellow-500"
                    >
                      <option value="">None (End)</option>
                      {allEvents.map((event, eventIndex) => (
                        <option key={eventIndex} value={event.key}>
                          {event.title} ({event.key})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {choice.action === 'startGame' && (
                  <div className="bg-gray-900 p-3 rounded-lg space-y-3">
                    <h5 className="text-yellow-500 font-bold">Game Parameters</h5>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-yellow-400 text-xs mb-1">
                          Player Event Name
                        </label>
                        <input
                          type="text"
                          value={choice.eventParams?.playerEvent || ''}
                          onChange={(e) => updateChoice(index, 'eventParams.playerEvent', e.target.value)}
                          className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-1 px-2 text-sm focus:outline-none focus:border-yellow-500"
                          placeholder="Player Event"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-yellow-400 text-xs mb-1">
                          Player Cost
                        </label>
                        <input
                          type="number"
                          value={choice.eventParams?.playerCost || 0}
                          onChange={(e) => updateChoice(index, 'eventParams.playerCost', parseInt(e.target.value))}
                          className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-1 px-2 text-sm focus:outline-none focus:border-yellow-500"
                          placeholder="100"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-yellow-400 text-xs mb-1">
                          Opponent Indices (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={(choice.eventParams?.opponentIndices || []).join(',')}
                          onChange={(e) => updateChoice(index, 'eventParams.opponentIndices', 
                            e.target.value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v))
                          )}
                          className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-1 px-2 text-sm focus:outline-none focus:border-yellow-500"
                          placeholder="1,2,3"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-yellow-400 text-xs mb-1">
                          Special Rules
                        </label>
                        <input
                          type="text"
                          value={choice.eventParams?.specialRules || ''}
                          onChange={(e) => updateChoice(index, 'eventParams.specialRules', e.target.value)}
                          className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-1 px-2 text-sm focus:outline-none focus:border-yellow-500"
                          placeholder="Rules variant"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-yellow-400 text-xs mb-1">
                        Opponent Events (Advanced)
                      </label>
                      <textarea
                        value={JSON.stringify(choice.eventParams?.opponentEvents || [], null, 2)}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            if (Array.isArray(parsed)) {
                              updateChoice(index, 'eventParams.opponentEvents', parsed);
                            }
                          } catch (error) {
                            // Invalid JSON, don't update
                            console.error("Invalid JSON for opponent events:", error);
                          }
                        }}
                        className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-1 px-2 text-sm focus:outline-none focus:border-yellow-500 font-mono"
                        rows="3"
                        placeholder='[{ "name": "Opponent Event", "cost": 500 }]'
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-4">
        <button
          onClick={addChoice}
          className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
          Add Choice
        </button>
      </div>
    </div>
  );
};

export default ChoiceEditor;