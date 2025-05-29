import React, { useState } from 'react';

// Unified Macro Editor Component
const UnifiedMacroEditor = ({ 
  macros = [], 
  onMacrosChange, 
  availableMacros = [],
  compact = false,
  title = "Macros",
  description = "Actions executed when this triggers"
}) => {
  const [newMacro, setNewMacro] = useState('');
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedMacro, setSelectedMacro] = useState('');
  const [macroParams, setMacroParams] = useState('');
  
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

  const buildMacro = () => {
    if (selectedMacro) {
      const macroCall = macroParams.trim() ? 
        `${selectedMacro}:${macroParams.replace(/,\s*/g, ':')}` : 
        selectedMacro;
      const updatedMacros = [...macros, macroCall];
      onMacrosChange(updatedMacros);
      setSelectedMacro('');
      setMacroParams('');
      setShowBuilder(false);
    }
  };

  // Parse macro call for display
  const parseMacroCall = (macroCall) => {
    const parts = macroCall.split(':');
    return {
      name: parts[0],
      params: parts.slice(1)
    };
  };

  // Get parameter suggestions based on macro name
  const getParameterSuggestions = (macroName) => {
    const suggestions = {
      'increaseRelationship': 'character, amount (e.g., victoria, 5)',
      'decreaseRelationship': 'character, amount (e.g., rachel, 3)',
      'improveReputation': 'amount (e.g., 10)',
      'damageReputation': 'amount (e.g., 5)',
      'unlockAchievement': 'achievement_name (e.g., first_win)',
      'successfulDate': 'character (e.g., victoria)',
      'badImpression': 'character (e.g., rachel)',
      'addGamePlayed': 'game_type (e.g., blackjack)',
      'addWinnings': 'amount (e.g., 500)',
      'addLosses': 'amount (e.g., 200)'
    };
    return suggestions[macroName] || 'param1, param2';
  };
  
  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-yellow-400 text-sm font-bold">{title}</label>
          <span className="text-xs text-gray-400">{description}</span>
        </div>
        
        {macros.map((macro, index) => {
          const parsed = parseMacroCall(macro);
          return (
            <div key={index} className="bg-gray-700 rounded p-2 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="font-bold text-green-300 text-xs">{parsed.name}</span>
                    {parsed.params.length > 0 && (
                      <span className="ml-1 text-blue-300 text-xs">
                        ({parsed.params.join(', ')})
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={macro}
                    onChange={(e) => updateMacro(index, e.target.value)}
                    className="w-full bg-gray-600 text-white border border-gray-500 rounded py-1 px-2 text-xs mt-1"
                    placeholder="e.g., increaseRelationship:victoria:5"
                  />
                </div>
                <button
                  onClick={() => removeMacro(index)}
                  className="bg-red-600 hover:bg-red-500 text-white px-1 py-1 rounded text-xs ml-2"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
        
        <div className="bg-gray-800 rounded p-2 border border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-yellow-400 font-semibold text-xs">Quick Add</span>
            {availableMacros.length > 0 && (
              <button
                onClick={() => setShowBuilder(!showBuilder)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs"
              >
                {showBuilder ? 'Text' : 'Builder'}
              </button>
            )}
          </div>

          {showBuilder && availableMacros.length > 0 ? (
            <div className="space-y-2">
              <select
                value={selectedMacro}
                onChange={(e) => {
                  setSelectedMacro(e.target.value);
                  setMacroParams('');
                }}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-xs"
              >
                <option value="">Choose macro...</option>
                {availableMacros.map(macro => (
                  <option key={macro} value={macro}>{macro}</option>
                ))}
              </select>
              
              {selectedMacro && (
                <div>
                  <input
                    type="text"
                    value={macroParams}
                    onChange={(e) => setMacroParams(e.target.value)}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-xs"
                    placeholder={getParameterSuggestions(selectedMacro)}
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    Preview: <code>{macroParams.trim() ? `${selectedMacro}:${macroParams.replace(/,\s*/g, ':')}` : selectedMacro}</code>
                  </div>
                </div>
              )}
              
              <button
                onClick={buildMacro}
                disabled={!selectedMacro}
                className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white px-2 py-1 rounded text-xs"
              >
                Add
              </button>
            </div>
          ) : (
            <div className="flex space-x-1">
              <input
                type="text"
                value={newMacro}
                onChange={(e) => setNewMacro(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addMacro()}
                className="flex-1 bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-xs"
                placeholder="Add macro"
              />
              {availableMacros.length > 0 && (
                <select
                  value=""
                  onChange={(e) => e.target.value && setNewMacro(e.target.value)}
                  className="bg-gray-700 text-white border border-gray-600 rounded py-1 px-1 text-xs"
                >
                  <option value="">+</option>
                  {availableMacros.map(macro => (
                    <option key={macro} value={macro}>{macro}</option>
                  ))}
                </select>
              )}
              <button
                onClick={addMacro}
                className="bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded text-xs"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Full-size version
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-yellow-500 font-semibold">{title}</h4>
        <span className="text-xs text-gray-400">{description}</span>
      </div>
      
      {macros.map((macro, index) => {
        const parsed = parseMacroCall(macro);
        return (
          <div key={index} className="bg-gray-700 rounded p-3 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="font-bold text-green-300">{parsed.name}</span>
                  {parsed.params.length > 0 && (
                    <span className="ml-2 text-blue-300 text-sm">
                      ({parsed.params.join(', ')})
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={macro}
                  onChange={(e) => updateMacro(index, e.target.value)}
                  className="w-full bg-gray-600 text-white border border-gray-500 rounded py-2 px-3 text-sm"
                  placeholder="e.g., increaseRelationship:victoria:5"
                />
              </div>
              <button
                onClick={() => removeMacro(index)}
                className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded text-sm ml-3"
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}
      
      <div className="bg-gray-800 rounded p-4 border border-gray-600">
        <div className="flex items-center justify-between mb-3">
          <span className="text-yellow-400 font-semibold">Quick Add</span>
          {availableMacros.length > 0 && (
            <button
              onClick={() => setShowBuilder(!showBuilder)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm"
            >
              {showBuilder ? 'Text Mode' : 'Builder Mode'}
            </button>
          )}
        </div>

        {showBuilder && availableMacros.length > 0 ? (
          <div className="space-y-3">
            <div>
              <label className="block text-yellow-400 text-sm mb-1">Select Macro</label>
              <select
                value={selectedMacro}
                onChange={(e) => {
                  setSelectedMacro(e.target.value);
                  setMacroParams('');
                }}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm"
              >
                <option value="">Choose a macro...</option>
                {availableMacros.map(macro => (
                  <option key={macro} value={macro}>{macro}</option>
                ))}
              </select>
            </div>
            
            {selectedMacro && (
              <div>
                <label className="block text-yellow-400 text-sm mb-1">Parameters (comma-separated)</label>
                <input
                  type="text"
                  value={macroParams}
                  onChange={(e) => setMacroParams(e.target.value)}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm"
                  placeholder={getParameterSuggestions(selectedMacro)}
                />
                <div className="text-xs text-gray-400 mt-2">
                  Preview: <code className="bg-gray-700 px-2 py-1 rounded">
                    {macroParams.trim() ? `${selectedMacro}:${macroParams.replace(/,\s*/g, ':')}` : selectedMacro}
                  </code>
                </div>
              </div>
            )}
            
            <button
              onClick={buildMacro}
              disabled={!selectedMacro}
              className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white px-4 py-2 rounded text-sm"
            >
              Add Macro
            </button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMacro}
              onChange={(e) => setNewMacro(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addMacro()}
              className="flex-1 bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm"
              placeholder="Add macro (e.g., beCharming or increaseRelationship:victoria:5)"
            />
            {availableMacros.length > 0 && (
              <select
                value=""
                onChange={(e) => e.target.value && setNewMacro(e.target.value)}
                className="bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm"
              >
                <option value="">Quick Add...</option>
                {availableMacros.map(macro => (
                  <option key={macro} value={macro}>{macro}</option>
                ))}
              </select>
            )}
            <button
              onClick={addMacro}
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-sm"
            >
              Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Unified Condition Editor Component
const UnifiedConditionEditor = ({ 
  condition, 
  onConditionChange, 
  availableTemplates = [],
  compact = false,
  title = "Requires Condition",
  placeholder = "e.g., isRich"
}) => {
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templateCharacter, setTemplateCharacter] = useState('');

  const buildCondition = () => {
    if (selectedTemplate) {
      const newCondition = templateCharacter.trim() ? 
        `${selectedTemplate}:${templateCharacter}` : 
        selectedTemplate;
      onConditionChange(newCondition);
      setSelectedTemplate('');
      setTemplateCharacter('');
      setShowBuilder(false);
    }
  };

  const needsCharacter = (template) => {
    return ['likesYou', 'lovesYou', 'dislikes', 'hates'].includes(template);
  };

  if (compact) {
    return (
      <div>
        <label className="block text-yellow-400 text-sm font-bold mb-1">{title}</label>
        <div className="flex space-x-1">
          <input
            type="text"
            value={typeof condition === 'string' ? condition : ''}
            onChange={(e) => onConditionChange(e.target.value)}
            className="flex-1 bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-xs"
            placeholder={placeholder}
          />
          {availableTemplates.length > 0 && (
            <>
              <button
                onClick={() => setShowBuilder(!showBuilder)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs"
                title="Template Builder"
              >
                📝
              </button>
              <select
                value=""
                onChange={(e) => e.target.value && onConditionChange(e.target.value)}
                className="bg-gray-700 text-white border border-gray-600 rounded py-1 px-1 text-xs"
              >
                <option value="">+</option>
                {availableTemplates.map(template => (
                  <option key={template} value={template}>{template}</option>
                ))}
              </select>
            </>
          )}
        </div>
        
        {showBuilder && availableTemplates.length > 0 && (
          <div className="mt-2 p-2 bg-gray-800 rounded border border-gray-600">
            <div className="space-y-2">
              <select
                value={selectedTemplate}
                onChange={(e) => {
                  setSelectedTemplate(e.target.value);
                  setTemplateCharacter('');
                }}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-xs"
              >
                <option value="">Choose template...</option>
                {availableTemplates.map(template => (
                  <option key={template} value={template}>{template}</option>
                ))}
              </select>
              
              {selectedTemplate && needsCharacter(selectedTemplate) && (
                <input
                  type="text"
                  value={templateCharacter}
                  onChange={(e) => setTemplateCharacter(e.target.value)}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-xs"
                  placeholder="character name (victoria, rachel, etc.)"
                />
              )}
              
              {selectedTemplate && (
                <div className="text-xs text-gray-400">
                  Preview: <code>{templateCharacter.trim() && needsCharacter(selectedTemplate) ? `${selectedTemplate}:${templateCharacter}` : selectedTemplate}</code>
                </div>
              )}
              
              <button
                onClick={buildCondition}
                disabled={!selectedTemplate}
                className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white px-2 py-1 rounded text-xs w-full"
              >
                Use Template
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full-size version
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-yellow-500 font-semibold">{title}</h4>
        <span className="text-xs text-gray-400">When this condition is met</span>
      </div>

      <div className="bg-gray-800 rounded p-4 border border-gray-600">
        <div className="flex items-center justify-between mb-3">
          <span className="text-yellow-400 font-semibold">Condition Setup</span>
          {availableTemplates.length > 0 && (
            <button
              onClick={() => setShowBuilder(!showBuilder)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm"
            >
              {showBuilder ? 'Text Mode' : 'Template Mode'}
            </button>
          )}
        </div>

        {showBuilder && availableTemplates.length > 0 ? (
          <div className="space-y-3">
            <div>
              <label className="block text-yellow-400 text-sm mb-1">Select Template</label>
              <select
                value={selectedTemplate}
                onChange={(e) => {
                  setSelectedTemplate(e.target.value);
                  setTemplateCharacter('');
                }}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm"
              >
                <option value="">Choose a template...</option>
                {availableTemplates.map(template => (
                  <option key={template} value={template}>{template}</option>
                ))}
              </select>
            </div>
            
            {selectedTemplate && needsCharacter(selectedTemplate) && (
              <div>
                <label className="block text-yellow-400 text-sm mb-1">Character Name</label>
                <input
                  type="text"
                  value={templateCharacter}
                  onChange={(e) => setTemplateCharacter(e.target.value)}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm"
                  placeholder="victoria, rachel, sophia, jasmine"
                />
              </div>
            )}
            
            {selectedTemplate && (
              <div className="text-xs text-gray-400">
                Preview: <code className="bg-gray-700 px-2 py-1 rounded">
                  {templateCharacter.trim() && needsCharacter(selectedTemplate) ? `${selectedTemplate}:${templateCharacter}` : selectedTemplate}
                </code>
              </div>
            )}
            
            <button
              onClick={buildCondition}
              disabled={!selectedTemplate}
              className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white px-4 py-2 rounded text-sm"
            >
              Use Template
            </button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <input
              type="text"
              value={typeof condition === 'string' ? condition : ''}
              onChange={(e) => onConditionChange(e.target.value)}
              className="flex-1 bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm"
              placeholder={placeholder}
            />
            {availableTemplates.length > 0 && (
              <select
                value=""
                onChange={(e) => e.target.value && onConditionChange(e.target.value)}
                className="bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm"
              >
                <option value="">Quick Add...</option>
                {availableTemplates.map(template => (
                  <option key={template} value={template}>{template}</option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Legacy Condition Object Editor (for backward compatibility)
const LegacyConditionEditor = ({ condition, onConditionChange, compact = false }) => {
  const handleFieldChange = (field, value) => {
    const updatedCondition = {
      ...condition,
      [field]: field === 'value' ? (isNaN(parseFloat(value)) ? value : parseFloat(value)) : value
    };
    onConditionChange(updatedCondition);
  };

  const OPERATORS = [
    { value: '>=', label: '>=' },
    { value: '<=', label: '<=' },
    { value: '>', label: '>' },
    { value: '<', label: '<' },
    { value: '==', label: '==' },
    { value: '!=', label: '!=' }
  ];

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="text-yellow-400 text-sm font-bold">Legacy Condition (Object Format)</div>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="text"
            value={condition.variable || ''}
            onChange={(e) => handleFieldChange('variable', e.target.value)}
            className="bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-xs"
            placeholder="playerMoney"
          />
          <select
            value={condition.operator || '>='}
            onChange={(e) => handleFieldChange('operator', e.target.value)}
            className="bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-xs"
          >
            {OPERATORS.map(op => (
              <option key={op.value} value={op.value}>{op.label}</option>
            ))}
          </select>
          <input
            type="text"
            value={condition.value || ''}
            onChange={(e) => handleFieldChange('value', e.target.value)}
            className="bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-xs"
            placeholder="1000"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-yellow-500 font-semibold">Legacy Condition (Object Format)</h4>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-yellow-400 text-sm font-bold mb-1">Variable</label>
          <input
            type="text"
            value={condition.variable || ''}
            onChange={(e) => handleFieldChange('variable', e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm"
            placeholder="playerMoney"
          />
        </div>
        <div>
          <label className="block text-yellow-400 text-sm font-bold mb-1">Operator</label>
          <select
            value={condition.operator || '>='}
            onChange={(e) => handleFieldChange('operator', e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm"
          >
            {OPERATORS.map(op => (
              <option key={op.value} value={op.value}>{op.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-yellow-400 text-sm font-bold mb-1">Value</label>
          <input
            type="text"
            value={condition.value || ''}
            onChange={(e) => handleFieldChange('value', e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm"
            placeholder="1000"
          />
        </div>
      </div>
    </div>
  );
};

export { 
  UnifiedMacroEditor, 
  UnifiedConditionEditor, 
  LegacyConditionEditor 
};