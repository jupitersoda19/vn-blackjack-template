import React, { useState } from 'react';

// Available macro functions for dropdown
const AVAILABLE_MACROS = [
  'increaseRelationship',
  'decreaseRelationship', 
  'setRelationshipLevel',
  'addWinnings',
  'addLosses',
  'beCharming',
  'beAggressive',
  'beNeutral',
  'improveReputation',
  'damageReputation',
  'unlockAchievement',
  'successfulDate',
  'badImpression',
  'increaseVisitCount',
  'addGamePlayed'
];

// Available conditional templates for requiresCondition
const AVAILABLE_CONDITIONS = [
  'likesYou',
  'lovesYou', 
  'dislikes',
  'hates',
  'isRich',
  'isBroke',
  'hasModestFunds',
  'isCharming',
  'isAggressive',
  'isVIP',
  'isNewbie',
  'isRegular',
  'isWinning',
  'isLosing'
];

const MacroEditor = ({ macros = [], onMacrosChange, compact = false }) => {
  const [newMacro, setNewMacro] = useState('');
  
  const addMacro = () => {
    if (newMacro.trim()) {
      const updatedMacros = [...macros, newMacro.trim()];
      onMacrosChange(updatedMacros);
      setNewMacro('');
    }
  };
  
  const removeMacro = (index) => {
    const updatedMacros = macros.filter((_, i) => i !== index);
    onMacrosChange(updatedMacros);
  };
  
  const updateMacro = (index, value) => {
    const updatedMacros = [...macros];
    updatedMacros[index] = value;
    onMacrosChange(updatedMacros);
  };
  
  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-yellow-400 text-sm font-bold">Macros</label>
          <span className="text-xs text-gray-400">Actions when choice selected</span>
        </div>
        
        {macros.map((macro, index) => (
          <div key={index} className="flex items-center space-x-1">
            <input
              type="text"
              value={macro}
              onChange={(e) => updateMacro(index, e.target.value)}
              className="flex-1 bg-gray-700 text-white border border-yellow-600 rounded py-1 px-2 text-xs focus:outline-none focus:border-yellow-500"
              placeholder="e.g., increaseRelationship:victoria:5"
            />
            <button
              onClick={() => removeMacro(index)}
              className="bg-red-600 hover:bg-red-500 text-white px-1 py-1 rounded text-xs"
            >
              ✕
            </button>
          </div>
        ))}
        
        <div className="flex space-x-1">
          <input
            type="text"
            value={newMacro}
            onChange={(e) => setNewMacro(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addMacro()}
            className="flex-1 bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-xs focus:outline-none focus:border-yellow-500"
            placeholder="Add macro"
          />
          <select
            value=""
            onChange={(e) => e.target.value && setNewMacro(e.target.value)}
            className="bg-gray-700 text-white border border-gray-600 rounded py-1 px-1 text-xs focus:outline-none"
          >
            <option value="">+</option>
            {AVAILABLE_MACROS.map(macro => (
              <option key={macro} value={macro}>{macro}</option>
            ))}
          </select>
          <button
            onClick={addMacro}
            className="bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded text-xs"
          >
            Add
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-yellow-500 font-semibold">Macros</h4>
        <span className="text-xs text-gray-400">Actions executed when this choice is selected</span>
      </div>
      
      {macros.map((macro, index) => (
        <div key={index} className="flex items-center space-x-2">
          <input
            type="text"
            value={macro}
            onChange={(e) => updateMacro(index, e.target.value)}
            className="flex-1 bg-gray-700 text-white border border-yellow-600 rounded py-1 px-2 text-sm focus:outline-none focus:border-yellow-500"
            placeholder="e.g., increaseRelationship:victoria:5"
          />
          <button
            onClick={() => removeMacro(index)}
            className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-sm"
          >
            ✕
          </button>
        </div>
      ))}
      
      <div className="flex space-x-2">
        <input
          type="text"
          value={newMacro}
          onChange={(e) => setNewMacro(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addMacro()}
          className="flex-1 bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-sm focus:outline-none focus:border-yellow-500"
          placeholder="Add macro (e.g., beCharming)"
        />
        <select
          value=""
          onChange={(e) => e.target.value && setNewMacro(e.target.value)}
          className="bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-sm focus:outline-none"
        >
          <option value="">Quick Add...</option>
          {AVAILABLE_MACROS.map(macro => (
            <option key={macro} value={macro}>{macro}</option>
          ))}
        </select>
        <button
          onClick={addMacro}
          className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm"
        >
          Add
        </button>
      </div>
    </div>
  );
};

const ChoiceEditor = ({ choices, allEvents, onChoicesChange }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  
  const addChoice = () => {
    const newChoice = {
      text: "New choice"
    };
    
    const updatedChoices = [...choices, newChoice];
    onChoicesChange(updatedChoices);
    setExpandedIndex(updatedChoices.length - 1);
  };
  
  const updateChoice = (index, updatedChoice) => {
    const newChoices = [...choices];
    newChoices[index] = updatedChoice;
    onChoicesChange(newChoices);
  };
  
  const deleteChoice = (index) => {
    const newChoices = choices.filter((_, i) => i !== index);
    onChoicesChange(newChoices);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else if (expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1);
    }
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
    setExpandedIndex(targetIndex);
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
  
  // Handle legacy requiresCondition object
  const handleLegacyConditionChange = (index, field, value) => {
    const currentChoice = choices[index];
    let requiresCondition = currentChoice.requiresCondition;
    
    // Convert string condition to object if needed
    if (typeof requiresCondition === 'string') {
      requiresCondition = {
        variable: 'playerMoney',
        operator: '>=',
        value: 1000
      };
    } else if (!requiresCondition) {
      requiresCondition = {
        variable: 'playerMoney', 
        operator: '>=',
        value: 1000
      };
    }
    
    // Update the specific field
    requiresCondition = {
      ...requiresCondition,
      [field]: field === 'value' ? (isNaN(parseFloat(value)) ? value : parseFloat(value)) : value
    };
    
    const updatedChoice = {
      ...currentChoice,
      requiresCondition
    };
    updateChoice(index, updatedChoice);
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
      {choices.map((choice, index) => (
        <div key={index} className="bg-gray-800 border border-yellow-700 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
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
              {choice.action === 'startGame' && (
                <span className="bg-blue-700 text-blue-200 px-2 py-1 rounded-full text-xs">
                  game
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
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                className="bg-yellow-600 hover:bg-yellow-500 text-white px-2 py-1 rounded text-sm"
              >
                {expandedIndex === index ? 'Collapse' : 'Expand'}
              </button>
              <button
                onClick={() => deleteChoice(index)}
                className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-sm"
              >
                Delete
              </button>
            </div>
          </div>
          
          {/* Basic choice text - always visible */}
          <div className="mb-4">
            <label className="block text-yellow-400 text-sm font-bold mb-1">Choice Text</label>
            <input
              type="text"
              value={choice.text || ''}
              onChange={(e) => handleChoiceFieldChange(index, 'text', e.target.value)}
              className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-2 px-3 focus:outline-none focus:border-yellow-500"
              placeholder="Choice text displayed to player"
            />
          </div>
          
          {/* Quick settings - always visible */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-yellow-400 text-sm font-bold mb-1">Action</label>
              <select
                value={choice.action || ''}
                onChange={(e) => handleChoiceFieldChange(index, 'action', e.target.value)}
                className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-1 px-2 text-sm focus:outline-none focus:border-yellow-500"
              >
                <option value="">Navigate to Event</option>
                <option value="startGame">Start Game</option>
                <option value="exit">Exit Game</option>
              </select>
            </div>
            
            <div>
              <label className="block text-yellow-400 text-sm font-bold mb-1">Next Event</label>
              <select
                value={choice.nextEvent || ''}
                onChange={(e) => handleChoiceFieldChange(index, 'nextEvent', e.target.value)}
                className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-1 px-2 text-sm focus:outline-none focus:border-yellow-500"
                disabled={choice.action === 'startGame' || choice.action === 'exit'}
              >
                <option value="">None</option>
                {allEvents.map((event) => (
                  <option key={event.key} value={event.key}>
                    {event.title} ({event.key})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-yellow-400 text-sm font-bold mb-1">Requires Condition</label>
              <div className="flex space-x-1">
                <input
                  type="text"
                  value={typeof choice.requiresCondition === 'string' ? choice.requiresCondition : ''}
                  onChange={(e) => handleRequiresConditionChange(index, e.target.value)}
                  className="flex-1 bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-sm focus:outline-none focus:border-yellow-500"
                  placeholder="e.g., isRich"
                />
                <select
                  value=""
                  onChange={(e) => e.target.value && handleRequiresConditionChange(index, e.target.value)}
                  className="bg-gray-700 text-white border border-gray-600 rounded py-1 px-1 text-sm focus:outline-none"
                >
                  <option value="">+</option>
                  {AVAILABLE_CONDITIONS.map(condition => (
                    <option key={condition} value={condition}>{condition}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Compact macros display */}
          <MacroEditor 
            macros={choice.macros || []}
            onMacrosChange={(macros) => handleMacrosChange(index, macros)}
            compact={true}
          />
          
          {/* Expanded section */}
          {expandedIndex === index && (
            <div className="space-y-4 border-t border-gray-600 pt-4 mt-4">
              
              {/* Legacy condition editor */}
              {choice.requiresCondition && typeof choice.requiresCondition === 'object' && (
                <div className="space-y-2">
                  <h4 className="text-yellow-500 font-semibold">Legacy Condition (Object Format)</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-yellow-400 text-xs font-bold mb-1">Variable</label>
                      <input
                        type="text"
                        value={choice.requiresCondition.variable || ''}
                        onChange={(e) => handleLegacyConditionChange(index, 'variable', e.target.value)}
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-xs focus:outline-none focus:border-yellow-500"
                        placeholder="playerMoney"
                      />
                    </div>
                    <div>
                      <label className="block text-yellow-400 text-xs font-bold mb-1">Operator</label>
                      <select
                        value={choice.requiresCondition.operator || '>='}
                        onChange={(e) => handleLegacyConditionChange(index, 'operator', e.target.value)}
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-xs focus:outline-none"
                      >
                        <option value=">=">&gt;=</option>
                        <option value="<=">&lt;=</option>
                        <option value=">">&gt;</option>
                        <option value="<">&lt;</option>
                        <option value="==">=</option>
                        <option value="!=">!=</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-yellow-400 text-xs font-bold mb-1">Value</label>
                      <input
                        type="text"
                        value={choice.requiresCondition.value || ''}
                        onChange={(e) => handleLegacyConditionChange(index, 'value', e.target.value)}
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-xs focus:outline-none focus:border-yellow-500"
                        placeholder="1000"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Game parameters for startGame action */}
              {choice.action === 'startGame' && (
                <div className="space-y-3">
                  <h4 className="text-yellow-500 font-semibold">Game Parameters</h4>
                  <div className="space-y-2">
                    <label className="block text-yellow-400 text-sm font-bold mb-1">Event Parameters (JSON)</label>
                    <textarea
                      value={JSON.stringify(choice.eventParams || {}, null, 2)}
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
                      placeholder='{\n  "playerEvent": "High Stakes Game",\n  "playerCost": 1000,\n  "opponentIndices": [1],\n  "specialRules": "vegas"\n}'
                    />
                    <div className="text-xs text-gray-400">
                      Configure game parameters like stakes, opponents, and special rules.
                    </div>
                  </div>
                </div>
              )}
              
              {/* Reset variables option */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`resetVariables-${index}`}
                  checked={choice.resetVariables || false}
                  onChange={(e) => handleChoiceFieldChange(index, 'resetVariables', e.target.checked)}
                  className="bg-gray-700 border border-gray-600 rounded"
                />
                <label htmlFor={`resetVariables-${index}`} className="text-yellow-400 text-sm">
                  Reset all variables when this choice is selected
                </label>
              </div>
            </div>
          )}
        </div>
      ))}
      
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