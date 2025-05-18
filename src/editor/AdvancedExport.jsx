import React, { useState, useEffect } from 'react';

const AdvancedExport = ({ gameData, onClose }) => {
  const [exportFormat, setExportFormat] = useState("pretty"); // "pretty" or "compact"
  const [exportOption, setExportOption] = useState("full"); // "full", "metadata", "events", "selected"
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [exportData, setExportData] = useState(null);
  const [fileName, setFileName] = useState("");
  
  // Initialize selected events
  useEffect(() => {
    if (gameData?.events) {
      setSelectedEvents(gameData.events.map((_, index) => index));
      
      // Set default filename
      const defaultName = gameData.metadata?.title 
        ? `${gameData.metadata.title.replace(/\s+/g, '_').toLowerCase()}_v${gameData.metadata.version || '1.0.0'}.json`
        : 'game_export.json';
      setFileName(defaultName);
    }
  }, [gameData]);
  
  // Update export data based on options
  useEffect(() => {
    if (!gameData) return;
    
    let dataToExport = null;
    
    switch (exportOption) {
      case "full":
        dataToExport = { ...gameData };
        break;
      case "metadata":
        dataToExport = { metadata: { ...gameData.metadata } };
        break;
      case "events":
        dataToExport = { events: [...gameData.events] };
        break;
      case "selected":
        dataToExport = { 
          metadata: { ...gameData.metadata },
          events: gameData.events.filter((_, index) => selectedEvents.includes(index))
        };
        break;
      default:
        dataToExport = { ...gameData };
    }
    
    setExportData(dataToExport);
  }, [gameData, exportOption, selectedEvents]);
  
  // Toggle event selection
  const toggleEventSelection = (index) => {
    if (selectedEvents.includes(index)) {
      setSelectedEvents(selectedEvents.filter(i => i !== index));
    } else {
      setSelectedEvents([...selectedEvents, index]);
    }
  };
  
  // Select all events
  const selectAllEvents = () => {
    if (gameData?.events) {
      setSelectedEvents(gameData.events.map((_, index) => index));
    }
  };
  
  // Deselect all events
  const deselectAllEvents = () => {
    setSelectedEvents([]);
  };
  
  // Handle export
  const handleExport = () => {
    if (!exportData) return;
    
    // Format JSON according to selected format
    const jsonData = exportFormat === "pretty" 
      ? JSON.stringify(exportData, null, 2) 
      : JSON.stringify(exportData);
    
    // Create blob and download link
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'game_export.json';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Close export modal after download
    onClose();
  };
  
  // Copy JSON to clipboard
  const handleCopyToClipboard = () => {
    if (!exportData) return;
    
    const jsonData = exportFormat === "pretty" 
      ? JSON.stringify(exportData, null, 2) 
      : JSON.stringify(exportData);
    
    navigator.clipboard.writeText(jsonData)
      .then(() => {
        alert("JSON copied to clipboard!");
        onClose();
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        alert("Failed to copy to clipboard. See console for details.");
      });
  };
  
  // Calculate export size
  const getExportSize = () => {
    if (!exportData) return "0 KB";
    
    const jsonData = exportFormat === "pretty" 
      ? JSON.stringify(exportData, null, 2) 
      : JSON.stringify(exportData);
    
    const bytes = new TextEncoder().encode(jsonData).length;
    
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 overflow-auto py-10">
      <div className="bg-gray-800 p-6 rounded-lg border border-yellow-700 max-w-3xl w-full">
        <h3 className="text-xl font-bold text-yellow-500 mb-4">Advanced Export</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <label className="block text-yellow-400 text-sm font-bold mb-2">
                Export Option
              </label>
              <select
                className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-2 px-3 focus:outline-none focus:border-yellow-500"
                value={exportOption}
                onChange={(e) => setExportOption(e.target.value)}
              >
                <option value="full">Full Game (Metadata + All Events)</option>
                <option value="metadata">Metadata Only</option>
                <option value="events">All Events Only</option>
                <option value="selected">Selected Events + Metadata</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-yellow-400 text-sm font-bold mb-2">
                Format
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-yellow-600"
                    name="format"
                    value="pretty"
                    checked={exportFormat === "pretty"}
                    onChange={() => setExportFormat("pretty")}
                  />
                  <span className="ml-2 text-yellow-300">Pretty (Readable)</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-yellow-600"
                    name="format"
                    value="compact"
                    checked={exportFormat === "compact"}
                    onChange={() => setExportFormat("compact")}
                  />
                  <span className="ml-2 text-yellow-300">Compact (Smaller file)</span>
                </label>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-yellow-400 text-sm font-bold mb-2">
                File Name
              </label>
              <input
                type="text"
                className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-2 px-3 focus:outline-none focus:border-yellow-500"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter filename"
              />
            </div>
            
            {exportOption === "selected" && gameData?.events && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-yellow-400 text-sm font-bold">
                    Select Events
                  </label>
                  <div className="flex space-x-2">
                    <button
                      className="text-xs text-blue-400 hover:text-blue-300"
                      onClick={selectAllEvents}
                    >
                      Select All
                    </button>
                    <button
                      className="text-xs text-red-400 hover:text-red-300"
                      onClick={deselectAllEvents}
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                <div className="bg-gray-900 p-3 rounded h-56 overflow-auto">
                  {gameData.events.map((event, index) => (
                    <div key={index} className="flex items-center py-1 border-b border-gray-700">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={selectedEvents.includes(index)}
                        onChange={() => toggleEventSelection(index)}
                      />
                      <div className="text-yellow-300">{event.title}</div>
                      <div className="text-xs text-gray-400 ml-2">({event.key})</div>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {selectedEvents.length} of {gameData.events.length} events selected
                </div>
              </div>
            )}
          </div>
          
          <div>
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <label className="block text-yellow-400 text-sm font-bold mb-2">
                  Preview
                </label>
                <span className="text-xs text-gray-400">
                  Size: {getExportSize()}
                </span>
              </div>
              <div className="bg-gray-900 p-3 rounded h-64 overflow-auto">
                <pre className="text-xs text-gray-300 font-mono">
                  {exportData && 
                    (exportFormat === "pretty" 
                      ? JSON.stringify(exportData, null, 2) 
                      : JSON.stringify(exportData)).substring(0, 1500) + 
                    (JSON.stringify(exportData).length > 1500 ? "\n..." : "")
                  }
                </pre>
              </div>
            </div>
            
            <div className="bg-gray-900 p-3 rounded mb-4">
              <h4 className="text-sm font-bold text-yellow-400 mb-2">Export Summary</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>
                  <span className="text-yellow-400">Metadata:</span>{' '}
                  {exportOption === "events" ? "Not included" : "Included"}
                </li>
                <li>
                  <span className="text-yellow-400">Events:</span>{' '}
                  {exportOption === "metadata" 
                    ? "Not included" 
                    : exportOption === "selected" 
                      ? `${selectedEvents.length} selected` 
                      : `All ${gameData?.events?.length || 0} events`}
                </li>
                <li>
                  <span className="text-yellow-400">Format:</span>{' '}
                  {exportFormat === "pretty" ? "Pretty (Readable)" : "Compact (Smaller)"}
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6">
          <button
            className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded flex-1"
            onClick={handleExport}
            disabled={!exportData || (exportOption === "selected" && selectedEvents.length === 0)}
          >
            Download JSON
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded flex-1"
            onClick={handleCopyToClipboard}
            disabled={!exportData || (exportOption === "selected" && selectedEvents.length === 0)}
          >
            Copy to Clipboard
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

export default AdvancedExport;