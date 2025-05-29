import { useCallback, useRef, useEffect } from 'react';

// Enhanced MacroProcessor - Full dynamic variable support
export class MacroProcessor {
  constructor(macroDefinitions = {}, conditionalTemplates = {}) {
    this.macros = macroDefinitions;
    this.conditionalTemplates = conditionalTemplates;
  }

  // Update macro definitions
  updateMacros(macroDefinitions, conditionalTemplates = {}) {
    this.macros = macroDefinitions;
    this.conditionalTemplates = conditionalTemplates;
  }

  // Substitute parameters in a template string
  substituteParameters(template, params = {}, gameState = {}) {
    if (typeof template !== 'string') return template;

    let result = template;

    if (import.meta.env.DEV) {
      console.log('Substituting parameters in:', template, 'with params:', params);
    }

    // Replace {param|default} patterns
    result = result.replace(/{(\w+)\|([^}]+)}/g, (match, param, defaultValue) => {
      const value = params[param] !== undefined ? params[param] : defaultValue;
      if (import.meta.env.DEV) {
        console.log(`Parameter substitution: ${match} -> ${value}`);
      }
      return value;
    });

    // Replace {param} patterns
    result = result.replace(/{(\w+)}/g, (match, param) => {
      if (params[param] !== undefined) {
        if (import.meta.env.DEV) {
          console.log(`Parameter substitution: ${match} -> ${params[param]}`);
        }
        return params[param];
      }
      return match;
    });

    // Replace {$variable} patterns (game state references)
    result = result.replace(/{\$(\w+)}/g, (match, variable) => {
      const value = this.getVariableValue(variable, gameState);
      const finalValue = value !== null ? value : 0;
      if (import.meta.env.DEV) {
        console.log(`Game state substitution: ${match} -> ${finalValue}`);
      }
      return finalValue;
    });

    // Handle math operations in parameters (e.g., {amount/10})
    result = result.replace(/{(\w+)\/(\d+)}/g, (match, param, divisor) => {
      const value = params[param] !== undefined ? parseFloat(params[param]) : 0;
      const finalValue = Math.floor(value / parseFloat(divisor));
      if (import.meta.env.DEV) {
        console.log(`Math operation: ${match} -> ${finalValue}`);
      }
      return finalValue;
    });

    result = result.replace(/{(\w+)\*(\d+)}/g, (match, param, multiplier) => {
      const value = params[param] !== undefined ? parseFloat(params[param]) : 0;
      const finalValue = Math.floor(value * parseFloat(multiplier));
      if (import.meta.env.DEV) {
        console.log(`Math operation: ${match} -> ${finalValue}`);
      }
      return finalValue;
    });

    if (import.meta.env.DEV) {
      console.log('Final substituted result:', result);
    }

    return result;
  }

  // ENHANCED: Get variable value from game state with full dynamic support
  getVariableValue(variableName, gameState) {
    // Check main game state first (built-in properties)
    if (gameState.hasOwnProperty(variableName) && variableName !== 'customVariables') {
      return gameState[variableName];
    }
    
    // Check custom variables (dynamic variables)
    if (gameState.customVariables && gameState.customVariables.hasOwnProperty(variableName)) {
      return gameState.customVariables[variableName];
    }
    
    // Return null for non-existent variables (will be handled by processOperation)
    return null;
  }

  // ENHANCED: Process operations with automatic variable initialization
  processOperation(operation, currentValue = null) {
    if (typeof operation !== 'string') return operation;

    const operationStr = String(operation);

    // ENHANCED: Smart initialization for new variables (currentValue === null)
    if (currentValue === null) {
      if (operationStr.startsWith('+') || operationStr.startsWith('-') || 
          operationStr.startsWith('*') || operationStr.startsWith('/')) {
        currentValue = 0; // Initialize numeric operations to 0
      } else if (operationStr.startsWith('push:') || operationStr.startsWith('remove:')) {
        currentValue = []; // Initialize array operations to empty array
      } else if (operationStr === 'toggle') {
        currentValue = false; // Initialize boolean operations to false
      } else if (operationStr.startsWith('=')) {
        // Direct assignment - no initialization needed
        currentValue = 0;
      } else {
        // For other operations, try to infer type from the operation value
        const numValue = parseFloat(operationStr);
        currentValue = isNaN(numValue) ? '' : 0; // String or number
      }
      
      if (import.meta.env.DEV) {
        console.log(`Initialized new variable with default value: ${currentValue} for operation: ${operationStr}`);
      }
    }

    // Addition: "+5"
    if (operationStr.startsWith('+')) {
      const addValue = parseFloat(operationStr.substring(1));
      const result = (typeof currentValue === 'number' ? currentValue : 0) + addValue;
      if (import.meta.env.DEV) {
        console.log(`Addition: ${currentValue} + ${addValue} = ${result}`);
      }
      return result;
    }

    // Subtraction: "-3"
    if (operationStr.startsWith('-')) {
      const subValue = parseFloat(operationStr.substring(1));
      const result = (typeof currentValue === 'number' ? currentValue : 0) - subValue;
      if (import.meta.env.DEV) {
        console.log(`Subtraction: ${currentValue} - ${subValue} = ${result}`);
      }
      return result;
    }

    // Absolute assignment: "=10"
    if (operationStr.startsWith('=')) {
      const assignValue = operationStr.substring(1);
      const numValue = parseFloat(assignValue);
      const result = isNaN(numValue) ? assignValue : numValue;
      if (import.meta.env.DEV) {
        console.log(`Assignment: = ${result}`);
      }
      return result;
    }

    // Multiplication: "*2"
    if (operationStr.startsWith('*')) {
      const multValue = parseFloat(operationStr.substring(1));
      const result = (typeof currentValue === 'number' ? currentValue : 0) * multValue;
      if (import.meta.env.DEV) {
        console.log(`Multiplication: ${currentValue} * ${multValue} = ${result}`);
      }
      return result;
    }

    // Division: "/2"
    if (operationStr.startsWith('/')) {
      const divValue = parseFloat(operationStr.substring(1));
      const result = Math.floor((typeof currentValue === 'number' ? currentValue : 0) / divValue);
      if (import.meta.env.DEV) {
        console.log(`Division: ${currentValue} / ${divValue} = ${result}`);
      }
      return result;
    }

    // Array push: "push:item"
    if (operationStr.startsWith('push:')) {
      const item = operationStr.substring(5);
      const currentArray = Array.isArray(currentValue) ? currentValue : [];
      const result = [...currentArray, item];
      if (import.meta.env.DEV) {
        console.log(`Array push: [${currentArray.join(', ')}] + ${item} = [${result.join(', ')}]`);
      }
      return result;
    }

    // Array remove: "remove:item"
    if (operationStr.startsWith('remove:')) {
      const item = operationStr.substring(7);
      const currentArray = Array.isArray(currentValue) ? currentValue : [];
      const result = currentArray.filter(i => i !== item);
      if (import.meta.env.DEV) {
        console.log(`Array remove: [${currentArray.join(', ')}] - ${item} = [${result.join(', ')}]`);
      }
      return result;
    }

    // Random number: "random:1-10" or "random:10"
    if (operationStr.startsWith('random:')) {
      const range = operationStr.substring(7);
      let result;
      if (range.includes('-')) {
        const [min, max] = range.split('-').map(Number);
        result = Math.floor(Math.random() * (max - min + 1)) + min;
      } else {
        result = Math.floor(Math.random() * parseFloat(range));
      }
      if (import.meta.env.DEV) {
        console.log(`Random: ${range} = ${result}`);
      }
      return result;
    }

    // Boolean toggle: "toggle"
    if (operationStr === 'toggle') {
      const result = !currentValue;
      if (import.meta.env.DEV) {
        console.log(`Toggle: ${currentValue} -> ${result}`);
      }
      return result;
    }

    // ENHANCED: Support for increment/decrement shortcuts
    if (operationStr === '++') {
      const result = (typeof currentValue === 'number' ? currentValue : 0) + 1;
      if (import.meta.env.DEV) {
        console.log(`Increment: ${currentValue} -> ${result}`);
      }
      return result;
    }

    if (operationStr === '--') {
      const result = (typeof currentValue === 'number' ? currentValue : 0) - 1;
      if (import.meta.env.DEV) {
        console.log(`Decrement: ${currentValue} -> ${result}`);
      }
      return result;
    }

    // Direct value assignment (string or number)
    const numValue = parseFloat(operationStr);
    const result = isNaN(numValue) ? operationStr : numValue;
    if (import.meta.env.DEV) {
      console.log(`Direct assignment: ${result}`);
    }
    return result;
  }

  // ENHANCED: Evaluate conditions with dynamic variable support
  evaluateCondition(condition, gameState) {
    if (typeof condition !== 'string') return false;

    // Handle template conditions (e.g., "{$winStreak} >= 3")
    const templatePattern = /{\$(\w+)}\s*([><=!]+)\s*(.+)/;
    const match = condition.match(templatePattern);

    if (match) {
      const [, variable, operator, value] = match;
      const currentValue = this.getVariableValue(variable, gameState);
      
      // Handle string vs numeric comparison
      let compareValue;
      if (value.startsWith('"') && value.endsWith('"')) {
        compareValue = value.slice(1, -1); // Remove quotes for string comparison
      } else {
        compareValue = parseFloat(value);
        if (isNaN(compareValue)) {
          compareValue = value; // Keep as string if not a number
        }
      }

      if (import.meta.env.DEV) {
        console.log(`Evaluating condition: ${variable}(${currentValue}) ${operator} ${compareValue}`);
      }

      switch (operator) {
        case '>=': return currentValue >= compareValue;
        case '<=': return currentValue <= compareValue;
        case '>': return currentValue > compareValue;
        case '<': return currentValue < compareValue;
        case '==': return currentValue == compareValue;
        case '===': return currentValue === compareValue;
        case '!=': return currentValue != compareValue;
        case '!==': return currentValue !== compareValue;
        default: return false;
      }
    }

    // Handle simple template references (e.g., "{$hasKey}")
    if (condition.startsWith('{$') && condition.endsWith('}')) {
      const variable = condition.slice(2, -1);
      const value = this.getVariableValue(variable, gameState);
      return !!value; // Convert to boolean
    }

    // Handle array contains operations (e.g., "{$achievements} contains firstDate")
    const containsPattern = /{\$(\w+)}\s+contains\s+(.+)/;
    const containsMatch = condition.match(containsPattern);
    if (containsMatch) {
      const [, variable, item] = containsMatch;
      const currentValue = this.getVariableValue(variable, gameState);
      if (Array.isArray(currentValue)) {
        return currentValue.includes(item.replace(/"/g, ''));
      }
      return false;
    }

    return false;
  }

  // Process a single macro with enhanced parameter handling
  processMacro(macroCall, gameState) {
    let macroName, params = {};

    if (import.meta.env.DEV) {
      console.log('Processing single macro:', macroCall);
    }

    // Parse macro call: "macroName" or "macroName:param1:param2"
    if (macroCall.includes(':')) {
      const parts = macroCall.split(':');
      macroName = parts[0];
      
      // Build params object from parts
      const macroDef = this.macros[macroName];
      if (macroDef && macroDef.parameters) {
        macroDef.parameters.forEach((paramName, index) => {
          if (parts[index + 1] !== undefined) {
            params[paramName] = parts[index + 1];
          }
        });
      } else {
        // If no parameter definition, use generic parameter names
        parts.slice(1).forEach((value, index) => {
          params[`param${index}`] = value;
        });
      }
    } else {
      macroName = macroCall;
    }

    const macroDef = this.macros[macroName];
    if (!macroDef) {
      if (import.meta.env.DEV) {
        console.warn(`Macro not found: ${macroName}. Available macros:`, Object.keys(this.macros));
      }
      return {};
    }

    if (import.meta.env.DEV) {
      console.log('Found macro definition:', macroDef);
      console.log('Parsed parameters:', params);
    }

    let updates = {};

    // Process main updates
    if (macroDef.updates) {
      Object.entries(macroDef.updates).forEach(([variable, operation]) => {
        const processedVariable = this.substituteParameters(variable, params, gameState);
        const processedOperation = this.substituteParameters(operation, params, gameState);
        updates[processedVariable] = processedOperation;
        
        if (import.meta.env.DEV) {
          console.log(`Macro update: ${variable} -> ${processedVariable} = ${operation} -> ${processedOperation}`);
        }
      });
    }

    // Process conditional updates
    if (macroDef.conditions) {
      const { if: condition, then: thenUpdates, else: elseUpdates } = macroDef.conditions;
      
      if (condition) {
        const processedCondition = this.substituteParameters(condition, params, gameState);
        const conditionMet = this.evaluateCondition(processedCondition, gameState);
        
        if (import.meta.env.DEV) {
          console.log(`Conditional: ${condition} -> ${processedCondition} = ${conditionMet}`);
        }
        
        const conditionalUpdates = conditionMet ? thenUpdates : elseUpdates;
        if (conditionalUpdates) {
          Object.entries(conditionalUpdates).forEach(([variable, operation]) => {
            const processedVariable = this.substituteParameters(variable, params, gameState);
            const processedOperation = this.substituteParameters(operation, params, gameState);
            updates[processedVariable] = processedOperation;
          });
        }
      }
    }

    if (import.meta.env.DEV) {
      console.log('Final macro updates:', updates);
    }

    return updates;
  }

  // Process multiple macros
  processMacros(macroList, gameState) {
    if (!macroList || !Array.isArray(macroList)) return {};

    let allUpdates = {};

    macroList.forEach(macroCall => {
      if (typeof macroCall === 'string') {
        const updates = this.processMacro(macroCall, gameState);
        allUpdates = { ...allUpdates, ...updates };
      }
    });

    return allUpdates;
  }

  // Process conditional templates (existing functionality)
  processConditionalTemplates(conditions, gameState) {
    if (!conditions || !Array.isArray(conditions)) return '';

    let additionalText = '';

    conditions.forEach(condition => {
      if (typeof condition === 'string') {
        if (condition.includes(':')) {
          const [templateName, character] = condition.split(':');
          const template = this.conditionalTemplates[templateName];
          if (template && this.evaluateTemplateCondition(template, character, gameState)) {
            const text = template.text || '';
            additionalText += text.replace('{character}', character || '');
          }
        } else {
          const template = this.conditionalTemplates[condition];
          if (template && this.evaluateTemplateCondition(template, null, gameState)) {
            additionalText += template.text || '';
          }
        }
      }
    });

    return additionalText;
  }

  // Evaluate template condition (for conditional templates)
  evaluateTemplateCondition(template, character, gameState) {
    let variableName = template.variable;
    
    // Replace character placeholder
    if (character && variableName.includes('{character}')) {
      variableName = variableName.replace('{character}', character);
    }
    
    const currentValue = this.getVariableValue(variableName, gameState);
    const conditionValue = template.value;
    
    switch (template.operator) {
      case '>=': return currentValue >= conditionValue;
      case '<=': return currentValue <= conditionValue;
      case '>': return currentValue > conditionValue;
      case '<': return currentValue < conditionValue;
      case '==': return currentValue == conditionValue;
      case '!=': return currentValue != conditionValue;
      default: return false;
    }
  }

  // Debug: Get available macros
  getAvailableMacros() {
    return Object.keys(this.macros);
  }

  // Debug: Get macro definition
  getMacroDefinition(macroName) {
    return this.macros[macroName];
  }

  // ENHANCED: Get all current variables (for debugging)
  getAllVariables(gameState) {
    const builtin = Object.keys(gameState).filter(key => key !== 'customVariables');
    const custom = Object.keys(gameState.customVariables || {});
    return { builtin, custom, all: [...builtin, ...custom] };
  }
}

// ENHANCED: React Hook for using MacroProcessor with full dynamic support
export const useMacroProcessor = (gameData = {}) => {
  const processorRef = useRef(null);
  const gameDataRef = useRef(null);

  // Initialize processor on first run or when game data changes
  useEffect(() => {
    const macros = gameData.macros || {};
    const conditionalTemplates = gameData.conditionalTemplates || {};
    
    // Check if we need to create a new processor
    const needsNewProcessor = !processorRef.current || 
      JSON.stringify(gameDataRef.current) !== JSON.stringify({ macros, conditionalTemplates });
    
    if (needsNewProcessor) {
      processorRef.current = new MacroProcessor(macros, conditionalTemplates);
      gameDataRef.current = { macros, conditionalTemplates };
      
      if (import.meta.env.DEV) {
        console.log('MacroProcessor initialized/updated with:', {
          macros: Object.keys(macros),
          conditionalTemplates: Object.keys(conditionalTemplates)
        });
      }
    }
  }, [gameData.macros, gameData.conditionalTemplates]);

  // ENHANCED: Process macros with dynamic variable creation
  const processMacros = useCallback((macroList, gameState, setGameState) => {
    if (!processorRef.current) {
      console.warn('MacroProcessor not initialized');
      return {};
    }

    if (!Array.isArray(macroList)) {
      console.warn('Macro list must be an array:', macroList);
      return {};
    }

    if (import.meta.env.DEV) {
      console.log('Processing macros:', macroList);
      console.log('Current game state before processing:', gameState);
      console.log('Available macros in processor:', processorRef.current.getAvailableMacros());
    }

    const updates = processorRef.current.processMacros(macroList, gameState);
    
    if (import.meta.env.DEV) {
      console.log('Macro updates calculated:', updates);
    }

    if (updates && Object.keys(updates).length > 0) {
      // Use setTimeout to ensure async state update
      setTimeout(() => {
        setGameState(prevState => {
          const newState = { ...prevState };
          const newCustomVariables = { ...prevState.customVariables };

          Object.entries(updates).forEach(([key, operation]) => {
            // Get current value using the processor's method
            const currentValue = processorRef.current.getVariableValue(key, prevState);
            
            // Process the operation (handles null values for new variables)
            const newValue = processorRef.current.processOperation(operation, currentValue);

            if (import.meta.env.DEV) {
              console.log(`Updating ${key}: ${currentValue} -> ${newValue} (operation: ${operation})`);
            }

            // ENHANCED: Automatic placement logic
            if (key in newState && key !== 'customVariables') {
              // It's a built-in property
              newState[key] = newValue;
            } else {
              // It's a custom/dynamic variable
              newCustomVariables[key] = newValue;
            }
          });

          const finalState = {
            ...newState,
            customVariables: newCustomVariables
          };

          if (import.meta.env.DEV) {
            console.log('New game state after macro processing:', finalState);
            console.log('Total custom variables:', Object.keys(newCustomVariables).length);
          }

          return finalState;
        });
      }, 0);
    } else {
      if (import.meta.env.DEV) {
        console.log('No updates to apply from macros');
      }
    }

    return updates;
  }, []);

  // Process conditions for additional text
  const processConditions = useCallback((conditions, gameState) => {
    if (!processorRef.current) return '';
    return processorRef.current.processConditionalTemplates(conditions, gameState);
  }, []);

  // Get variable value (works with any dynamic variable)
  const getVariableValue = useCallback((variableName, gameState) => {
    if (!processorRef.current) return null;
    return processorRef.current.getVariableValue(variableName, gameState);
  }, []);

  // Process single macro (for testing/debugging)
  const processSingleMacro = useCallback((macroCall, gameState) => {
    if (!processorRef.current) return {};
    return processorRef.current.processMacro(macroCall, gameState);
  }, []);

  // ENHANCED: Get all variables (for debugging)
  const getAllVariables = useCallback((gameState) => {
    if (!processorRef.current) return { builtin: [], custom: [], all: [] };
    return processorRef.current.getAllVariables(gameState);
  }, []);

  return {
    processMacros,
    processConditions,
    getVariableValue,
    processSingleMacro,
    getAllVariables,
    getAvailableMacros: () => processorRef.current?.getAvailableMacros() || [],
    getMacroDefinition: (name) => processorRef.current?.getMacroDefinition(name) || null
  };
};