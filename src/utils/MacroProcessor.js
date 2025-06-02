import { useCallback, useRef, useEffect } from 'react';

export class MacroProcessor {
  constructor(macroDefinitions = {}, conditionalTemplates = {}) {
    this.macros = macroDefinitions;
    this.conditionalTemplates = conditionalTemplates;
  }

  getVariableValue(variableName, gameState) {
    // Check main game state first (built-in properties)
    if (gameState.hasOwnProperty(variableName) && variableName !== 'customVariables') {
      return gameState[variableName];
    }
    
    // Check custom variables (dynamic variables)
    if (gameState.customVariables && gameState.customVariables.hasOwnProperty(variableName)) {
      return gameState.customVariables[variableName];
    }
    
    // Return null for non-existent variables
    return null;
  }

  // PRIORITY 1: Enhanced condition parsing with AND/OR/NOT support
  parseComplexCondition(condition, gameState) {
    if (typeof condition !== 'string') return false;

    if (import.meta.env.DEV) {
      console.log('Parsing complex condition:', condition);
    }

    // Handle parentheses by recursively evaluating inner expressions first
    while (condition.includes('(')) {
      const innerMatch = condition.match(/\(([^()]+)\)/);
      if (!innerMatch) break;
      
      const innerResult = this.parseComplexCondition(innerMatch[1], gameState);
      condition = condition.replace(innerMatch[0], innerResult.toString());
    }

    // Handle NOT operator (highest precedence)
    if (condition.trim().startsWith('NOT ')) {
      const innerCondition = condition.substring(4).trim();
      return !this.parseComplexCondition(innerCondition, gameState);
    }

    // Handle OR operator (lowest precedence)
    if (condition.includes(' OR ')) {
      const parts = condition.split(' OR ');
      return parts.some(part => this.parseComplexCondition(part.trim(), gameState));
    }

    // Handle AND operator (medium precedence)
    if (condition.includes(' AND ')) {
      const parts = condition.split(' AND ');
      return parts.every(part => this.parseComplexCondition(part.trim(), gameState));
    }

    // Handle single conditions
    return this.evaluateSingleCondition(condition.trim(), gameState);
  }

  // PRIORITY 1 & 2: Enhanced single condition evaluation
  evaluateSingleCondition(condition, gameState) {
    if (import.meta.env.DEV) {
      console.log('Evaluating single condition:', condition);
    }

    // Handle variable existence check: "variableExists varName"
    if (condition.startsWith('variableExists ')) {
      const varName = condition.substring(15).trim();
      const exists = this.getVariableValue(varName, gameState) !== null;
      return exists;
    }

    // Handle array/collection operations
    const collectionMatch = condition.match(/{\$(\w+)}\s+(contains|notContains|isEmpty|size)\s*(.*)$/);
    if (collectionMatch) {
      const [, varName, operation, operand] = collectionMatch;
      const value = this.getVariableValue(varName, gameState);
      
      switch (operation) {
        case 'contains':
          if (!Array.isArray(value)) return false;
          const containsItem = operand.trim().replace(/"/g, '');
          return value.includes(containsItem);
          
        case 'notContains':
          if (!Array.isArray(value)) return true;
          const notContainsItem = operand.trim().replace(/"/g, '');
          return !value.includes(notContainsItem);
          
        case 'isEmpty':
          if (Array.isArray(value)) return value.length === 0;
          if (typeof value === 'string') return value.length === 0;
          if (typeof value === 'object' && value !== null) return Object.keys(value).length === 0;
          return value === null || value === undefined;
          
        case 'size':
          if (!operand.trim()) {
            // Just return the size
            if (Array.isArray(value)) return value.length;
            if (typeof value === 'string') return value.length;
            if (typeof value === 'object' && value !== null) return Object.keys(value).length;
            return 0;
          }
          
          // Compare size with operand: "size >= 5"
          const sizeMatch = operand.trim().match(/([><=!]+)\s*(\d+)/);
          if (sizeMatch) {
            const [, operator, threshold] = sizeMatch;
            let actualSize = 0;
            if (Array.isArray(value)) actualSize = value.length;
            else if (typeof value === 'string') actualSize = value.length;
            else if (typeof value === 'object' && value !== null) actualSize = Object.keys(value).length;
            
            return this.compareValues(actualSize, operator, parseInt(threshold));
          }
          return false;
      }
    }

    // Handle variable-to-variable comparison: "{$var1} > {$var2}"
    const varCompareMatch = condition.match(/{\$(\w+)}\s*([><=!]+)\s*{\$(\w+)}/);
    if (varCompareMatch) {
      const [, var1, operator, var2] = varCompareMatch;
      const value1 = this.getVariableValue(var1, gameState);
      const value2 = this.getVariableValue(var2, gameState);
      
      if (import.meta.env.DEV) {
        console.log(`Variable comparison: ${var1}(${value1}) ${operator} ${var2}(${value2})`);
      }
      
      return this.compareValues(value1, operator, value2);
    }

    // Handle template conditions (e.g., "{$winStreak} >= 3")
    const templateMatch = condition.match(/{\$(\w+)}\s*([><=!]+)\s*(.+)/);
      if (templateMatch) {
        const [, variable, operator, value] = templateMatch;
        const currentValue = this.getVariableValue(variable, gameState);
        
        let compareValue;
        if (value.startsWith('"') && value.endsWith('"')) {
          compareValue = value.slice(1, -1); // Remove quotes for string comparison
        } else if (value === 'true') {
          compareValue = true;
        } else if (value === 'false') {
          compareValue = false;
        } else {
          compareValue = parseFloat(value);
          if (isNaN(compareValue)) {
            compareValue = value; 
          }
        }

      return this.compareValues(currentValue, operator, compareValue);
    }

    // Handle simple template references (e.g., "{$hasKey}")
    if (condition.startsWith('{$') && condition.endsWith('}')) {
      const variable = condition.slice(2, -1);
      const value = this.getVariableValue(variable, gameState);
      return !!value; // Convert to boolean
    }

    // Handle boolean literals
    if (condition === 'true') return true;
    if (condition === 'false') return false;

    // If we get here, condition format not recognized
    if (import.meta.env.DEV) {
      console.warn('Unrecognized condition format:', condition);
    }
    return false;
  }

  compareValues(value1, operator, value2) {
    if (value1 === null || value1 === undefined) value1 = 0;
    if (value2 === null || value2 === undefined) value2 = 0;

    switch (operator) {
      case '>=': return value1 >= value2;
      case '<=': return value1 <= value2;
      case '>': return value1 > value2;
      case '<': return value1 < value2;
      case '==': return value1 == value2;
      case '===': return value1 === value2;
      case '!=': return value1 != value2;
      case '!==': return value1 !== value2;
      default: 
        if (import.meta.env.DEV) {
          console.warn('Unknown operator:', operator);
        }
        return false;
    }
  }

  processFlowControlMacro(macroName, params, gameState) {
    const flowUpdates = {};

    switch (macroName) {
      case 'jumpToEvent':
        if (params.event) {
          flowUpdates.flowControl = params.event;
          if (import.meta.env.DEV) {
            console.log(`Flow control: Jump to event ${params.event}`);
          }
        }
        break;

      case 'setNextEvent':
        if (params.event) {
          flowUpdates.flowControl = params.event;
          if (import.meta.env.DEV) {
            console.log(`Flow control: Set next event to ${params.event}`);
          }
        }
        break;

      case 'skipToEvent':
        if (params.event) {
          flowUpdates.flowControl = params.event;
          if (import.meta.env.DEV) {
            console.log(`Flow control: Skip to event ${params.event}`);
          }
        }
        break;

      case 'jumpIf':
        if (params.condition && params.event) {
          const conditionMet = this.parseComplexCondition(params.condition, gameState);
          if (conditionMet) {
            flowUpdates.flowControl = params.event;
          } else if (params.fallback) {
            flowUpdates.flowControl = params.fallback;
          }
          if (import.meta.env.DEV) {
            console.log(`Conditional jump: ${params.condition} = ${conditionMet}, jumping to ${conditionMet ? params.event : params.fallback || 'nowhere'}`);
          }
        }
        break;
    }

    return flowUpdates;
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

  // FIXED: Process operations with automatic variable initialization
  processOperation(operation, currentValue = null) {
    if (typeof operation !== 'string') return operation;

    const operationStr = String(operation);

    // ENHANCED: Smart initialization for new variables (currentValue === null)
    if (currentValue === null) {
      if (operationStr.startsWith('+') || operationStr.startsWith('-') || 
          operationStr.startsWith('*') || operationStr.startsWith('/') ||
          operationStr === '++' || operationStr === '--') {
        currentValue = 0; // Initialize numeric operations to 0
      } else if (operationStr.startsWith('push:') || operationStr.startsWith('remove:')) {
        currentValue = []; // Initialize array operations to empty array
      } else if (operationStr === 'toggle') {
        currentValue = false; // Initialize boolean operations to false
      } else if (operationStr.startsWith('=')) {
        // Direct assignment - will be handled below
        currentValue = 0;
      } else if (operationStr.startsWith('random:')) {
        // Random operations don't need initialization
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

    // FIXED: Addition: "+5"
    if (operationStr.startsWith('+') && operationStr !== '++') {
      const addValue = parseFloat(operationStr.substring(1));
      if (isNaN(addValue)) {
        if (import.meta.env.DEV) {
          console.warn('Invalid addition value:', operationStr);
        }
        return currentValue;
      }
      const result = (typeof currentValue === 'number' ? currentValue : 0) + addValue;
      if (import.meta.env.DEV) {
        console.log(`Addition: ${currentValue} + ${addValue} = ${result}`);
      }
      return result;
    }

    // FIXED: Subtraction: "-3"
    if (operationStr.startsWith('-') && operationStr !== '--') {
      const subValue = parseFloat(operationStr.substring(1));
      if (isNaN(subValue)) {
        if (import.meta.env.DEV) {
          console.warn('Invalid subtraction value:', operationStr);
        }
        return currentValue;
      }
      const result = (typeof currentValue === 'number' ? currentValue : 0) - subValue;
      if (import.meta.env.DEV) {
        console.log(`Subtraction: ${currentValue} - ${subValue} = ${result}`);
      }
      return result;
    }

    // FIXED: Absolute assignment: "=10"
    if (operationStr.startsWith('=')) {
      const assignValue = operationStr.substring(1);
      
      // Handle special assignments
      if (assignValue === '[]') {
        if (import.meta.env.DEV) {
          console.log('Assignment: = []');
        }
        return [];
      }
      if (assignValue === '{}') {
        if (import.meta.env.DEV) {
          console.log('Assignment: = {}');
        }
        return {};
      }
      if (assignValue === 'true') {
        if (import.meta.env.DEV) {
          console.log('Assignment: = true');
        }
        return true;
      }
      if (assignValue === 'false') {
        if (import.meta.env.DEV) {
          console.log('Assignment: = false');
        }
        return false;
      }
      if (assignValue === '') {
        if (import.meta.env.DEV) {
          console.log('Assignment: = null');
        }
        return null;
      }
      
      const numValue = parseFloat(assignValue);
      const result = isNaN(numValue) ? assignValue : numValue;
      if (import.meta.env.DEV) {
        console.log(`Assignment: = ${result}`);
      }
      return result;
    }

    // FIXED: Multiplication: "*2"
    if (operationStr.startsWith('*')) {
      const multValue = parseFloat(operationStr.substring(1));
      if (isNaN(multValue)) {
        if (import.meta.env.DEV) {
          console.warn('Invalid multiplication value:', operationStr);
        }
        return currentValue;
      }
      const result = (typeof currentValue === 'number' ? currentValue : 0) * multValue;
      if (import.meta.env.DEV) {
        console.log(`Multiplication: ${currentValue} * ${multValue} = ${result}`);
      }
      return result;
    }

    // FIXED: Division: "/2"
    if (operationStr.startsWith('/')) {
      const divValue = parseFloat(operationStr.substring(1));
      if (isNaN(divValue) || divValue === 0) {
        if (import.meta.env.DEV) {
          console.warn('Invalid division value:', operationStr);
        }
        return currentValue;
      }
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

    // FIXED: Random number: "random:1-10" or "random:10"
    if (operationStr.startsWith('random:')) {
      const range = operationStr.substring(7);
      let result;
      if (range.includes('-')) {
        const [min, max] = range.split('-').map(Number);
        if (isNaN(min) || isNaN(max)) {
          if (import.meta.env.DEV) {
            console.warn('Invalid random range:', range);
          }
          return 0;
        }
        result = Math.floor(Math.random() * (max - min + 1)) + min;
      } else {
        const maxValue = parseFloat(range);
        if (isNaN(maxValue)) {
          if (import.meta.env.DEV) {
            console.warn('Invalid random max value:', range);
          }
          return 0;
        }
        result = Math.floor(Math.random() * maxValue);
      }
      if (import.meta.env.DEV) {
        console.log(`Random: ${range} = ${result}`);
      }
      return result;
    }

    // FIXED: Boolean toggle: "toggle"
    if (operationStr === 'toggle') {
      const result = !currentValue;
      if (import.meta.env.DEV) {
        console.log(`Toggle: ${currentValue} -> ${result}`);
      }
      return result;
    }

    // FIXED: Support for increment/decrement shortcuts
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

  // FIXED: Enhanced macro processing with proper flow control and sequential operations
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
        // Handle built-in flow control macros
        if (['jumpToEvent', 'setNextEvent', 'skipToEvent', 'jumpIf'].includes(macroName)) {
          switch (macroName) {
            case 'jumpIf':
              params.condition = parts[1];
              params.event = parts[2];
              params.fallback = parts[3];
              break;
            default:
              params.event = parts[1];
              break;
          }
        } else {
          // Generic parameter names for other macros
          parts.slice(1).forEach((value, index) => {
            params[`param${index}`] = value;
          });
        }
      }
    } else {
      macroName = macroCall;
    }

    // Handle flow control macros
    if (['jumpToEvent', 'setNextEvent', 'skipToEvent', 'jumpIf'].includes(macroName)) {
      return this.processFlowControlMacro(macroName, params, gameState);
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

    let workingState = {
      ...gameState,
      customVariables: { ...(gameState.customVariables || {}) }
    };

    // FIXED: Process main updates with proper sequential operations handling
    if (macroDef.updates) {
      // Convert to array of [variable, operation] pairs to preserve order
      const updateEntries = Object.entries(macroDef.updates);
      
      // Group operations by variable while preserving order
      const operationsByVariable = {};
      const variableOrder = [];
      
      updateEntries.forEach(([variable, operation]) => {
        const processedVariable = this.substituteParameters(variable, params, gameState);
        const processedOperation = this.substituteParameters(operation, params, gameState);
        
        if (!operationsByVariable[processedVariable]) {
          operationsByVariable[processedVariable] = [];
          variableOrder.push(processedVariable);
        }
        
        operationsByVariable[processedVariable].push(processedOperation);
      });

      // Apply operations sequentially for each variable in order
      variableOrder.forEach(variable => {
        const operations = operationsByVariable[variable];
        let currentValue = this.getVariableValue(variable, gameState);
        
        if (import.meta.env.DEV) {
          console.log(`Processing ${operations.length} sequential operations for ${variable}:`, operations);
          console.log(`Starting value:`, currentValue);
        }
        
        // Apply each operation in sequence
        operations.forEach((operation, index) => {
          const newValue = this.processOperation(operation, currentValue);
          
          if (import.meta.env.DEV) {
            console.log(`  Step ${index + 1}: ${operation} → ${currentValue} becomes ${newValue}`);
          }
          
          currentValue = newValue;
        });
        
        // Store final result for this variable
        updates[variable] = currentValue;
        
        if (import.meta.env.DEV) {
          console.log(`Final value for ${variable}:`, currentValue);
        }
      });
    }

    // Process conditions
    if (macroDef.conditions) {
      const { if: condition, then: thenUpdates, else: elseUpdates } = macroDef.conditions;
      
      if (condition) {
        const processedCondition = this.substituteParameters(condition, params, gameState);
        const conditionMet = this.parseComplexCondition(processedCondition, gameState);
        
        if (import.meta.env.DEV) {
          console.log(`Conditional: ${condition} -> ${processedCondition} = ${conditionMet}`);
        }
        
        const conditionalUpdates = conditionMet ? thenUpdates : elseUpdates;
        if (conditionalUpdates) {
          Object.entries(conditionalUpdates).forEach(([variable, operation]) => {
            const processedVariable = this.substituteParameters(variable, params, workingState);
            const processedOperation = this.substituteParameters(operation, params, workingState);
            const currentValue = this.getVariableValue(processedVariable, workingState);
            updates[processedVariable] = this.processOperation(processedOperation, currentValue);
            if (processedVariable in workingState && processedVariable !== 'customVariables') {
              workingState[processedVariable] = newValue;
            } else {
              if (!workingState.customVariables) {
                workingState.customVariables = {};
              }
              workingState.customVariables[processedVariable] = newValue;
            }
          });
        }
      }
    }

    if (import.meta.env.DEV) {
      console.log('Final macro updates:', updates);
    }

    return updates;
  }

  processMacros(macroList, gameState) {
    if (!macroList || !Array.isArray(macroList)) return {};

    let allUpdates = {};
    let currentState = { 
      ...gameState,
      customVariables: { ...(gameState.customVariables || {}) }
    };

    for (const macroCall of macroList) {
      if (typeof macroCall === 'string') {
        const updates = this.processMacro(macroCall, currentState);
        
        // Check for flow control first
        if (updates.flowControl) {
          allUpdates.flowControl = updates.flowControl;
          
          // Apply any other updates from this macro
          Object.entries(updates).forEach(([variable, value]) => {
            if (variable !== 'flowControl') {
              allUpdates[variable] = value;
            }
          });
          
          // Stop processing remaining macros
          break;
        }
        
        // Apply updates to both final result and working state
        Object.entries(updates).forEach(([variable, value]) => {
          allUpdates[variable] = value;
          
          // Update working state for next macro
          if (variable in currentState && variable !== 'customVariables') {
            currentState[variable] = value;
          } else {
            if (!currentState.customVariables) {
              currentState.customVariables = {};
            }
            currentState.customVariables[variable] = value;
          }
        });
      }
    }

    return allUpdates;
  }

  processConditionalTemplates(conditions, gameState) {
    if (!conditions) return '';

    // Handle array format (new MacroProcessor format)
    if (Array.isArray(conditions)) {
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

    // Handle object format (legacy VisualNovelEngine format)
    if (typeof conditions === 'object') {
      return this.processConditionalTextObject(conditions, gameState);
    }

    return '';
  }

  evaluateTemplateCondition(template, character, gameState) {
    let variableName = template.variable;
    
    // Replace character placeholder
    if (character && variableName.includes('{character}')) {
      variableName = variableName.replace('{character}', character);
    }
    
    const currentValue = this.getVariableValue(variableName, gameState);
    const conditionValue = template.value;
    
    return this.compareValues(currentValue, template.operator, conditionValue);
  }

  processConditionalTextObject(conditionalTextObj, gameState) {
    if (!conditionalTextObj || typeof conditionalTextObj !== 'object') return '';

    let additionalText = '';

    Object.entries(conditionalTextObj).forEach(([conditionKey, text]) => {
      // Handle multiple conditions with + separator (legacy VisualNovelEngine format)
      const conditions = conditionKey.split(' + ');
      let allConditionsMet = true;

      for (const condition of conditions) {
        let conditionMet = false;

        if (condition.includes(':')) {
          // Template condition like "likesYou:rachel"
          const [templateName, character] = condition.split(':');
          const template = this.conditionalTemplates[templateName];
          if (template) {
            let variableName = template.variable.replace('{character}', character);
            const currentValue = this.getVariableValue(variableName, gameState);
            conditionMet = this.compareValues(currentValue, template.operator, template.value);
          }
        } else if (condition.includes(' ')) {
          // Inline condition like "playerMoney >= 1000"
          const parts = condition.split(' ');
          if (parts.length === 3) {
            const [variable, operator, value] = parts;
            const currentValue = this.getVariableValue(variable, gameState);
            const numValue = isNaN(parseFloat(value)) ? value.replace(/"/g, '') : parseFloat(value);
            conditionMet = this.compareValues(currentValue, operator, numValue);
          }
        } else {
          // Simple template condition
          const template = this.conditionalTemplates[condition];
          if (template) {
            const currentValue = this.getVariableValue(template.variable, gameState);
            conditionMet = this.compareValues(currentValue, template.operator, template.value);
          }
        }

        if (!conditionMet) {
          allConditionsMet = false;
          break;
        }
      }

      if (allConditionsMet) {
        additionalText += text;
      }
    });

    return additionalText;
  }

  evaluateCondition(condition, gameState) {
    return this.parseComplexCondition(condition, gameState);
  }

  getAvailableMacros() {
    const builtInMacros = ['jumpToEvent', 'setNextEvent', 'skipToEvent', 'jumpIf'];
    const userMacros = Object.keys(this.macros);
    return [...builtInMacros, ...userMacros];
  }

  getMacroDefinition(macroName) {
    return this.macros[macroName];
  }

  getAllVariables(gameState) {
    const builtin = Object.keys(gameState).filter(key => key !== 'customVariables');
    const custom = Object.keys(gameState.customVariables || {});
    return { builtin, custom, all: [...builtin, ...custom] };
  }
}

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

  // MAIN HOOK METHOD: Process macros and return updates (including flow control)
  const processMacros = useCallback((macroList, gameState) => {
    if (!processorRef.current) {
      console.warn('MacroProcessor not initialized');
      return {};
    }

    if (!Array.isArray(macroList)) {
      console.warn('Macro list must be an array:', macroList);
      return {};
    }

    const updates = processorRef.current.processMacros(macroList, gameState);
    
    return updates;
  }, []);

  const processConditions = useCallback((conditions, gameState) => {
    if (!processorRef.current) return '';
    return processorRef.current.processConditionalTemplates(conditions, gameState);
  }, []);

  const getVariableValue = useCallback((variableName, gameState) => {
    if (!processorRef.current) return null;
    return processorRef.current.getVariableValue(variableName, gameState);
  }, []);

  const processSingleMacro = useCallback((macroCall, gameState) => {
    if (!processorRef.current) return {};
    return processorRef.current.processMacro(macroCall, gameState);
  }, []);

  const getAllVariables = useCallback((gameState) => {
    if (!processorRef.current) return { builtin: [], custom: [], all: [] };
    return processorRef.current.getAllVariables(gameState);
  }, []);

  const processOperation = useCallback((operation, currentValue) => {
    if (!processorRef.current) {
      console.warn('MacroProcessor not initialized for operation:', operation);
      return currentValue;
    }
    return processorRef.current.processOperation(operation, currentValue);
  }, []);

  return {
    processMacros, 
    processConditions,
    processConditionalText: useCallback((conditionalTextObj, gameState) => {
      if (!processorRef.current) return '';
      return processorRef.current.processConditionalTextObject(conditionalTextObj, gameState);
    }, []),
    evaluateCondition: useCallback((condition, gameState) => {
      if (!processorRef.current) return false;
      return processorRef.current.evaluateCondition(condition, gameState);
    }, []),
    getVariableValue,
    processSingleMacro,
    getAllVariables,
    processOperation,
    getAvailableMacros: () => processorRef.current?.getAvailableMacros() || [],
    getMacroDefinition: (name) => processorRef.current?.getMacroDefinition(name) || null
  };
};