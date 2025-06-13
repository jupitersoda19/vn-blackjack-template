import React, { useState } from 'react';

const StoryMerger = ({ gameData, onMergeComplete }) => {
  const [newContent, setNewContent] = useState('');
  const [mergedStory, setMergedStory] = useState('');
  const [error, setError] = useState('');
  const [connectionPoint, setConnectionPoint] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const mergeStories = () => {
    setIsProcessing(true);
    try {
      setError('');
      const newData = JSON.parse(newContent);
      
      // Create merged story structure
      const merged = {
        metadata: { ...gameData.metadata },
        events: [...(gameData.events || [])],
        macros: { ...(gameData.macros || {}), ...(newData.macros || {}) },
        conditionalTemplates: { 
          ...(gameData.conditionalTemplates || {}), 
          ...(newData.conditionalTemplates || {}) 
        }
      };
      
      // Add new events
      if (newData.events && Array.isArray(newData.events)) {
        merged.events.push(...newData.events);
      }
      
      // Handle connection instructions if provided
      if (newData.connectionInstructions) {
        const { connectFromExisting, firstNewEvent, updateExistingEvent } = newData.connectionInstructions;
        
        // Update existing event to connect to new content
        if (updateExistingEvent && updateExistingEvent.eventKey) {
          const existingEvent = merged.events.find(e => e.key === updateExistingEvent.eventKey);
          if (existingEvent) {
            existingEvent.nextEvent = updateExistingEvent.newNextEvent;
            
            // Also update choices that might need to connect
            if (existingEvent.preDialog) {
              existingEvent.preDialog.forEach(dialog => {
                if (dialog.choices) {
                  dialog.choices.forEach(choice => {
                    if (!choice.nextEvent || choice.nextEvent === 'end') {
                      choice.nextEvent = firstNewEvent;
                    }
                  });
                }
              });
            }
          }
        }
        
        // Remove connection instructions from final output
        delete merged.connectionInstructions;
      }
      
      setMergedStory(JSON.stringify(merged, null, 2));
      
    } catch (err) {
      setError('Error merging stories: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const findConnectionPoints = () => {
    try {
      const connectionOptions = [];
      
      if (gameData.events) {
        gameData.events.forEach(event => {
          // Find events that end the story or have dead ends
          if (!event.nextEvent || event.nextEvent === 'end') {
            connectionOptions.push({
              key: event.key,
              title: event.title || event.key,
              reason: 'No next event (story end)'
            });
          }
          
          // Find choices that lead nowhere
          if (event.preDialog) {
            event.preDialog.forEach((dialog, dialogIndex) => {
              if (dialog.choices) {
                dialog.choices.forEach((choice, choiceIndex) => {
                  if (!choice.nextEvent || choice.nextEvent === 'end') {
                    connectionOptions.push({
                      key: event.key,
                      title: `${event.title || event.key} - Choice: "${choice.text}"`,
                      reason: 'Choice has no next event',
                      isChoice: true,
                      dialogIndex,
                      choiceIndex
                    });
                  }
                });
              }
            });
          }
        });
      }
      
      setConnectionPoint(JSON.stringify(connectionOptions, null, 2));
    } catch (err) {
      setError('Error analyzing connection points: ' + err.message);
    }
  };

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content).then(() => {
      alert('Content copied to clipboard!');
    });
  };

  const applyMergedStory = () => {
    if (mergedStory && onMergeComplete) {
      try {
        const parsedStory = JSON.parse(mergedStory);
        onMergeComplete(parsedStory);
        alert('Story successfully merged into your project!');
      } catch (err) {
        setError('Error applying merged story: ' + err.message);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-yellow-500 mb-2">Story Content Merger</h2>
        <p className="text-gray-300">Merge AI-generated story continuations with your existing story</p>
      </div>
      
      <div className="p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-400 mb-2">How to Use</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm">
          <li>Use the "Story Generator" tab to create continuation content</li>
          <li>Copy the generated JSON and paste it in the "Generated Content" field below</li>
          <li>Click "Merge Stories" to combine with your current story</li>
          <li>Review the merged result and click "Apply to Project" to update your story</li>
          <li>Use "Find Connection Points" to see where new content can attach</li>
        </ol>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Story Preview */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-yellow-400">Current Story</h3>
            <button
              onClick={findConnectionPoints}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-1 px-3 rounded text-sm"
              disabled={!gameData.events || gameData.events.length === 0}
            >
              Find Connection Points
            </button>
          </div>
          <div className="bg-gray-800 border border-gray-600 rounded p-3 h-64 overflow-auto">
            <div className="text-xs text-gray-300">
              <div className="mb-2"><strong>Events:</strong> {gameData.events?.length || 0}</div>
              <div className="mb-2"><strong>Macros:</strong> {Object.keys(gameData.macros || {}).length}</div>
              <div className="mb-2"><strong>Templates:</strong> {Object.keys(gameData.conditionalTemplates || {}).length}</div>
              <div className="text-yellow-400 text-xs mt-3">Recent Events:</div>
              {gameData.events?.slice(-3).map(event => (
                <div key={event.key} className="ml-2 mt-1">
                  • {event.title || event.key}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Generated Content Input */}
        <div>
          <h3 className="text-lg font-semibold text-yellow-400 mb-3">Generated Content JSON</h3>
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Paste the AI-generated story continuation JSON here..."
            className="w-full h-64 bg-gray-800 border border-gray-600 rounded p-3 font-mono text-xs text-white resize-none"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button
          onClick={mergeStories}
          disabled={!newContent.trim() || isProcessing}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white font-bold py-2 px-6 rounded flex items-center"
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            'Merge Stories'
          )}
        </button>
        
        <button
          onClick={() => {
            setNewContent('');
            setMergedStory('');
            setConnectionPoint('');
            setError('');
          }}
          className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
        >
          Clear All
        </button>
      </div>

      {/* Merged Result */}
      {mergedStory && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-yellow-400">Merged Story Result</h3>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(mergedStory)}
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-1 px-3 rounded text-sm"
              >
                Copy JSON
              </button>
              <button
                onClick={applyMergedStory}
                className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-1 px-3 rounded text-sm"
              >
                Apply to Project
              </button>
            </div>
          </div>
          <textarea
            value={mergedStory}
            readOnly
            className="w-full h-64 bg-gray-800 border border-gray-600 rounded p-3 font-mono text-xs text-gray-300 resize-none"
          />
        </div>
      )}

      {/* Connection Points */}
      {connectionPoint && (
        <div>
          <h3 className="text-lg font-semibold text-yellow-400 mb-3">Potential Connection Points</h3>
          <div className="bg-gray-800 border border-gray-600 rounded p-4">
            <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-auto max-h-48">{connectionPoint}</pre>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            These are events and choices in your existing story where new content can be connected.
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-900 border border-red-600 rounded text-red-200">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Success Message */}
      {mergedStory && !error && (
        <div className="p-4 bg-green-900 border border-green-600 rounded text-green-200">
          <h4 className="font-semibold mb-2">✅ Stories Successfully Merged!</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>New events have been added to your story</li>
            <li>New macros and conditional templates have been merged</li>
            <li>Connection instructions have been applied automatically</li>
            <li>Click "Apply to Project" to update your current story</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default StoryMerger;