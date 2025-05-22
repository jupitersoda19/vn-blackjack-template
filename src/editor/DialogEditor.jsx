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

// Available conditional templates
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

const MacroEditor = ({ macros = [], onMacrosChange }) => {
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
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-yellow-500 font-semibold">Macros</h4>
        <span className="text-xs text-gray-400">Variable updates executed when this dialog shows</span>
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
      
      <div className="text-xs text-gray-400 mt-2">
        <strong>Examples:</strong><br/>
        • <code>beCharming</code> - Set personality to charming<br/>
        • <code>increaseRelationship:victoria:5</code> - Increase Victoria's relationship by 5<br/>
        • <code>improveReputation:10</code> - Improve casino reputation by 10
      </div>
    </div>
  );
};

const ConditionsEditor = ({ conditions = [], onConditionsChange }) => {
  const [newCondition, setNewCondition] = useState('');
  
  const addCondition = () => {
    if (newCondition.trim()) {
      const updatedConditions = [...conditions, newCondition.trim()];
      onConditionsChange(updatedConditions);
      setNewCondition('');
    }
  };
  
  const removeCondition = (index) => {
    const updatedConditions = conditions.filter((_, i) => i !== index);
    onConditionsChange(updatedConditions);
  };
  
  const updateCondition = (index, value) => {
    const updatedConditions = [...conditions];
    updatedConditions[index] = value;
    onConditionsChange(updatedConditions);
  };
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-yellow-500 font-semibold">Conditions</h4>
        <span className="text-xs text-gray-400">Text added when conditions are met</span>
      </div>
      
      {conditions.map((condition, index) => (
        <div key={index} className="flex items-center space-x-2">
          <input
            type="text"
            value={condition}
            onChange={(e) => updateCondition(index, e.target.value)}
            className="flex-1 bg-gray-700 text-white border border-yellow-600 rounded py-1 px-2 text-sm focus:outline-none focus:border-yellow-500"
            placeholder="e.g., likesYou:victoria"
          />
          <button
            onClick={() => removeCondition(index)}
            className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-sm"
          >
            ✕
          </button>
        </div>
      ))}
      
      <div className="flex space-x-2">
        <input
          type="text"
          value={newCondition}
          onChange={(e) => setNewCondition(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addCondition()}
          className="flex-1 bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-sm focus:outline-none focus:border-yellow-500"
          placeholder="Add condition (e.g., isRich)"
        />
        <select
          value=""
          onChange={(e) => e.target.value && setNewCondition(e.target.value)}
          className="bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-sm focus:outline-none"
        >
          <option value="">Quick Add...</option>
          {AVAILABLE_CONDITIONS.map(condition => (
            <option key={condition} value={condition}>{condition}</option>
          ))}
        </select>
        <button
          onClick={addCondition}
          className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm"
        >
          Add
        </button>
      </div>
      
      <div className="text-xs text-gray-400 mt-2">
        <strong>Examples:</strong><br/>
        • <code>isRich</code> - Player has lots of money<br/>
        • <code>likesYou:victoria</code> - Victoria likes the player<br/>
        • <code>isVIP</code> - Player has VIP status
      </div>
    </div>
  );
};

const ConditionalTextEditor = ({ conditionalText = {}, onConditionalTextChange }) => {
  const [newCondition, setNewCondition] = useState('');
  const [newText, setNewText] = useState('');
  
  const addConditionalText = () => {
    if (newCondition.trim() && newText.trim()) {
      const updated = {
        ...conditionalText,
        [newCondition.trim()]: newText.trim()
      };
      onConditionalTextChange(updated);
      setNewCondition('');
      setNewText('');
    }
  };
  
  const removeConditionalText = (conditionKey) => {
    const updated = { ...conditionalText };
    delete updated[conditionKey];
    onConditionalTextChange(updated);
  };
  
  const updateConditionalText = (oldKey, newKey, newText) => {
    const updated = { ...conditionalText };
    if (oldKey !== newKey) {
      delete updated[oldKey];
    }
    updated[newKey] = newText;
    onConditionalTextChange(updated);
  };
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-yellow-500 font-semibold">Conditional Text</h4>
        <span className="text-xs text-gray-400">Text shown only when specific conditions are met</span>
      </div>
      
      {Object.entries(conditionalText).map(([condition, text], index) => (
        <div key={index} className="space-y-2 p-3 bg-gray-800 rounded">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={condition}
              onChange={(e) => updateConditionalText(condition, e.target.value, text)}
              className="flex-1 bg-gray-700 text-white border border-yellow-600 rounded py-1 px-2 text-sm focus:outline-none focus:border-yellow-500"
              placeholder="Condition (e.g., lovesYou:victoria)"
            />
            <button
              onClick={() => removeConditionalText(condition)}
              className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-sm"
            >
              ✕
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => updateConditionalText(condition, condition, e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-sm focus:outline-none focus:border-yellow-500"
            rows="2"
            placeholder="Text to show when condition is met"
          />
        </div>
      ))}
      
      <div className="space-y-2 p-3 bg-gray-800 rounded border-2 border-dashed border-gray-600">
        <input
          type="text"
          value={newCondition}
          onChange={(e) => setNewCondition(e.target.value)}
          className="w-full bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-sm focus:outline-none focus:border-yellow-500"
          placeholder="Condition (e.g., isRich + lovesYou:victoria)"
        />
        <textarea
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          className="w-full bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-sm focus:outline-none focus:border-yellow-500"
          rows="2"
          placeholder="Text to show when condition is met"
        />
        <button
          onClick={addConditionalText}
          className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm"
        >
          Add Conditional Text
        </button>
      </div>
      
      <div className="text-xs text-gray-400 mt-2">
        <strong>Condition Examples:</strong><br/>
        • <code>lovesYou:victoria</code> - Single condition<br/>
        • <code>isRich + isVIP</code> - Multiple conditions (both must be true)<br/>
        • <code>playerMoney &gt;= 1000</code> - Inline condition (use &gt;= for &gt;=, &lt;= for &lt;=)
      </div>
    </div>
  );
};

const DialogEditor = ({ dialogSequence, onDialogChange }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  
  const addDialog = () => {
    const newDialog = {
      background: "/assets/backgrounds/default.jpg",
      characters: {},
      speaker: "",
      text: "New dialog text"
    };
    
    const updatedSequence = [...dialogSequence, newDialog];
    onDialogChange(updatedSequence);
  };
  
  const updateDialog = (index, updatedDialog) => {
    const newSequence = [...dialogSequence];
    newSequence[index] = updatedDialog;
    onDialogChange(newSequence);
  };
  
  const deleteDialog = (index) => {
    const newSequence = dialogSequence.filter((_, i) => i !== index);
    onDialogChange(newSequence);
  };
  
  const duplicateDialog = (index) => {
    const dialogToDuplicate = { ...dialogSequence[index] };
    const newSequence = [...dialogSequence];
    newSequence.splice(index + 1, 0, dialogToDuplicate);
    onDialogChange(newSequence);
  };
  
  const moveDialog = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === dialogSequence.length - 1)
    ) {
      return;
    }
    
    const newSequence = [...dialogSequence];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newSequence[index], newSequence[targetIndex]] = 
    [newSequence[targetIndex], newSequence[index]];
    
    onDialogChange(newSequence);
    setExpandedIndex(targetIndex);
  };
  
  const handleDialogFieldChange = (index, field, value) => {
    const updatedDialog = {
      ...dialogSequence[index],
      [field]: value
    };
    updateDialog(index, updatedDialog);
  };
  
  // Handle macros change
  const handleMacrosChange = (index, macros) => {
    const updatedDialog = {
      ...dialogSequence[index],
      macros: macros.length > 0 ? macros : undefined
    };
    updateDialog(index, updatedDialog);
  };
  
  // Handle conditions change
  const handleConditionsChange = (index, conditions) => {
    const updatedDialog = {
      ...dialogSequence[index],
      conditions: conditions.length > 0 ? conditions : undefined
    };
    updateDialog(index, updatedDialog);
  };
  
  // Handle conditional text change
  const handleConditionalTextChange = (index, conditionalText) => {
    const updatedDialog = {
      ...dialogSequence[index],
      conditionalText: Object.keys(conditionalText).length > 0 ? conditionalText : undefined
    };
    updateDialog(index, updatedDialog);
  };
  
  if (dialogSequence.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-yellow-400 mb-4">No dialog entries yet.</p>
        <button
          onClick={addDialog}
          className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded"
        >
          Add First Dialog
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {dialogSequence.map((dialog, index) => (
        <div key={index} className="bg-gray-800 border border-yellow-700 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-2">
              <h4 className="text-yellow-500 font-bold">Dialog #{index + 1}</h4>
              {dialog.macros && dialog.macros.length > 0 && (
                <span className="bg-green-700 text-green-200 px-2 py-1 rounded-full text-xs">
                  {dialog.macros.length} macro{dialog.macros.length !== 1 ? 's' : ''}
                </span>
              )}
              {dialog.conditions && dialog.conditions.length > 0 && (
                <span className="bg-blue-700 text-blue-200 px-2 py-1 rounded-full text-xs">
                  {dialog.conditions.length} condition{dialog.conditions.length !== 1 ? 's' : ''}
                </span>
              )}
              {dialog.conditionalText && Object.keys(dialog.conditionalText).length > 0 && (
                <span className="bg-purple-700 text-purple-200 px-2 py-1 rounded-full text-xs">
                  {Object.keys(dialog.conditionalText).length} conditional text
                </span>
              )}
            </div>
            
            <div className="flex space-x-1">
              <button
                onClick={() => moveDialog(index, 'up')}
                disabled={index === 0}
                className="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:opacity-50 text-white px-2 py-1 rounded text-sm"
              >
                ↑
              </button>
              <button
                onClick={() => moveDialog(index, 'down')}
                disabled={index === dialogSequence.length - 1}
                className="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:opacity-50 text-white px-2 py-1 rounded text-sm"
              >
                ↓
              </button>
              <button
                onClick={() => duplicateDialog(index)}
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
                onClick={() => deleteDialog(index)}
                className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-sm"
              >
                Delete
              </button>
            </div>
          </div>
          
          {/* Basic fields - always visible */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-yellow-400 text-sm font-bold mb-1">Speaker</label>
              <input
                type="text"
                value={dialog.speaker || ''}
                onChange={(e) => handleDialogFieldChange(index, 'speaker', e.target.value)}
                className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-1 px-2 text-sm focus:outline-none focus:border-yellow-500"
                placeholder="Speaker name"
              />
            </div>
            
            <div>
              <label className="block text-yellow-400 text-sm font-bold mb-1">Background</label>
              <input
                type="text"
                value={dialog.background || ''}
                onChange={(e) => handleDialogFieldChange(index, 'background', e.target.value)}
                className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-1 px-2 text-sm focus:outline-none focus:border-yellow-500"
                placeholder="/assets/backgrounds/example.jpg"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-yellow-400 text-sm font-bold mb-1">Dialog Text</label>
            <textarea
              value={dialog.text || ''}
              onChange={(e) => handleDialogFieldChange(index, 'text', e.target.value)}
              className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-2 px-3 focus:outline-none focus:border-yellow-500"
              rows="3"
              placeholder="Dialog text..."
            />
          </div>
          
          {/* Expanded section with macros and conditions */}
          {expandedIndex === index && (
            <div className="space-y-6 border-t border-gray-600 pt-4">
              <MacroEditor 
                macros={dialog.macros || []}
                onMacrosChange={(macros) => handleMacrosChange(index, macros)}
              />
              
              <ConditionsEditor 
                conditions={dialog.conditions || []}
                onConditionsChange={(conditions) => handleConditionsChange(index, conditions)}
              />
              
              <ConditionalTextEditor 
                conditionalText={dialog.conditionalText || {}}
                onConditionalTextChange={(conditionalText) => handleConditionalTextChange(index, conditionalText)}
              />
              
              {/* Additional dialog properties */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-yellow-400 text-sm font-bold mb-1">Background Transition</label>
                  <select
                    value={dialog.backgroundTransition || 'none'}
                    onChange={(e) => handleDialogFieldChange(index, 'backgroundTransition', e.target.value)}
                    className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-1 px-2 text-sm focus:outline-none focus:border-yellow-500"
                  >
                    <option value="none">None</option>
                    <option value="fade">Fade</option>
                    <option value="slide">Slide</option>
                    <option value="fadeToBlack">Fade to Black</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-yellow-400 text-sm font-bold mb-1">Text Animation</label>
                  <select
                    value={dialog.textAnimation || 'typewriter'}
                    onChange={(e) => handleDialogFieldChange(index, 'textAnimation', e.target.value)}
                    className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-1 px-2 text-sm focus:outline-none focus:border-yellow-500"
                  >
                    <option value="typewriter">Typewriter</option>
                    <option value="fadeIn">Fade In</option>
                    <option value="instant">Instant</option>
                  </select>
                </div>
              </div>
              
              {/* Characters JSON editor */}
              <div>
                <label className="block text-yellow-400 text-sm font-bold mb-1">Characters (JSON)</label>
                <textarea
                  value={JSON.stringify(dialog.characters || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const characters = JSON.parse(e.target.value);
                      handleDialogFieldChange(index, 'characters', characters);
                    } catch (error) {
                      // Invalid JSON, don't update
                    }
                  }}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm font-mono focus:outline-none focus:border-yellow-500"
                  rows="4"
                  placeholder='{"center": {"image": "/assets/characters/character.png", "name": "Character", "emotion": "happy"}}'
                />
              </div>
            </div>
          )}
        </div>
      ))}
      
      <div className="flex justify-center">
        <button
          onClick={addDialog}
          className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
          Add Dialog
        </button>
      </div>
    </div>
  );
};

export default DialogEditor;