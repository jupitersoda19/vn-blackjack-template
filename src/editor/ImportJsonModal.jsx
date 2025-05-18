import React, { useState, useRef } from 'react';

const ImportJsonModal = ({ onImport, onClose }) => {
  const [jsonText, setJsonText] = useState('');
  const [file, setFile] = useState(null);
  const [importError, setImportError] = useState(null);
  const [importMethod, setImportMethod] = useState('paste'); // 'paste' or 'upload'
  const [importOption, setImportOption] = useState('replace'); // 'replace', 'merge', or 'events_only'
  const [validationResult, setValidationResult] = useState(null);
  const fileInputRef = useRef(null);
  
  // Handle text input change
  const handleJsonTextChange = (e) => {
    setJsonText(e.target.value);
    setImportError(null);
    setValidationResult(null);
  };
  
  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
    setImportError(null);
    setValidationResult(null);
    
    // Read file content
    const reader = new FileReader();
    reader.onload = (event) => {
      setJsonText(event.target.result);
    };
    reader.onerror = () => {
      setImportError('Error reading file');
    };
    reader.readAsText(selectedFile);
  };
  
  // Trigger file input click
  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };
  
  // Validate the JSON data
  const validateJson = () => {
    try {
      if (!jsonText.trim()) {
        setImportError('Please enter or upload JSON data');
        return null;
      }
      
      const parsedData = JSON.parse(jsonText);
      
      // Basic structure validation
      let validationMessages = [];
      let isValid = true;
      
      // Check for minimal required structure based on import option
      if (importOption === 'replace' || importOption === 'merge') {
        // For replace and merge, we need valid metadata
        if (!parsedData.metadata) {
          validationMessages.push('Warning: No metadata found in JSON');
          isValid = false;
        } else {
          const requiredMetadataFields = ['title', 'version', 'description'];
          const missingFields = requiredMetadataFields.filter(field => !parsedData.metadata[field]);
          
          if (missingFields.length > 0) {
            validationMessages.push(`Warning: Missing metadata fields: ${missingFields.join(', ')}`);
          }
        }
      }
      
      // For all options, we need valid events array (except metadata_only)
      if (!parsedData.events || !Array.isArray(parsedData.events)) {
        if (importOption !== 'metadata_only') {
          validationMessages.push('Warning: No events array found in JSON');
          isValid = false;
        }
      } else {
        // Check each event for required fields
        const eventIssues = [];
        parsedData.events.forEach((event, index) => {
          if (!event.key) {
            eventIssues.push(`Event #${index + 1} is missing a key`);
          }
          if (!event.title) {
            eventIssues.push(`Event #${index + 1} is missing a title`);
          }
        });
        
        if (eventIssues.length > 0) {
          validationMessages.push(`Event issues: ${eventIssues.join(', ')}`);
        }
        
        // Check for duplicate keys
        const keys = parsedData.events.map(event => event.key);
        const duplicateKeys = keys.filter((key, index) => keys.indexOf(key) !== index);
        
        if (duplicateKeys.length > 0) {
          validationMessages.push(`Warning: Duplicate event keys found: ${[...new Set(duplicateKeys)].join(', ')}`);
        }
      }
      
      // Set validation result
      setValidationResult({
        isValid,
        messages: validationMessages,
        summary: {
          metadata: parsedData.metadata ? 'Present' : 'Missing',
          events: parsedData.events ? parsedData.events.length : 0
        }
      });
      
      if (isValid || validationMessages.length === 0) {
        return parsedData;
      } else {
        // We return the data even with warnings, but the user needs to confirm
        return parsedData;
      }
    } catch (error) {
      setImportError(`Invalid JSON: ${error.message}`);
      return null;
    }
  };
  
  // Handle import button click
  const handleImport = () => {
    const validData = validateJson();
    
    if (!validData) {
      return; // Error was set in validateJson
    }
    
    try {
      // Call the onImport callback with the validated data and option
      onImport(validData, importOption);
      onClose();
    } catch (error) {
      setImportError(`Import error: ${error.message}`);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 overflow-auto py-10">
      <div className="bg-gray-800 p-6 rounded-lg border border-yellow-700 max-w-3xl w-full">
        <h3 className="text-xl font-bold text-yellow-500 mb-4">Import Game Data</h3>
        
        <div className="mb-4">
          <div className="flex space-x-4 mb-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-yellow-600"
                name="importMethod"
                value="paste"
                checked={importMethod === "paste"}
                onChange={() => setImportMethod("paste")}
              />
              <span className="ml-2 text-yellow-300">Paste JSON</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-yellow-600"
                name="importMethod"
                value="upload"
                checked={importMethod === "upload"}
                onChange={() => setImportMethod("upload")}
              />
              <span className="ml-2 text-yellow-300">Upload File</span>
            </label>
          </div>
          
          {importMethod === "upload" && (
            <div className="mb-4">
              <div className="flex items-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  onClick={handleBrowseClick}
                  className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded"
                >
                  Browse...
                </button>
                <span className="ml-3 text-gray-300">
                  {file ? file.name : "No file selected"}
                </span>
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-yellow-400 text-sm font-bold mb-2">
              {importMethod === "paste" ? "Paste JSON Here" : "File Content"}
            </label>
            <textarea
              className="w-full bg-gray-900 text-white border border-yellow-600 rounded py-2 px-3 h-64 font-mono text-sm focus:outline-none focus:border-yellow-500"
              value={jsonText}
              onChange={handleJsonTextChange}
              placeholder={importMethod === "paste" ? "Paste your JSON data here..." : "File contents will appear here..."}
              readOnly={importMethod === "upload"}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-yellow-400 text-sm font-bold mb-2">
              Import Option
            </label>
            <select
              className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-2 px-3 focus:outline-none focus:border-yellow-500"
              value={importOption}
              onChange={(e) => setImportOption(e.target.value)}
            >
              <option value="replace">Replace All (Metadata + Events)</option>
              <option value="merge">Merge (Add to existing events)</option>
              <option value="events_only">Events Only (Keep current metadata)</option>
              <option value="metadata_only">Metadata Only (Keep current events)</option>
            </select>
          </div>
          
          {importError && (
            <div className="bg-red-900 text-red-200 p-3 rounded mb-4">
              {importError}
            </div>
          )}
          
          {validationResult && (
            <div className={`p-3 rounded mb-4 ${
              validationResult.isValid ? 'bg-green-900 text-green-200' : 'bg-yellow-900 text-yellow-200'
            }`}>
              <h4 className="font-bold mb-2">Validation Results</h4>
              
              <div className="mb-2">
                <div><span className="font-semibold">Metadata:</span> {validationResult.summary.metadata}</div>
                <div><span className="font-semibold">Events:</span> {validationResult.summary.events}</div>
              </div>
              
              {validationResult.messages.length > 0 && (
                <div>
                  <div className="font-semibold">Warnings:</div>
                  <ul className="list-disc list-inside">
                    {validationResult.messages.map((msg, idx) => (
                      <li key={idx}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button
            className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded flex-1"
            onClick={() => validateJson()}
          >
            Validate JSON
          </button>
          <button
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded flex-1"
            onClick={handleImport}
            disabled={!jsonText.trim()}
          >
            Import
          </button>
          <button
            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportJsonModal;