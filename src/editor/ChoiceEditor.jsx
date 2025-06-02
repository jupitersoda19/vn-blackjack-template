import React from 'react';
import {
  UnifiedMacroEditor,
  UnifiedConditionEditor,
  LegacyConditionEditor
} from './UnifiedMacroComponents';

const ChoiceEditor = ({
  choices,
  allEvents,
  onChoicesChange,
  availableMacros = [],
  availableTemplates = []
}) => {
 
  const addChoice = () => {
    const newChoice = {
      text: "New choice"
    };
   
    const updatedChoices = [...choices, newChoice];
    onChoicesChange(updatedChoices);
  };
 
  const updateChoice = (index, updatedChoice) => {
    const newChoices = [...choices];
    newChoices[index] = updatedChoice;
    onChoicesChange(newChoices);
  };
 
  const deleteChoice = (index) => {
    const newChoices = choices.filter((_, i) => i !== index);
    onChoicesChange(newChoices);
  };
 
  const duplicateChoice = (index) => {
    const choiceToDuplicate = { ...choices[index] };
    const newChoices = [...choices];
    newChoices.splice(index + 1, 0, choiceToDuplicate);
    onChoicesChange(newChoices);
  };
 
  const moveChoice = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === choices.length - 1)
    ) {
      return;
    }
   
    const newChoices = [...choices];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
   
    [newChoices[index], newChoices[targetIndex]] =
    [newChoices[targetIndex], newChoices[index]];
   
    onChoicesChange(newChoices);
  };
 
  const handleChoiceFieldChange = (index, field, value) => {
    const updatedChoice = {
      ...choices[index],
      [field]: value === '' ? undefined : value
    };
    updateChoice(index, updatedChoice);
  };
 
  const handleMacrosChange = (index, macros) => {
    const updatedChoice = {
      ...choices[index],
      macros: macros.length > 0 ? macros : undefined
    };
    updateChoice(index, updatedChoice);
  };
 
  const handleRequiresConditionChange = (index, condition) => {
    const updatedChoice = {
      ...choices[index],
      requiresCondition: condition === '' ? undefined : condition
    };
    updateChoice(index, updatedChoice);
  };
 
  const handleLegacyConditionChange = (index, updatedCondition) => {
    const updatedChoice = {
      ...choices[index],
      requiresCondition: updatedCondition
    };
    updateChoice(index, updatedChoice);
  };

  // Helper function to get action display info
  const getActionInfo = (action) => {
    switch (action) {
      case 'startGame':
        return { label: 'blackjack', color: 'blue', icon: '🎰' };
      case 'startDance':
        return { label: 'dance', color: 'purple', icon: '💃' };
      case 'exit':
        return { label: 'exit', color: 'red', icon: '🚪' };
      default:
        return null;
    }
  };

  // Helper function to get default event parameters based on action
  const getDefaultEventParams = (action) => {
    switch (action) {
      case 'startGame':
        return {
          playerEvent: "High Stakes Game",
          playerCost: 1000,
          player: {
            name: "Player",
            image: "/assets/characters/player.png",
            startingMoney: 1000
          },
          dealers: [
            {
              name: "Dealer",
              image: "/assets/characters/dealer.png",
              startingMoney: 5000,
              eventName: "Standard Table"
            }
          ],
          deckCount: 2,
          blackjackPayout: 1.5
        };
      case 'startDance':
        return {
          partner: "Emma",
          song: {
            bpm: 120,
            duration: 30
          },
          difficulty: "medium"
        };
      default:
        return {};
    }
  };

  // Helper function to render game-specific parameters
  const renderGameParameters = (choice, index) => {
    if (choice.action === 'startGame') {
      return (
        <div className="mt-4 pt-4 border-t border-gray-600">
          <label className="block text-yellow-400 text-xs font-bold mb-1">🎰 Blackjack Parameters (JSON)</label>
          <textarea
            value={JSON.stringify(choice.eventParams || getDefaultEventParams('startGame'), null, 2)}
            onChange={(e) => {
              try {
                const eventParams = JSON.parse(e.target.value);
                handleChoiceFieldChange(index, 'eventParams', eventParams);
              } catch (error) {
                // Invalid JSON, don't update
              }
            }}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm font-mono focus:outline-none focus:border-yellow-500"
            rows="8"
            placeholder='{\n  "playerEvent": "High Stakes Game",\n  "playerCost": 1000,\n  "specialRules": "vegas"\n}'
          />
          <div className="text-xs text-gray-400 mt-1">
            Configure blackjack parameters like stakes, opponents, and special rules.
          </div>
        </div>
      );
    }

    if (choice.action === 'startDance') {
      return (
        <div className="mt-4 pt-4 border-t border-gray-600">
          <label className="block text-yellow-400 text-xs font-bold mb-1">💃 Dance Parameters (JSON)</label>
          <textarea
            value={JSON.stringify(choice.eventParams || getDefaultEventParams('startDance'), null, 2)}
            onChange={(e) => {
              try {
                const eventParams = JSON.parse(e.target.value);
                handleChoiceFieldChange(index, 'eventParams', eventParams);
              } catch (error) {
                // Invalid JSON, don't update
              }
            }}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm font-mono focus:outline-none focus:border-yellow-500"
            rows="6"
            placeholder='{\n  "partner": "Emma",\n  "song": {\n    "bpm": 120,\n    "duration": 30\n  },\n  "difficulty": "medium"\n}'
          />
          <div className="text-xs text-gray-400 mt-1">
            Configure dance parameters like partner, BPM, duration, and difficulty.
          </div>
        </div>
      );
    }

    return null;
  };
 
  if (choices.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-yellow-400 mb-4">No choices configured for this dialog.</p>
        <button
          onClick={addChoice}
          className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded"
        >
          Add First Choice
        </button>
      </div>
    );
  }
 
  return (
    <div className="space-y-4">
      {choices.map((choice, index) => {
        const actionInfo = getActionInfo(choice.action);
        
        return (
          <div key={index} className="bg-gray-800 border border-yellow-700 rounded-lg p-4">
            {/* Header Row */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <h4 className="text-yellow-500 font-bold">Choice #{index + 1}</h4>
                {choice.macros && choice.macros.length > 0 && (
                  <span className="bg-green-700 text-green-200 px-2 py-1 rounded-full text-xs">
                    {choice.macros.length} macro{choice.macros.length !== 1 ? 's' : ''}
                  </span>
                )}
                {choice.requiresCondition && (
                  <span className="bg-orange-700 text-orange-200 px-2 py-1 rounded-full text-xs">
                    conditional
                  </span>
                )}
                {actionInfo && (
                  <span className={`bg-${actionInfo.color}-700 text-${actionInfo.color}-200 px-2 py-1 rounded-full text-xs`}>
                    {actionInfo.icon} {actionInfo.label}
                  </span>
                )}
              </div>
             
              <div className="flex space-x-1">
                <button
                  onClick={() => moveChoice(index, 'up')}
                  disabled={index === 0}
                  className="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:opacity-50 text-white px-2 py-1 rounded text-sm"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveChoice(index, 'down')}
                  disabled={index === choices.length - 1}
                  className="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:opacity-50 text-white px-2 py-1 rounded text-sm"
                >
                  ↓
                </button>
                <button
                  onClick={() => duplicateChoice(index)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-sm"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => deleteChoice(index)}
                  className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
            
            {/* Choice Text + Destination Row */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="col-span-2">
                <label className="block text-yellow-400 text-sm font-bold mb-1">💬 Choice Text</label>
                <input
                  type="text"
                  value={choice.text || ''}
                  onChange={(e) => handleChoiceFieldChange(index, 'text', e.target.value)}
                  className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-2 px-3 focus:outline-none focus:border-yellow-500"
                  placeholder="Choice text displayed to player"
                />
              </div>
             
              <div>
                <label className="block text-yellow-400 text-sm font-bold mb-1">🎯 Destination</label>
                <select
                  value={choice.nextEvent || ''}
                  onChange={(e) => handleChoiceFieldChange(index, 'nextEvent', e.target.value)}
                  className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-2 px-3 text-sm focus:outline-none focus:border-yellow-500"
                  disabled={choice.action === 'startGame' || choice.action === 'startDance' || choice.action === 'exit'}
                >
                  <option value="">None</option>
                  {allEvents.map((event) => (
                    <option key={event.key} value={event.key}>
                      {event.title} ({event.key})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Side-by-Side: Effects and Requirements */}
            <div className="grid grid-cols-2 gap-6">
             
              {/* Left Column - Effects */}
              <div className="bg-gray-900 rounded-lg p-4">
                <h5 className="text-yellow-400 font-semibold mb-3 flex items-center">
                  🔧 Effects
                  <span className="ml-2 text-xs text-gray-400">(When selected)</span>
                </h5>
               
                {/* Action Type */}
                <div className="mb-3">
                  <label className="block text-yellow-400 text-xs font-bold mb-1">Action Type</label>
                  <select
                    value={choice.action || ''}
                    onChange={(e) => {
                      const newAction = e.target.value;
                      const updatedChoice = {
                        ...choice,
                        action: newAction === '' ? undefined : newAction
                      };
                      
                      // Set default event parameters when action changes
                      if (newAction === 'startGame' || newAction === 'startDance') {
                        updatedChoice.eventParams = choice.eventParams || getDefaultEventParams(newAction);
                      } else if (newAction === '' || newAction === 'exit') {
                        // Remove eventParams for non-game actions
                        delete updatedChoice.eventParams;
                      }
                      
                      updateChoice(index, updatedChoice);
                    }}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-sm focus:outline-none focus:border-yellow-500"
                  >
                    <option value="">Navigate to Event</option>
                    <option value="startGame">🎰 Start Blackjack Game</option>
                    <option value="startDance">💃 Start Dance Game</option>
                    <option value="exit">🚪 Exit Game</option>
                  </select>
                </div>
                
                {/* Macros */}
                <UnifiedMacroEditor
                  macros={choice.macros || []}
                  onMacrosChange={(macros) => handleMacrosChange(index, macros)}
                  availableMacros={availableMacros}
                  compact={true}
                  title="Macros"
                  description="Actions when choice selected"
                />
                
                {/* Game Parameters */}
                {renderGameParameters(choice, index)}
                
                {/* Reset Variables Option */}
                <div className="mt-4 pt-4 border-t border-gray-600">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={choice.resetVariables || false}
                      onChange={(e) => handleChoiceFieldChange(index, 'resetVariables', e.target.checked)}
                      className="bg-gray-700 border border-gray-600 rounded"
                    />
                    <span className="text-yellow-400 text-xs">Reset all variables when selected</span>
                  </label>
                </div>
              </div>
              
              {/* Right Column - Requirements */}
              <div className="bg-gray-900 rounded-lg p-4">
                <h5 className="text-yellow-400 font-semibold mb-3 flex items-center">
                  ⚠️ Requirements
                  <span className="ml-2 text-xs text-gray-400">(When available)</span>
                </h5>
                <UnifiedConditionEditor
                  condition={choice.requiresCondition}
                  onConditionChange={(condition) => handleRequiresConditionChange(index, condition)}
                  availableTemplates={availableTemplates}
                  compact={true}
                  title="Requires Condition"
                  placeholder="e.g., isRich or likesYou:victoria"
                />
                
                {/* Condition Status */}
                <div className="mt-3 bg-gray-800 rounded p-3">
                  <div className="text-sm">
                    {choice.requiresCondition ? (
                      <>
                        <div className="font-mono text-orange-300 text-xs mb-2">
                          {choice.requiresCondition}
                        </div>
                        <div className="flex items-center text-xs">
                          <span className="text-yellow-400">⚠️ Conditional choice</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center text-xs">
                        <span className="text-green-400">✅ Always available</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Legacy condition editor */}
                {choice.requiresCondition && typeof choice.requiresCondition === 'object' && (
                  <div className="mt-4 pt-4 border-t border-gray-600">
                    <LegacyConditionEditor
                      condition={choice.requiresCondition}
                      onConditionChange={(updatedCondition) => handleLegacyConditionChange(index, updatedCondition)}
                      compact={true}
                    />
                  </div>
                )}
                
                {/* Additional Info */}
                <div className="mt-4 pt-4 border-t border-gray-600">
                  <div className="text-xs text-gray-400">
                    <div className="mb-1">
                      <strong>Destination:</strong> {choice.nextEvent || choice.action || 'None'}
                    </div>
                    {choice.action === 'startGame' && (
                      <div className="mb-1">
                        <strong>Game Cost:</strong> ${choice.eventParams?.playerCost || 'Not set'}
                      </div>
                    )}
                    {choice.action === 'startDance' && (
                      <>
                        <div className="mb-1">
                          <strong>Dance Partner:</strong> {choice.eventParams?.partner || 'Not set'}
                        </div>
                        <div className="mb-1">
                          <strong>Difficulty:</strong> {choice.eventParams?.difficulty || 'Not set'}
                        </div>
                        <div className="mb-1">
                          <strong>BPM:</strong> {choice.eventParams?.song?.bpm || 'Not set'}
                        </div>
                      </>
                    )}
                    <div>
                      <strong>Effects:</strong> {choice.macros?.length || 0} macro{(choice.macros?.length || 0) !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
     
      <div className="flex justify-center">
        <button
          onClick={addChoice}
          className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded flex items-center"
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