import React, { useState, useRef, useMemo } from 'react';
import { MacroProcessor } from '../utils/MacroProcessor'; // Import the actual MacroProcessor

// Predefined operation types for the UI
const OPERATION_TYPES = [
  { value: '+', label: 'Add (+)', description: 'Add to current value', example: '+5' },
  { value: '-', label: 'Subtract (-)', description: 'Subtract from current value', example: '-3' },
  { value: '=', label: 'Set (=)', description: 'Set absolute value', example: '=10' },
  { value: '*', label: 'Multiply (*)', description: 'Multiply current value', example: '*2' },
  { value: '/', label: 'Divide (/)', description: 'Divide current value', example: '/2' },
  { value: 'push:', label: 'Add to List', description: 'Add item to array', example: 'push:item' },
  { value: 'remove:', label: 'Remove from List', description: 'Remove item from array', example: 'remove:item' },
  { value: 'random:', label: 'Random Number', description: 'Random value in range', example: 'random:1-10' },
  { value: 'toggle', label: 'Toggle', description: 'Switch true/false', example: 'toggle' }
];

const VARIABLE_SUGGESTIONS = [
  'playerMoney', 'profit', 'totalWinnings', 'totalLosses', 'casinoReputation', 
  'visitCount', 'dateCount', 'gamesPlayed', 'blackjackGamesPlayed', 'danceGamesPlayed',
  'charmPoints', 'aggressionPoints', 'playerPersonality', 'danceSkill',
  'achievements', 'winStreak', 'lossStreak', 'perfectDanceCount'
];

const MacroTestingPlayground = ({ macros, conditionalTemplates, selectedMacro }) => {
  const [testState, setTestState] = useState({
    // Built-in variables
    playerMoney: 1000,
    profit: 0,
    visitCount: 1,
    gamesPlayed: 0,
    blackjackGamesPlayed: 0,
    danceGamesPlayed: 0,
    dartGamesPlayed: 0,
    casinoReputation: 25,
    customVariables: {
      danceSkill: 15,
      playerPersonality: "neutral",
      achievements: ["first_visit"],
      charmPoints: 3
    }
  });

  const [testMacroCall, setTestMacroCall] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [testError, setTestError] = useState(null);

  // Create MacroProcessor instance
  const macroProcessor = useMemo(() => {
    return new MacroProcessor(macros, conditionalTemplates);
  }, [macros, conditionalTemplates]);

  const runMacroTest = () => {
    try {
      setTestError(null);
      
      if (!testMacroCall.trim()) {
        setTestError('Please enter a macro to test');
        return;
      }

      // Parse the macro call
      const macroArray = [testMacroCall.trim()];
      
      // Create a copy of test state for processing
      const testStateCopy = { ...testState };
      
      console.log('Testing macro:', testMacroCall);
      console.log('Initial state:', testStateCopy);
      
      // Process the macro
      const results = macroProcessor.processMacros(macroArray, testStateCopy);
      
      console.log('Macro results:', results);
      
      // Apply results to create new state
      let newState = { ...testStateCopy };
      
      Object.entries(results).forEach(([variable, value]) => {
        if (variable === 'flowControl') return; // Skip flow control
        
        // Check if this is a built-in variable
        if (variable in newState && variable !== 'customVariables') {
          newState[variable] = value;
        } else {
          // This is a custom variable
          if (!newState.customVariables) {
            newState.customVariables = {};
          }
          newState.customVariables[variable] = value;
        }
      });
      
      // Calculate changes
      const changes = [];
      
      // Check built-in variables
      Object.keys(newState).forEach(key => {
        if (key !== 'customVariables' && newState[key] !== testState[key]) {
          changes.push({
            variable: key,
            from: testState[key],
            to: newState[key],
            type: 'built-in'
          });
        }
      });
      
      // Check custom variables
      Object.keys(newState.customVariables || {}).forEach(key => {
        const oldValue = testState.customVariables?.[key];
        const newValue = newState.customVariables[key];
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          changes.push({
            variable: key,
            from: oldValue,
            to: newValue,
            type: 'custom'
          });
        }
      });
      
      setTestResults({
        originalState: testState,
        newState: newState,
        changes: changes,
        flowControl: results.flowControl || null
      });
      
    } catch (error) {
      console.error('Macro test error:', error);
      setTestError(`Error: ${error.message}`);
      setTestResults(null);
    }
  };

  const applyTestResults = () => {
    if (testResults) {
      setTestState(testResults.newState);
      setTestResults(null);
    }
  };

  const resetTestState = () => {
    setTestState({
      playerMoney: 1000,
      profit: 0,
      visitCount: 1,
      gamesPlayed: 0,
      blackjackGamesPlayed: 0,
      danceGamesPlayed: 0,
      casinoReputation: 25,
      customVariables: {
        danceSkill: 15,
        playerPersonality: "neutral",
        achievements: ["first_visit"],
        charmPoints: 3
      }
    });
    setTestResults(null);
    setTestError(null);
  };

  const formatValue = (value) => {
    if (Array.isArray(value)) {
      return `[${value.join(', ')}]`;
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return String(value);
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 space-y-4">
      <h3 className="text-yellow-400 font-bold text-lg flex items-center">
        🧪 Macro Testing Playground
        <span className="ml-2 text-xs text-gray-400">(Test your macros safely)</span>
      </h3>

      {/* Current Test State */}
      <div className="bg-gray-800 rounded p-3">
        <h4 className="text-green-400 font-semibold mb-2">Current Test State</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-yellow-300 font-semibold mb-1">Built-in Variables:</div>
            {Object.entries(testState).filter(([key]) => key !== 'customVariables').map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-300">{key}:</span>
                <span className="text-white font-mono">{formatValue(value)}</span>
              </div>
            ))}
          </div>
          <div>
            <div className="text-yellow-300 font-semibold mb-1">Custom Variables:</div>
            {Object.entries(testState.customVariables || {}).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-300">{key}:</span>
                <span className="text-white font-mono">{formatValue(value)}</span>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={resetTestState}
          className="mt-2 bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm"
        >
          Reset to Defaults
        </button>
      </div>

      {/* Macro Testing */}
      <div className="bg-gray-800 rounded p-3">
        <h4 className="text-blue-400 font-semibold mb-2">Test Macro</h4>
        <div className="flex space-x-2 mb-2">
          <input
            value={testMacroCall}
            onChange={(e) => setTestMacroCall(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && runMacroTest()}
            className="flex-1 bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm font-mono"
            placeholder="e.g., increaseRelationship:character:10 or beCharming"
          />
          <button
            onClick={runMacroTest}
            disabled={!testMacroCall.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white px-4 py-2 rounded text-sm"
          >
            Test
          </button>
        </div>
        
        {selectedMacro && (
          <div className="text-xs text-gray-400 mb-2">
            <strong>Quick fill:</strong> 
            <button
              onClick={() => setTestMacroCall(selectedMacro)}
              className="ml-2 text-blue-300 hover:text-blue-200 underline"
            >
              {selectedMacro}
            </button>
            {macros[selectedMacro]?.parameters?.length > 0 && (
              <span className="ml-2">
                (needs {macros[selectedMacro].parameters.length} parameter{macros[selectedMacro].parameters.length !== 1 ? 's' : ''})
              </span>
            )}
          </div>
        )}

        {/* Available Macros Quick Reference */}
        <div className="text-xs text-gray-400 mb-2">
          <strong>Available macros:</strong>
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.keys(macros).map(macroId => (
              <button
                key={macroId}
                onClick={() => setTestMacroCall(macroId)}
                className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded text-xs"
                title={macros[macroId].description}
              >
                {macroId}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Test Results */}
      {testError && (
        <div className="bg-red-900 border border-red-600 rounded p-3">
          <h4 className="text-red-400 font-semibold mb-2">❌ Error</h4>
          <div className="text-red-200 text-sm font-mono">{testError}</div>
        </div>
      )}

      {testResults && (
        <div className="bg-green-900 border border-green-600 rounded p-3">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-green-400 font-semibold">✅ Test Results</h4>
            <button
              onClick={applyTestResults}
              className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm"
            >
              Apply Changes
            </button>
          </div>
          
          {testResults.changes.length === 0 ? (
            <div className="text-green-200 text-sm">No changes made to game state.</div>
          ) : (
            <div className="space-y-2">
              <div className="text-green-200 text-sm font-semibold">
                Changes ({testResults.changes.length}):
              </div>
              {testResults.changes.map((change, index) => (
                <div key={index} className="bg-green-800 rounded p-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-green-300 font-semibold">
                      {change.variable} 
                      <span className="ml-1 text-xs bg-green-700 px-1 rounded">
                        {change.type}
                      </span>
                    </span>
                  </div>
                  <div className="text-green-100 font-mono text-xs">
                    <span className="text-red-300">{formatValue(change.from)}</span>
                    <span className="mx-2">→</span>
                    <span className="text-green-300">{formatValue(change.to)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {testResults.flowControl && (
            <div className="mt-2 bg-purple-800 rounded p-2">
              <div className="text-purple-300 text-sm font-semibold">Flow Control Triggered:</div>
              <div className="text-purple-100 font-mono text-sm">{testResults.flowControl}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const MacroDefinitionEditor = ({ macroId, macro, onMacroChange, onDelete, isNew = false }) => {
  const [localMacro, setLocalMacro] = useState(macro || {
    description: '',
    parameters: [],
    updates: {},
    conditions: null
  });
  
  const [newParamName, setNewParamName] = useState('');
  const [newVarName, setNewVarName] = useState('');
  const [newOperation, setNewOperation] = useState('+5');
  const [operationType, setOperationType] = useState('+');
  const [operationValue, setOperationValue] = useState('5');
  const [showConditions, setShowConditions] = useState(!!localMacro.conditions);

  // Update parent when local macro changes
  const updateMacro = (updatedMacro) => {
    setLocalMacro(updatedMacro);
    onMacroChange(updatedMacro);
  };

  const addParameter = () => {
    if (newParamName.trim()) {
      const updatedMacro = {
        ...localMacro,
        parameters: [...localMacro.parameters, newParamName.trim()]
      };
      updateMacro(updatedMacro);
      setNewParamName('');
    }
  };

  const removeParameter = (index) => {
    const updatedMacro = {
      ...localMacro,
      parameters: localMacro.parameters.filter((_, i) => i !== index)
    };
    updateMacro(updatedMacro);
  };

  const addUpdate = () => {
    if (newVarName.trim()) {
      let operation = newOperation;
      
      // Build operation from type and value
      if (operationType === 'push:' || operationType === 'remove:') {
        operation = `${operationType}${operationValue}`;
      } else if (operationType === 'random:') {
        operation = `random:${operationValue}`;
      } else if (operationType === 'toggle') {
        operation = 'toggle';
      } else {
        operation = `${operationType}${operationValue}`;
      }

      const updatedMacro = {
        ...localMacro,
        updates: {
          ...localMacro.updates,
          [newVarName.trim()]: operation
        }
      };
      updateMacro(updatedMacro);
      setNewVarName('');
      setOperationValue('5');
    }
  };

  const removeUpdate = (varName) => {
    const updatedMacro = { ...localMacro };
    delete updatedMacro.updates[varName];
    updateMacro(updatedMacro);
  };

  const updateDescription = (description) => {
    updateMacro({ ...localMacro, description });
  };

  const generateUsageExample = () => {
    if (localMacro.parameters.length === 0) {
      return macroId;
    }
    return `${macroId}:${localMacro.parameters.join(':')}`;
  };

  // Handle operation type change
  const handleOperationTypeChange = (type) => {
    setOperationType(type);
    const opType = OPERATION_TYPES.find(op => op.value === type);
    if (opType) {
      setOperationValue(opType.example.replace(type, '') || '5');
    }
  };

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-yellow-500 font-bold text-xl">
          {isNew ? 'New Macro' : `Editing: ${macroId}`}
        </h3>
        {!isNew && (
          <button
            onClick={onDelete}
            className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm"
          >
            Delete Macro
          </button>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-yellow-400 font-bold mb-2">Description</label>
        <input 
          value={localMacro.description || ''}
          onChange={(e) => updateDescription(e.target.value)}
          className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-2 px-3"
          placeholder="What does this macro do?"
        />
      </div>

      {/* Parameters */}
      <div>
        <label className="block text-yellow-400 font-bold mb-2">
          Parameters
          <span className="ml-2 text-xs text-gray-400">(Values passed to the macro)</span>
        </label>
        
        {/* Existing parameters */}
        {localMacro.parameters.map((param, index) => (
          <div key={index} className="flex items-center mb-2">
            <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded mr-2 text-sm">
              {index + 1}
            </span>
            <span className="flex-1 bg-gray-700 text-white px-2 py-1 rounded">{param}</span>
            <button 
              onClick={() => removeParameter(index)}
              className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded ml-2 text-sm"
            >
              ×
            </button>
          </div>
        ))}
        
        {/* Add new parameter */}
        <div className="flex items-center space-x-2 mt-2">
          <input 
            value={newParamName}
            onChange={(e) => setNewParamName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addParameter()}
            className="flex-1 bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-sm"
            placeholder="Parameter name (e.g., character, amount)"
          />
          <button 
            onClick={addParameter}
            className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm"
          >
            Add
          </button>
        </div>
        
        {localMacro.parameters.length > 0 && (
          <div className="text-xs text-gray-400 mt-2">
            <strong>Usage:</strong> <code>{generateUsageExample()}</code>
          </div>
        )}
      </div>

      {/* Variable Updates */}
      <div>
        <label className="block text-yellow-400 font-bold mb-2">
          Variable Updates
          <span className="ml-2 text-xs text-gray-400">(Changes made when macro runs)</span>
        </label>
        
        {/* Existing updates */}
        {Object.entries(localMacro.updates || {}).map(([variable, operation], index) => (
          <div key={index} className="bg-gray-800 rounded p-3 mb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-green-300">{variable}</span>
              <button 
                onClick={() => removeUpdate(variable)}
                className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-xs"
              >
                ×
              </button>
            </div>
            <div className="text-gray-300 text-sm">
              Operation: <code className="bg-gray-700 px-1 rounded">{operation}</code>
            </div>
          </div>
        ))}
        
        {/* Add new update */}
        <div className="bg-gray-800 rounded p-3 border-2 border-dashed border-gray-600">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-yellow-400 text-xs mb-1">Variable Name</label>
              <input 
                value={newVarName}
                onChange={(e) => setNewVarName(e.target.value)}
                list="variable-suggestions"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-sm"
                placeholder="e.g., {character}Relationship"
              />
              <datalist id="variable-suggestions">
                {VARIABLE_SUGGESTIONS.map(variable => (
                  <option key={variable} value={variable} />
                ))}
              </datalist>
            </div>
            
            <div>
              <label className="block text-yellow-400 text-xs mb-1">Operation Type</label>
              <select
                value={operationType}
                onChange={(e) => handleOperationTypeChange(e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-sm"
              >
                {OPERATION_TYPES.map(op => (
                  <option key={op.value} value={op.value} title={op.description}>
                    {op.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mb-2">
            <label className="block text-yellow-400 text-xs mb-1">
              Value {operationType === 'toggle' ? '(not needed)' : ''}
            </label>
            <input 
              value={operationValue}
              onChange={(e) => setOperationValue(e.target.value)}
              disabled={operationType === 'toggle'}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-sm disabled:opacity-50"
              placeholder={
                operationType === 'random:' ? '1-10' :
                operationType === 'push:' || operationType === 'remove:' ? 'item_name' :
                operationType === 'toggle' ? 'N/A' :
                '5'
              }
            />
          </div>
          
          <div className="text-xs text-gray-400 mb-2">
            Preview: <code className="bg-gray-700 px-1 rounded">
              {operationType === 'toggle' ? 'toggle' : 
               operationType === 'push:' || operationType === 'remove:' ? 
               `${operationType}${operationValue}` :
               operationType === 'random:' ? `random:${operationValue}` :
               `${operationType}${operationValue}`}
            </code>
          </div>
          
          <button 
            onClick={addUpdate}
            disabled={!newVarName.trim()}
            className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:opacity-50 text-white px-3 py-1 rounded text-sm"
          >
            Add Update
          </button>
        </div>
      </div>

      {/* Test Section */}
      <div className="bg-gray-900 rounded p-4 border border-green-600">
        <h4 className="text-yellow-400 font-bold mb-2">Test & Preview</h4>
        <div className="space-y-2 text-sm">
          <div>
            <strong className="text-green-300">Usage:</strong> 
            <code className="bg-gray-700 px-2 py-1 rounded ml-2">{generateUsageExample()}</code>
          </div>
          <div>
            <strong className="text-green-300">Description:</strong> 
            <span className="text-gray-300 ml-2">{localMacro.description || 'No description'}</span>
          </div>
          <div>
            <strong className="text-green-300">Updates:</strong> 
            <span className="text-gray-300 ml-2">{Object.keys(localMacro.updates || {}).length} variables</span>
          </div>
          {localMacro.parameters.length > 0 && (
            <div>
              <strong className="text-green-300">Parameters:</strong> 
              <span className="text-gray-300 ml-2">{localMacro.parameters.join(', ')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ConditionalTemplateEditor = ({ templateId, template, onTemplateChange, onDelete, isNew = false }) => {
  const [localTemplate, setLocalTemplate] = useState(template || {
    variable: '',
    operator: '>=',
    value: 0,
    text: ''
  });

  const updateTemplate = (updatedTemplate) => {
    setLocalTemplate(updatedTemplate);
    onTemplateChange(updatedTemplate);
  };

  const OPERATORS = [
    { value: '>=', label: 'Greater than or equal (>=)' },
    { value: '<=', label: 'Less than or equal (<=)' },
    { value: '>', label: 'Greater than (>)' },
    { value: '<', label: 'Less than (<)' },
    { value: '==', label: 'Equal to (==)' },
    { value: '!=', label: 'Not equal to (!=)' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-yellow-400 font-bold">
          {isNew ? 'New Template' : `Template: ${templateId}`}
        </h4>
        {!isNew && (
          <button
            onClick={onDelete}
            className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-sm"
          >
            Delete
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-yellow-400 text-sm mb-1">Variable</label>
          <input
            value={localTemplate.variable}
            onChange={(e) => updateTemplate({...localTemplate, variable: e.target.value})}
            list="template-variable-suggestions"
            className="w-full bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-sm"
            placeholder="{character}Relationship"
          />
          <datalist id="template-variable-suggestions">
            {VARIABLE_SUGGESTIONS.map(variable => (
              <option key={variable} value={variable} />
            ))}
          </datalist>
        </div>
        
        <div>
          <label className="block text-yellow-400 text-sm mb-1">Operator</label>
          <select
            value={localTemplate.operator}
            onChange={(e) => updateTemplate({...localTemplate, operator: e.target.value})}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-sm"
          >
            {OPERATORS.map(op => (
              <option key={op.value} value={op.value}>{op.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-yellow-400 text-sm mb-1">Value</label>
        <input
          value={localTemplate.value}
          onChange={(e) => updateTemplate({...localTemplate, value: e.target.value})}
          className="w-full bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-sm"
          placeholder="15"
        />
      </div>

      <div>
        <label className="block text-yellow-400 text-sm mb-1">Text to Add</label>
        <textarea
          value={localTemplate.text}
          onChange={(e) => updateTemplate({...localTemplate, text: e.target.value})}
          className="w-full bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-sm"
          rows="2"
          placeholder=" {character} smiles warmly at you."
        />
      </div>

      <div className="bg-gray-800 rounded p-2 text-xs">
        <strong className="text-green-300">Preview:</strong> When <code>{localTemplate.variable}</code> {localTemplate.operator} <code>{localTemplate.value}</code>, 
        add text: <em className="text-blue-300">"{localTemplate.text}"</em>
      </div>
    </div>
  );
};

const MacroLibraryEditor = ({ 
  macros, 
  conditionalTemplates, 
  onMacrosChange, 
  onConditionalTemplatesChange 
}) => {
  const [selectedMacro, setSelectedMacro] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editingMacro, setEditingMacro] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [activeTab, setActiveTab] = useState('macros');
  const [newMacroId, setNewMacroId] = useState('');
  const [newTemplateId, setNewTemplateId] = useState('');

  const addNewMacro = () => {
    if (newMacroId.trim() && !macros[newMacroId.trim()]) {
      const macroId = newMacroId.trim();
      const newMacro = {
        description: "New custom macro",
        parameters: [],
        updates: {}
      };
      
      onMacrosChange({
        ...macros,
        [macroId]: newMacro
      });
      
      setEditingMacro(macroId);
      setSelectedMacro(macroId);
      setNewMacroId('');
    }
  };

  const addNewTemplate = () => {
    if (newTemplateId.trim() && !conditionalTemplates[newTemplateId.trim()]) {
      const templateId = newTemplateId.trim();
      const newTemplate = {
        variable: "",
        operator: ">=",
        value: 0,
        text: ""
      };
      
      onConditionalTemplatesChange({
        ...conditionalTemplates,
        [templateId]: newTemplate
      });
      
      setEditingTemplate(templateId);
      setSelectedTemplate(templateId);
      setNewTemplateId('');
    }
  };

  const deleteMacro = (macroId) => {
    if (confirm(`Delete macro "${macroId}"?`)) {
      const newMacros = { ...macros };
      delete newMacros[macroId];
      onMacrosChange(newMacros);
      
      if (selectedMacro === macroId) {
        setSelectedMacro(null);
        setEditingMacro(null);
      }
    }
  };

  const deleteTemplate = (templateId) => {
    if (confirm(`Delete template "${templateId}"?`)) {
      const newTemplates = { ...conditionalTemplates };
      delete newTemplates[templateId];
      onConditionalTemplatesChange(newTemplates);
      
      if (selectedTemplate === templateId) {
        setSelectedTemplate(null);
        setEditingTemplate(null);
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700 mb-4">
        <button
          className={`py-2 px-4 font-semibold ${activeTab === 'macros' ? 'bg-yellow-700 text-yellow-100' : 'text-yellow-400 hover:text-yellow-300'}`}
          onClick={() => setActiveTab('macros')}
        >
          Macros ({Object.keys(macros).length})
        </button>
        <button
          className={`py-2 px-4 font-semibold ${activeTab === 'templates' ? 'bg-yellow-700 text-yellow-100' : 'text-yellow-400 hover:text-yellow-300'}`}
          onClick={() => setActiveTab('templates')}
        >
          Conditional Templates ({Object.keys(conditionalTemplates).length})
        </button>
        <button
          className={`py-2 px-4 font-semibold ${activeTab === 'playground' ? 'bg-yellow-700 text-yellow-100' : 'text-yellow-400 hover:text-yellow-300'}`}
          onClick={() => setActiveTab('playground')}
        >
          🧪 Testing Playground
        </button>
      </div>

      {activeTab === 'macros' && (
        <div className="grid grid-cols-3 gap-4 h-full">
          {/* Macro List */}
          <div className="bg-gray-800 rounded p-4 overflow-y-auto">
            <h3 className="text-yellow-500 font-bold mb-4">Macro Library</h3>
            
            {/* Add new macro */}
            <div className="mb-4 p-2 bg-gray-700 rounded">
              <input
                value={newMacroId}
                onChange={(e) => setNewMacroId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addNewMacro()}
                className="w-full bg-gray-600 text-white border border-gray-500 rounded py-1 px-2 text-sm mb-2"
                placeholder="New macro name"
              />
              <button 
                onClick={addNewMacro}
                disabled={!newMacroId.trim() || macros[newMacroId.trim()]}
                className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white py-1 px-2 rounded text-sm"
              >
                Add Macro
              </button>
            </div>
            
            {/* Macro list */}
            {Object.entries(macros).map(([id, macro]) => (
              <div 
                key={id}
                className={`p-3 rounded cursor-pointer mb-2 ${
                  selectedMacro === id ? 'bg-yellow-700' : 'bg-gray-700 hover:bg-gray-600'
                }`}
                onClick={() => {
                  setSelectedMacro(id);
                  setEditingMacro(id);
                }}
              >
                <div className="font-bold text-sm">{id}</div>
                <div className="text-xs text-gray-400 truncate">{macro.description || 'No description'}</div>
                <div className="text-xs text-blue-300 mt-1">
                  {macro.parameters?.length || 0} params, {Object.keys(macro.updates || {}).length} updates
                </div>
              </div>
            ))}
          </div>

          {/* Macro Editor */}
          <div className="col-span-2 bg-gray-800 rounded p-4">
            {editingMacro ? (
              <MacroDefinitionEditor 
                macroId={editingMacro}
                macro={macros[editingMacro]}
                onMacroChange={(updatedMacro) => {
                  onMacrosChange({
                    ...macros,
                    [editingMacro]: updatedMacro
                  });
                }}
                onDelete={() => deleteMacro(editingMacro)}
              />
            ) : (
              <div className="text-center text-gray-400 mt-8">
                <div className="text-lg mb-2">Select a macro to edit</div>
                <div className="text-sm">Or create a new one using the form on the left</div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-3 gap-4 h-full">
          {/* Template List */}
          <div className="bg-gray-800 rounded p-4 overflow-y-auto">
            <h3 className="text-yellow-500 font-bold mb-4">Conditional Templates</h3>
            
            {/* Add new template */}
            <div className="mb-4 p-2 bg-gray-700 rounded">
              <input
                value={newTemplateId}
                onChange={(e) => setNewTemplateId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addNewTemplate()}
                className="w-full bg-gray-600 text-white border border-gray-500 rounded py-1 px-2 text-sm mb-2"
                placeholder="New template name"
              />
              <button 
                onClick={addNewTemplate}
                disabled={!newTemplateId.trim() || conditionalTemplates[newTemplateId.trim()]}
                className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white py-1 px-2 rounded text-sm"
              >
                Add Template
              </button>
            </div>
            
            {/* Template list */}
            {Object.entries(conditionalTemplates).map(([id, template]) => (
              <div 
                key={id}
                className={`p-3 rounded cursor-pointer mb-2 ${
                  selectedTemplate === id ? 'bg-yellow-700' : 'bg-gray-700 hover:bg-gray-600'
                }`}
                onClick={() => {
                  setSelectedTemplate(id);
                  setEditingTemplate(id);
                }}
              >
                <div className="font-bold text-sm">{id}</div>
                <div className="text-xs text-gray-400 truncate">
                  {template.variable} {template.operator} {template.value}
                </div>
                <div className="text-xs text-blue-300 mt-1 truncate">
                  "{template.text}"
                </div>
              </div>
            ))}
          </div>

          {/* Template Editor */}
          <div className="col-span-2 bg-gray-800 rounded p-4">
            {editingTemplate ? (
              <ConditionalTemplateEditor 
                templateId={editingTemplate}
                template={conditionalTemplates[editingTemplate]}
                onTemplateChange={(updatedTemplate) => {
                  onConditionalTemplatesChange({
                    ...conditionalTemplates,
                    [editingTemplate]: updatedTemplate
                  });
                }}
                onDelete={() => deleteTemplate(editingTemplate)}
              />
            ) : (
              <div className="text-center text-gray-400 mt-8">
                <div className="text-lg mb-2">Select a template to edit</div>
                <div className="text-sm">Or create a new one using the form on the left</div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'playground' && (
        <div className="h-full overflow-y-auto">
          <MacroTestingPlayground 
            macros={macros}
            conditionalTemplates={conditionalTemplates}
            selectedMacro={selectedMacro}
          />
        </div>
      )}
    </div>
  );
};

export default MacroLibraryEditor;