import React, { useState, useRef } from 'react';

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
  'visitCount', 'dateCount', 'gamesPlayed', 'blackjackGamesPlayed',
  'charmPoints', 'aggressionPoints', 'playerPersonality',
  'victoriaRelationship', 'rachelRelationship', 'sophiaRelationship', 'jasmineRelationship',
  'achievements', 'winStreak', 'lossStreak'
];

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

      {/* Conditional Logic (Advanced) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-yellow-400 font-bold">
            Conditional Logic
            <span className="ml-2 text-xs text-gray-400">(Advanced)</span>
          </label>
          <button
            onClick={() => setShowConditions(!showConditions)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs"
          >
            {showConditions ? 'Hide' : 'Show'} Conditions
          </button>
        </div>
        
        {showConditions && (
          <div className="bg-gray-800 rounded p-3 border border-blue-600">
            <div className="text-xs text-gray-400 mb-2">
              Add if/then/else logic to your macro (coming soon in advanced editor)
            </div>
            <textarea
              value={JSON.stringify(localMacro.conditions || {}, null, 2)}
              onChange={(e) => {
                try {
                  const conditions = JSON.parse(e.target.value);
                  updateMacro({ ...localMacro, conditions });
                } catch (error) {
                  // Invalid JSON, don't update
                }
              }}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-2 text-xs font-mono"
              rows="4"
              placeholder='{"if": "{$variable} >= 5", "then": {"otherVar": "+10"}}'
            />
          </div>
        )}
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
            className="w-full bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-sm"
            placeholder="{character}Relationship"
          />
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
          type="number"
          value={localTemplate.value}
          onChange={(e) => updateTemplate({...localTemplate, value: parseFloat(e.target.value)})}
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
    </div>
  );
};

export default MacroLibraryEditor;