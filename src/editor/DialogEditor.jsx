import React, { useState } from 'react';
import { 
  UnifiedMacroEditor, 
  UnifiedConditionEditor 
} from './UnifiedMacroComponents';
import ChoiceEditor from './ChoiceEditor';

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

const DialogEditor = ({ 
  dialogSequence, 
  onDialogChange, 
  allEvents,
  availableMacros = [],
  availableTemplates = []
}) => {
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
  
  // Handle macros change using unified component
  const handleMacrosChange = (index, macros) => {
    const updatedDialog = {
      ...dialogSequence[index],
      macros: macros.length > 0 ? macros : undefined
    };
    updateDialog(index, updatedDialog);
  };
  
  // Handle conditions change using unified component  
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

  // Handle choices change
  const handleChoicesChange = (index, choices) => {
    const updatedDialog = {
      ...dialogSequence[index],
      choices: choices.length > 0 ? choices : undefined
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
              {dialog.choices && dialog.choices.length > 0 && (
                <span className="bg-orange-700 text-orange-200 px-2 py-1 rounded-full text-xs">
                  {dialog.choices.length} choice{dialog.choices.length !== 1 ? 's' : ''}
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
          
          {/* Expanded section with unified components */}
          {expandedIndex === index && (
            <div className="space-y-6 border-t border-gray-600 pt-4">
              {/* Unified Macro Editor */}
              <UnifiedMacroEditor 
                macros={dialog.macros || []}
                onMacrosChange={(macros) => handleMacrosChange(index, macros)}
                availableMacros={availableMacros}
                compact={false}
                title="Macros"
                description="Variable updates executed when this dialog shows"
              />
              
              {/* Unified Conditions Editor - Multiple conditions */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-yellow-500 font-semibold">Conditions</h4>
                  <span className="text-xs text-gray-400">Text added when conditions are met</span>
                </div>
                
                {(dialog.conditions || []).map((condition, condIndex) => (
                  <div key={condIndex} className="bg-gray-700 rounded p-3 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <UnifiedConditionEditor
                          condition={condition}
                          onConditionChange={(newCondition) => {
                            const updatedConditions = [...(dialog.conditions || [])];
                            updatedConditions[condIndex] = newCondition;
                            handleConditionsChange(index, updatedConditions);
                          }}
                          availableTemplates={availableTemplates}
                          compact={true}
                          title=""
                          placeholder="e.g., likesYou:victoria"
                        />
                      </div>
                      <button
                        onClick={() => {
                          const updatedConditions = (dialog.conditions || []).filter((_, i) => i !== condIndex);
                          handleConditionsChange(index, updatedConditions);
                        }}
                        className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-sm ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={() => {
                    const updatedConditions = [...(dialog.conditions || []), ''];
                    handleConditionsChange(index, updatedConditions);
                  }}
                  className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm"
                >
                  Add Condition
                </button>
              </div>
              
              <ConditionalTextEditor 
                conditionalText={dialog.conditionalText || {}}
                onConditionalTextChange={(conditionalText) => handleConditionalTextChange(index, conditionalText)}
              />
              
              {/* Choices Editor */}
              {dialog.choices && dialog.choices.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-yellow-500 font-semibold">Choices</h4>
                  <ChoiceEditor
                    choices={dialog.choices}
                    allEvents={allEvents}
                    onChoicesChange={(choices) => handleChoicesChange(index, choices)}
                    availableMacros={availableMacros}
                    availableTemplates={availableTemplates}
                  />
                </div>
              )}
              
              {/* Add choices if none exist */}
              {(!dialog.choices || dialog.choices.length === 0) && (
                <div className="text-center">
                  <button
                    onClick={() => handleChoicesChange(index, [{ text: "New choice" }])}
                    className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded"
                  >
                    Add Choices
                  </button>
                </div>
              )}
              
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