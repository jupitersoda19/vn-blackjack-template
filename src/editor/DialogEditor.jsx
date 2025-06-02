import React, { useState } from 'react';
import {
  UnifiedMacroEditor,
  UnifiedConditionEditor
} from './UnifiedMacroComponents';

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

// Individual Dialog Card Component
const DialogCard = ({ 
  dialog, 
  index, 
  onUpdate, 
  onDelete, 
  onDuplicate, 
  onMove, 
  onSelectForChoices,
  dialogType,
  selectedIndex,
  selectedType,
  canMoveUp, 
  canMoveDown,
  availableMacros = [],
  availableTemplates = []
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const isSelected = selectedIndex === index && selectedType === dialogType;
  
  const handleFieldChange = (field, value) => {
    const updatedDialog = {
      ...dialog,
      [field]: value
    };
    onUpdate(updatedDialog);
  };
  
  // Handle macros change
  const handleMacrosChange = (macros) => {
    const updatedDialog = {
      ...dialog,
      macros: macros.length > 0 ? macros : undefined
    };
    onUpdate(updatedDialog);
  };
  
  // Handle conditions change
  const handleConditionsChange = (conditions) => {
    const updatedDialog = {
      ...dialog,
      conditions: conditions.length > 0 ? conditions : undefined
    };
    onUpdate(updatedDialog);
  };
  
  // Handle conditional text change
  const handleConditionalTextChange = (conditionalText) => {
    const updatedDialog = {
      ...dialog,
      conditionalText: Object.keys(conditionalText).length > 0 ? conditionalText : undefined
    };
    onUpdate(updatedDialog);
  };
  
  const choiceCount = dialog.choices ? dialog.choices.length : 0;
  const hasChoices = choiceCount > 0;
  const hasMacros = dialog.macros && dialog.macros.length > 0;
  const hasConditions = dialog.conditions && dialog.conditions.length > 0;
  const hasConditionalText = dialog.conditionalText && Object.keys(dialog.conditionalText).length > 0;
  
  return (
    <div className={`bg-gray-800 border rounded-lg p-4 ${isSelected ? 'border-yellow-500' : 'border-gray-700'}`}>
      {/* Card Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2 flex-1">
          <h4 className="text-yellow-500 font-bold">#{index + 1}</h4>
          
          {/* Status Badges */}
          <div className="flex flex-wrap gap-1">
            {hasMacros && (
              <span className="bg-green-700 text-green-200 px-2 py-1 rounded-full text-xs">
                {dialog.macros.length} macro{dialog.macros.length !== 1 ? 's' : ''}
              </span>
            )}
            {hasConditions && (
              <span className="bg-blue-700 text-blue-200 px-2 py-1 rounded-full text-xs">
                {dialog.conditions.length} condition{dialog.conditions.length !== 1 ? 's' : ''}
              </span>
            )}
            {hasConditionalText && (
              <span className="bg-purple-700 text-purple-200 px-2 py-1 rounded-full text-xs">
                {Object.keys(dialog.conditionalText).length} conditional text
              </span>
            )}
            {hasChoices && (
              <span className="bg-orange-700 text-orange-200 px-2 py-1 rounded-full text-xs">
                {choiceCount} choice{choiceCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-1">
          <button
            onClick={() => onMove('up')}
            disabled={!canMoveUp}
            className="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:opacity-50 text-white px-2 py-1 rounded text-sm"
            title="Move up"
          >
            ↑
          </button>
          <button
            onClick={() => onMove('down')}
            disabled={!canMoveDown}
            className="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:opacity-50 text-white px-2 py-1 rounded text-sm"
            title="Move down"
          >
            ↓
          </button>
          <button
            onClick={onDuplicate}
            className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-sm"
            title="Duplicate"
          >
            ⧉
          </button>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`${showAdvanced ? 'bg-yellow-600' : 'bg-gray-600'} hover:bg-yellow-500 text-white px-2 py-1 rounded text-sm`}
            title="Advanced options"
          >
            ⚙
          </button>
          <button
            onClick={onDelete}
            className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-sm"
            title="Delete"
          >
            ✕
          </button>
        </div>
      </div>
      
      {/* Speaker & Background */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label className="block text-yellow-400 text-xs font-bold mb-1">Speaker</label>
          <input
            type="text"
            value={dialog.speaker || ''}
            onChange={(e) => handleFieldChange('speaker', e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-sm focus:outline-none focus:border-yellow-500"
            placeholder="Speaker name"
          />
        </div>
        
        <div>
          <label className="block text-yellow-400 text-xs font-bold mb-1">Background</label>
          <input
            type="text"
            value={dialog.background || ''}
            onChange={(e) => handleFieldChange('background', e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-sm focus:outline-none focus:border-yellow-500"
            placeholder="/assets/backgrounds/..."
          />
        </div>
      </div>
      
      {/* Dialog Text */}
      <div className="mb-3">
        <label className="block text-yellow-400 text-xs font-bold mb-1">Dialog Text</label>
        <textarea
          value={dialog.text || ''}
          onChange={(e) => handleFieldChange('text', e.target.value)}
          className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 focus:outline-none focus:border-yellow-500"
          rows="2"
          placeholder="Dialog text..."
        />
      </div>
      
      {/* Choices Quick Access */}
      {hasChoices && (
        <div className="mb-3 p-2 bg-gray-700 rounded">
          <div className="flex items-center justify-between">
            <span className="text-orange-300 text-sm font-semibold">
              {choiceCount} Choice{choiceCount !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => onSelectForChoices(index, dialogType)}
              className={`${isSelected ? 'bg-orange-600' : 'bg-orange-700'} hover:bg-orange-500 text-white px-3 py-1 rounded text-sm`}
            >
              {isSelected ? 'Editing Choices' : 'Edit Choices'}
            </button>
          </div>
          
          {/* Choice Preview */}
          <div className="mt-2 space-y-1">
            {dialog.choices.slice(0, 2).map((choice, choiceIndex) => (
              <div key={choiceIndex} className="text-xs text-gray-300 truncate">
                • {choice.text || 'Untitled choice'}
              </div>
            ))}
            {choiceCount > 2 && (
              <div className="text-xs text-gray-400">
                ... and {choiceCount - 2} more
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Add Choices Button */}
      {!hasChoices && (
        <div className="mb-3">
          <button
            onClick={() => {
              const updatedDialog = {
                ...dialog,
                choices: [{ text: "New choice" }]
              };
              onUpdate(updatedDialog);
            }}
            className="w-full bg-orange-700 hover:bg-orange-600 text-white py-2 px-3 rounded text-sm border-2 border-dashed border-orange-600"
          >
            + Add Choices
          </button>
        </div>
      )}
      
      {/* Advanced Section */}
      {showAdvanced && (
        <div className="border-t border-gray-600 pt-3 space-y-4">
          {/* Unified Macro Editor */}
          <UnifiedMacroEditor 
            macros={dialog.macros || []}
            onMacrosChange={handleMacrosChange}
            availableMacros={availableMacros}
            compact={true}
            title="Macros"
            description="Variable updates when this dialog shows"
          />
          
          {/* Unified Conditions Editor */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-yellow-500 font-semibold text-sm">Conditions</h4>
              <span className="text-xs text-gray-400">Text added when conditions are met</span>
            </div>
            
            {(dialog.conditions || []).map((condition, condIndex) => (
              <div key={condIndex} className="bg-gray-700 rounded p-2 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <UnifiedConditionEditor
                      condition={condition}
                      onConditionChange={(newCondition) => {
                        const updatedConditions = [...(dialog.conditions || [])];
                        updatedConditions[condIndex] = newCondition;
                        handleConditionsChange(updatedConditions);
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
                      handleConditionsChange(updatedConditions);
                    }}
                    className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-xs ml-2"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            
            <button
              onClick={() => {
                const updatedConditions = [...(dialog.conditions || []), ''];
                handleConditionsChange(updatedConditions);
              }}
              className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm"
            >
              Add Condition
            </button>
          </div>
          
          <ConditionalTextEditor 
            conditionalText={dialog.conditionalText || {}}
            onConditionalTextChange={handleConditionalTextChange}
          />
          
          {/* Additional dialog properties */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-yellow-400 text-xs font-bold mb-1">Background Transition</label>
              <select
                value={dialog.backgroundTransition || 'none'}
                onChange={(e) => handleFieldChange('backgroundTransition', e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-sm focus:outline-none focus:border-yellow-500"
              >
                <option value="none">None</option>
                <option value="fade">Fade</option>
                <option value="slide">Slide</option>
                <option value="fadeToBlack">Fade to Black</option>
              </select>
            </div>
            
            <div>
              <label className="block text-yellow-400 text-xs font-bold mb-1">Text Animation</label>
              <select
                value={dialog.textAnimation || 'typewriter'}
                onChange={(e) => handleFieldChange('textAnimation', e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-sm focus:outline-none focus:border-yellow-500"
              >
                <option value="typewriter">Typewriter</option>
                <option value="fadeIn">Fade In</option>
                <option value="instant">Instant</option>
              </select>
            </div>
          </div>
          
          {/* Characters JSON editor */}
          <div>
            <label className="block text-yellow-400 text-xs font-bold mb-1">Characters (JSON)</label>
            <textarea
              value={JSON.stringify(dialog.characters || {}, null, 2)}
              onChange={(e) => {
                try {
                  const characters = JSON.parse(e.target.value);
                  handleFieldChange('characters', characters);
                } catch (error) {
                  // Invalid JSON, don't update
                }
              }}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-xs font-mono focus:outline-none focus:border-yellow-500"
              rows="3"
              placeholder='{"center": {"image": "/assets/characters/character.png", "name": "Character"}}'
            />
          </div>
        </div>
      )}
    </div>
  );
};

const DialogEditor = ({
  dialogSequence,
  onDialogChange,
  allEvents,
  availableMacros = [],
  availableTemplates = [],
  onSelectForChoices,
  dialogType,
  selectedIndex,
  selectedType
}) => {
  
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
  };
  
  if (dialogSequence.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="text-gray-400 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-gray-400 mb-4 text-sm">No dialog entries yet.</p>
        <button
          onClick={addDialog}
          className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-3 rounded text-sm"
        >
          Add First Dialog
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {dialogSequence.map((dialog, index) => (
        <DialogCard
          key={index}
          dialog={dialog}
          index={index}
          onUpdate={(updatedDialog) => updateDialog(index, updatedDialog)}
          onDelete={() => deleteDialog(index)}
          onDuplicate={() => duplicateDialog(index)}
          onMove={(direction) => moveDialog(index, direction)}
          onSelectForChoices={onSelectForChoices}
          dialogType={dialogType}
          selectedIndex={selectedIndex}
          selectedType={selectedType}
          canMoveUp={index > 0}
          canMoveDown={index < dialogSequence.length - 1}
          availableMacros={availableMacros}
          availableTemplates={availableTemplates}
        />
      ))}
      
      <div className="text-center pt-2">
        <button
          onClick={addDialog}
          className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded flex items-center mx-auto text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
          Add Dialog
        </button>
      </div>
    </div>
  );
};

export default DialogEditor;