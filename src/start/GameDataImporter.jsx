import React, { useState } from 'react';

const GameDataImporter = ({ onImport, onCancel }) => {
  const [importText, setImportText] = useState('');
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
  const [importMode, setImportMode] = useState('single'); // 'single', 'multiple', or 'merge'
  const [splitFiles, setSplitFiles] = useState([]);
  const [mergeFiles, setMergeFiles] = useState([]);
  const [selectedFileType, setSelectedFileType] = useState('complete'); // 'complete', 'metadata', 'events'
  const [mergedResult, setMergedResult] = useState(null);
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
   
    const reader = new FileReader();
    reader.onload = (event) => {
      setImportText(event.target.result);
      
      // Reset any previous split files
      setSplitFiles([]);
      setMergedResult(null);
    };
    reader.readAsText(file);
  };
  
  const handleMultipleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Reset any previous state
    setMergeFiles([]);
    setError(null);
    setMergedResult(null);
    
    // Read each file
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target.result;
          const parsedData = JSON.parse(content);
          
          setMergeFiles(prevFiles => [
            ...prevFiles,
            {
              name: file.name,
              content: content,
              parsed: parsedData,
              type: determineFileType(parsedData)
            }
          ]);
        } catch (e) {
          setError(`Error reading file ${file.name}: ${e.message}`);
        }
      };
      reader.readAsText(file);
    });
  };
  
  // Helper function to determine file type
  const determineFileType = (data) => {
    if (data.fileType) {
      return data.fileType; // If explicitly specified
    }
    
    if (data.metadata && data.events) {
      return 'complete';
    }
    
    if (data.metadata && !data.events) {
      return 'metadata';
    }
    
    if (data.events && !data.metadata) {
      return 'events';
    }
    
    return 'unknown';
  };
  
  const handleSplitJSON = () => {
    try {
      const parsedData = JSON.parse(importText);
      
      // Basic validation
      if (!parsedData.events || !Array.isArray(parsedData.events)) {
        throw new Error("Invalid game data: 'events' array is required");
      }
     
      if (!parsedData.metadata || typeof parsedData.metadata !== 'object') {
        throw new Error("Invalid game data: 'metadata' object is required");
      }
      
      // Create separate files
      const metadata = {
        ...parsedData.metadata,
        version: parsedData.metadata.version || "1.0.0",
        fileType: "metadata"
      };
      
      // Group events by their type or category
      const eventGroups = {};
      
      parsedData.events.forEach(event => {
        // You can define your own logic for grouping events
        // Here we're using the first part of the event key (before underscore) as the category
        const category = event.key.split('_')[0] || 'main';
        
        if (!eventGroups[category]) {
          eventGroups[category] = [];
        }
        
        eventGroups[category].push({
          ...event,
          version: "1.0.0" // Add version to each event
        });
      });
      
      // Create an array of split files
      const newSplitFiles = [
        {
          name: "metadata.json",
          content: JSON.stringify(metadata, null, 2),
          type: "metadata"
        }
      ];
      
      // Add each event group as a separate file
      Object.entries(eventGroups).forEach(([category, events]) => {
        newSplitFiles.push({
          name: `events_${category}.json`,
          content: JSON.stringify({ 
            events,
            version: "1.0.0",
            fileType: "events",
            category
          }, null, 2),
          type: "events",
          category
        });
      });
      
      // Also keep the complete file
      newSplitFiles.push({
        name: "complete_game.json",
        content: JSON.stringify({
          ...parsedData,
          version: parsedData.metadata.version || "1.0.0"
        }, null, 2),
        type: "complete"
      });
      
      setSplitFiles(newSplitFiles);
      setImportMode('multiple');
      setError(null);
    } catch (e) {
      setError(`Error splitting game data: ${e.message}`);
    }
  };
  
  const handleMergeFiles = () => {
    try {
      if (mergeFiles.length === 0) {
        throw new Error("No files to merge");
      }
      
      // Start with an empty result object
      let result = {
        metadata: {},
        events: [],
        version: "1.0.0"
      };
      
      // Process each file based on its type
      mergeFiles.forEach(file => {
        const data = file.parsed;
        
        switch (file.type) {
          case 'complete':
            // Merge metadata
            result.metadata = { ...result.metadata, ...data.metadata };
            
            // For complete files, merge events, avoiding duplicates
            if (data.events && Array.isArray(data.events)) {
              // Add events, avoiding duplicates by key
              const existingKeys = new Set(result.events.map(e => e.key));
              data.events.forEach(event => {
                if (!existingKeys.has(event.key)) {
                  result.events.push(event);
                  existingKeys.add(event.key);
                }
              });
            }
            break;
            
          case 'metadata':
            // Update or override metadata properties
            result.metadata = { ...result.metadata, ...data };
            break;
            
          case 'events':
            // For event files, append all events, avoiding duplicates
            if (data.events && Array.isArray(data.events)) {
              const existingKeys = new Set(result.events.map(e => e.key));
              data.events.forEach(event => {
                if (!existingKeys.has(event.key)) {
                  result.events.push(event);
                  existingKeys.add(event.key);
                }
              });
            }
            break;
            
          default:
            console.warn(`Unknown file type for ${file.name}, attempting to merge as best as possible`);
            // Try to identify and merge recognizable structures
            if (data.metadata) {
              result.metadata = { ...result.metadata, ...data.metadata };
            }
            if (data.events && Array.isArray(data.events)) {
              const existingKeys = new Set(result.events.map(e => e.key));
              data.events.forEach(event => {
                if (!existingKeys.has(event.key)) {
                  result.events.push(event);
                  existingKeys.add(event.key);
                }
              });
            }
        }
        
        // Use the highest version found across all files
        if (data.version) {
          const currentVersion = result.version.split('.').map(Number);
          const newVersion = data.version.split('.').map(Number);
          
          // Simple version comparison (could be enhanced for more complex version formats)
          let useNewVersion = false;
          for (let i = 0; i < Math.max(currentVersion.length, newVersion.length); i++) {
            const current = currentVersion[i] || 0;
            const newVer = newVersion[i] || 0;
            
            if (newVer > current) {
              useNewVersion = true;
              break;
            } else if (current > newVer) {
              break;
            }
          }
          
          if (useNewVersion) {
            result.version = data.version;
          }
        }
      });
      
      // Sort events by key for consistency
      result.events.sort((a, b) => a.key.localeCompare(b.key));
      
      // Format the result for display
      const formattedResult = JSON.stringify(result, null, 2);
      setMergedResult(formattedResult);
      setError(null);
    } catch (e) {
      setError(`Error merging files: ${e.message}`);
    }
  };
  
  const handleDownloadFile = (fileData) => {
    const blob = new Blob([fileData.content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileData.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleDownloadMergedResult = () => {
    if (!mergedResult) return;
    
    const blob = new Blob([mergedResult], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "merged_game.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleDownloadAll = () => {
    // Create a zip file with all the split files
    // For this example we're just downloading them one by one
    splitFiles.forEach(file => {
      handleDownloadFile(file);
    });
  };
  
  const handleImport = () => {
    try {
      if (importMode === 'single') {
        const parsedData = JSON.parse(importText);
       
        // Basic validation
        if (!parsedData.events || !Array.isArray(parsedData.events)) {
          throw new Error("Invalid game data: 'events' array is required");
        }
       
        if (!parsedData.metadata || typeof parsedData.metadata !== 'object') {
          throw new Error("Invalid game data: 'metadata' object is required");
        }
        
        // Add version if it doesn't exist
        if (!parsedData.metadata.version) {
          parsedData.metadata.version = "1.0.0";
        }
       
        onImport(parsedData);
      } else if (importMode === 'multiple') {
        // For multiple files, find the one that matches the selected type
        const selectedFile = splitFiles.find(file => file.type === selectedFileType);
        if (selectedFile) {
          const parsedData = JSON.parse(selectedFile.content);
          onImport(parsedData);
        } else {
          throw new Error(`No file found with type: ${selectedFileType}`);
        }
      } else if (importMode === 'merge') {
        // Import the merged result
        if (mergedResult) {
          const parsedData = JSON.parse(mergedResult);
          onImport(parsedData);
        } else {
          throw new Error("No merged data available. Please merge files first.");
        }
      }
    } catch (e) {
      setError(`Error importing game data: ${e.message}`);
    }
  };
  
  // UI for single file mode
  const renderSingleFileMode = () => (
    <div className="mb-4">
      <label className="block text-yellow-400 text-sm font-bold mb-2">
        Or paste JSON directly:
      </label>
      <textarea
        className="w-full h-48 p-2 bg-gray-800 text-yellow-100 border border-yellow-700 rounded font-mono text-sm"
        value={importText}
        onChange={(e) => setImportText(e.target.value)}
        placeholder="Paste game data JSON here..."
      />
      
      {importText && (
        <div className="mt-3">
          <button
            className="bg-purple-700 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded mr-2"
            onClick={handleSplitJSON}
          >
            Split into Multiple Files
          </button>
        </div>
      )}
    </div>
  );
  
  // UI for multiple file mode (split files)
  const renderMultipleFileMode = () => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-yellow-400">Split Files</h3>
        <button
          className="bg-green-700 hover:bg-green-600 text-white font-bold py-1 px-3 rounded text-sm"
          onClick={handleDownloadAll}
        >
          Download All Files
        </button>
      </div>
      
      <div className="bg-gray-800 border border-yellow-700 rounded p-3 mb-3">
        <div className="grid grid-cols-4 gap-2 mb-2 border-b border-yellow-800 pb-2">
          <div className="text-yellow-500 font-semibold">File Type</div>
          <div className="text-yellow-500 font-semibold">File Name</div>
          <div className="text-yellow-500 font-semibold">Version</div>
          <div className="text-yellow-500 font-semibold">Actions</div>
        </div>
        
        {splitFiles.map((file, index) => {
          const fileData = JSON.parse(file.content);
          const version = fileData.version || fileData.metadata?.version || "1.0.0";
          
          return (
            <div key={index} className="grid grid-cols-4 gap-2 py-2 border-b border-gray-700">
              <div className="text-yellow-300">{file.type}</div>
              <div className="text-yellow-300">{file.name}</div>
              <div className="text-yellow-300">{version}</div>
              <div>
                <button
                  className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded text-xs mr-1"
                  onClick={() => handleDownloadFile(file)}
                >
                  Download
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4">
        <label className="block text-yellow-400 text-sm font-bold mb-2">
          Select file type to import:
        </label>
        <select
          className="bg-gray-800 text-yellow-300 border border-yellow-700 rounded p-2 w-full"
          value={selectedFileType}
          onChange={(e) => setSelectedFileType(e.target.value)}
        >
          <option value="complete">Complete Game File</option>
          <option value="metadata">Metadata Only</option>
          {splitFiles
            .filter(file => file.type === 'events')
            .map((file, index) => (
              <option key={index} value={`events_${file.category}`}>
                Events: {file.category}
              </option>
            ))}
        </select>
      </div>
      
      <button
        className="mt-3 bg-yellow-700 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded"
        onClick={() => {
          setImportMode('single');
          setSplitFiles([]);
        }}
      >
        Back to Single File Mode
      </button>
    </div>
  );
  
  // UI for merge mode
  const renderMergeMode = () => (
    <div className="mb-4">
      <div className="mb-4">
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-yellow-600 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-10 h-10 mb-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <p className="mb-2 text-sm text-yellow-400">
                <span className="font-semibold">Click to upload multiple files</span> or drag and drop
              </p>
              <p className="text-xs text-yellow-500">.json files only</p>
              {mergeFiles.length > 0 && (
                <p className="text-sm text-yellow-300 mt-2">Selected: {mergeFiles.length} files</p>
              )}
            </div>
            <input
              id="merge-files"
              type="file"
              className="hidden"
              accept=".json"
              multiple
              onChange={handleMultipleFileUpload}
            />
          </label>
        </div>
      </div>
      
      {mergeFiles.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-yellow-400">Files to Merge</h3>
            <button
              className="bg-green-700 hover:bg-green-600 text-white font-bold py-1 px-3 rounded text-sm"
              onClick={handleMergeFiles}
            >
              Merge Files
            </button>
          </div>
          
          <div className="bg-gray-800 border border-yellow-700 rounded p-3 mb-3">
            <div className="grid grid-cols-3 gap-2 mb-2 border-b border-yellow-800 pb-2">
              <div className="text-yellow-500 font-semibold">File Name</div>
              <div className="text-yellow-500 font-semibold">Type</div>
              <div className="text-yellow-500 font-semibold">Version</div>
            </div>
            
            {mergeFiles.map((file, index) => {
              const version = file.parsed.version || file.parsed.metadata?.version || "Unknown";
              
              return (
                <div key={index} className="grid grid-cols-3 gap-2 py-2 border-b border-gray-700">
                  <div className="text-yellow-300">{file.name}</div>
                  <div className="text-yellow-300">{file.type}</div>
                  <div className="text-yellow-300">{version}</div>
                </div>
              );
            })}
          </div>
        </>
      )}
      
      {mergedResult && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-yellow-400">Merged Result</h3>
            <button
              className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-sm"
              onClick={handleDownloadMergedResult}
            >
              Download Merged File
            </button>
          </div>
          
          <textarea
            className="w-full h-48 p-2 bg-gray-800 text-yellow-100 border border-yellow-700 rounded font-mono text-sm"
            value={mergedResult}
            readOnly
          />
        </div>
      )}
      
      <button
        className="mt-3 bg-yellow-700 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded"
        onClick={() => {
          setImportMode('single');
          setMergeFiles([]);
          setMergedResult(null);
        }}
      >
        Back to Single File Mode
      </button>
    </div>
  );
  
  return (
    <div className="bg-gray-900 p-6 rounded-xl border border-yellow-700 max-w-2xl w-full">
      <h2 className="text-2xl font-bold text-yellow-500 mb-4">Import Game Data</h2>
      
      {/* Mode selection tabs */}
      <div className="flex mb-4 border-b border-yellow-700">
        <button
          className={`py-2 px-4 font-semibold ${importMode === 'single' ? 'bg-yellow-700 text-yellow-100' : 'bg-gray-800 text-yellow-400 hover:bg-gray-700'}`}
          onClick={() => setImportMode('single')}
        >
          Single File
        </button>
        <button
          className={`py-2 px-4 font-semibold ${importMode === 'multiple' ? 'bg-yellow-700 text-yellow-100' : 'bg-gray-800 text-yellow-400 hover:bg-gray-700'}`}
          onClick={() => {
            if (splitFiles.length > 0) {
              setImportMode('multiple');
            } else if (importText) {
              handleSplitJSON();
            } else {
              setError("Please upload or paste a complete game file first to split");
            }
          }}
        >
          Split Files
        </button>
        <button
          className={`py-2 px-4 font-semibold ${importMode === 'merge' ? 'bg-yellow-700 text-yellow-100' : 'bg-gray-800 text-yellow-400 hover:bg-gray-700'}`}
          onClick={() => {
            setImportMode('merge');
            setMergeFiles([]);
            setMergedResult(null);
          }}
        >
          Merge Files
        </button>
      </div>
      
      {/* File upload section for single file mode */}
      {importMode !== 'merge' && (
        <div className="mb-4">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-yellow-600 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-10 h-10 mb-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <p className="mb-2 text-sm text-yellow-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-yellow-500">.json file only</p>
                {fileName && <p className="text-sm text-yellow-300 mt-2">Selected: {fileName}</p>}
              </div>
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                accept=".json"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>
      )}
      
      {/* Render appropriate mode content */}
      {importMode === 'single' && renderSingleFileMode()}
      {importMode === 'multiple' && renderMultipleFileMode()}
      {importMode === 'merge' && renderMergeMode()}
      
      {error && (
        <div className="mb-4 p-3 bg-red-900 text-red-200 rounded border border-red-700">
          {error}
        </div>
      )}
      
      <div className="flex justify-between">
        <button
          className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded"
          onClick={handleImport}
          disabled={
            (importMode === 'single' && !importText) || 
            (importMode === 'multiple' && splitFiles.length === 0) ||
            (importMode === 'merge' && !mergedResult)
          }
        >
          Import Game
        </button>
        <button
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default GameDataImporter;