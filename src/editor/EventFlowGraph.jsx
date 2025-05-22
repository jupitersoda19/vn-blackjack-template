import React, { useEffect, useState } from 'react';

const EventFlowGraph = ({ events, onSelectEvent }) => {
  const [eventMap, setEventMap] = useState({});
  const [expandedEvents, setExpandedEvents] = useState({});
  const [highlightedEvent, setHighlightedEvent] = useState(null);
  const [showMacrosAndConditions, setShowMacrosAndConditions] = useState(false);
  
  // Process events into a map of connections
  useEffect(() => {
    if (!events || events.length === 0) return;
    
    const map = {};
    
    // Initialize map with all events
    events.forEach(event => {
      // Count macros and conditions in dialogs
      let macroCount = 0;
      let conditionCount = 0;
      let conditionalTextCount = 0;
      
      // Count in preDialog
      if (event.preDialog) {
        event.preDialog.forEach(dialog => {
          if (dialog.macros) macroCount += dialog.macros.length;
          if (dialog.conditions) conditionCount += dialog.conditions.length;
          if (dialog.conditionalText) conditionalTextCount += Object.keys(dialog.conditionalText).length;
        });
      }
      
      // Count in postDialog
      if (event.postDialog) {
        event.postDialog.forEach(dialog => {
          if (dialog.macros) macroCount += dialog.macros.length;
          if (dialog.conditions) conditionCount += dialog.conditions.length;
          if (dialog.conditionalText) conditionalTextCount += Object.keys(dialog.conditionalText).length;
        });
      }
      
      // Count choice macros and conditions
      let choiceMacroCount = 0;
      let choiceConditionCount = 0;
      
      const countChoiceMetrics = (dialogs) => {
        if (!dialogs) return;
        dialogs.forEach(dialog => {
          if (dialog.choices) {
            dialog.choices.forEach(choice => {
              if (choice.macros) choiceMacroCount += choice.macros.length;
              if (choice.requiresCondition) choiceConditionCount += 1;
            });
          }
        });
      };
      
      countChoiceMetrics(event.preDialog);
      countChoiceMetrics(event.postDialog);
      
      map[event.key] = {
        title: event.title,
        outgoing: [],
        incoming: [],
        macroCount: macroCount + choiceMacroCount,
        conditionCount: conditionCount + choiceConditionCount,
        conditionalTextCount,
        tags: event.editorTags || []
      };
    });
    
    // Add connections
    events.forEach(event => {
      // Direct nextEvent connections
      if (event.nextEvent && map[event.nextEvent]) {
        map[event.key].outgoing.push({
          target: event.nextEvent,
          type: 'default',
          label: 'Next'
        });
        
        map[event.nextEvent].incoming.push({
          source: event.key,
          type: 'default',
          label: 'Next'
        });
      }
      
      // Add choice connections from preDialog
      if (event.preDialog) {
        event.preDialog.forEach(dialog => {
          if (dialog.choices) {
            dialog.choices.forEach(choice => {
              if (choice.nextEvent && map[choice.nextEvent]) {
                const hasCondition = choice.requiresCondition ? ' (conditional)' : '';
                const hasMacros = choice.macros && choice.macros.length > 0 ? ' (with macros)' : '';
                
                map[event.key].outgoing.push({
                  target: choice.nextEvent,
                  type: 'choice',
                  label: choice.text.slice(0, 15) + (choice.text.length > 15 ? '...' : '') + hasCondition + hasMacros,
                  hasCondition: !!choice.requiresCondition,
                  hasMacros: choice.macros && choice.macros.length > 0
                });
                
                map[choice.nextEvent].incoming.push({
                  source: event.key,
                  type: 'choice',
                  label: choice.text.slice(0, 15) + (choice.text.length > 15 ? '...' : '') + hasCondition + hasMacros,
                  hasCondition: !!choice.requiresCondition,
                  hasMacros: choice.macros && choice.macros.length > 0
                });
              }
            });
          }
        });
      }
      
      // Add choice connections from postDialog
      if (event.postDialog) {
        event.postDialog.forEach(dialog => {
          if (dialog.choices) {
            dialog.choices.forEach(choice => {
              if (choice.nextEvent && map[choice.nextEvent]) {
                const hasCondition = choice.requiresCondition ? ' (conditional)' : '';
                const hasMacros = choice.macros && choice.macros.length > 0 ? ' (with macros)' : '';
                
                map[event.key].outgoing.push({
                  target: choice.nextEvent,
                  type: 'post-choice',
                  label: 'Post: ' + choice.text.slice(0, 15) + (choice.text.length > 15 ? '...' : '') + hasCondition + hasMacros,
                  hasCondition: !!choice.requiresCondition,
                  hasMacros: choice.macros && choice.macros.length > 0
                });
                
                map[choice.nextEvent].incoming.push({
                  source: event.key,
                  type: 'post-choice',
                  label: 'Post: ' + choice.text.slice(0, 15) + (choice.text.length > 15 ? '...' : '') + hasCondition + hasMacros,
                  hasCondition: !!choice.requiresCondition,
                  hasMacros: choice.macros && choice.macros.length > 0
                });
              }
            });
          }
        });
      }
    });
    
    setEventMap(map);
    
    // Initialize expanded state for all events
    const initialExpanded = {};
    Object.keys(map).forEach(key => {
      initialExpanded[key] = false; // Start with all collapsed
    });
    setExpandedEvents(initialExpanded);
  }, [events]);
  
  // Find the index of an event by key
  const findEventIndex = (key) => {
    return events.findIndex(e => e.key === key);
  };
  
  // Toggle expanded state of an event
  const toggleEventExpanded = (key) => {
    setExpandedEvents(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  // Set highlight when hovering over an event
  const highlightConnections = (key) => {
    setHighlightedEvent(key);
  };
  
  // Clear highlight when mouse leaves
  const clearHighlight = () => {
    setHighlightedEvent(null);
  };
  
  // Check if a connection should be highlighted
  const isConnectionHighlighted = (source, target) => {
    if (!highlightedEvent) return false;
    return highlightedEvent === source || highlightedEvent === target;
  };
  
  // Get event card style based on connections
  const getEventCardStyle = (key) => {
    if (!highlightedEvent) return "";
    
    // Highlight if this is the highlighted event
    if (highlightedEvent === key) {
      return "ring-2 ring-yellow-400 shadow-lg";
    }
    
    // Highlight if this event is connected to the highlighted event
    const isConnected = 
      (eventMap[highlightedEvent]?.outgoing.some(conn => conn.target === key) ||
      eventMap[highlightedEvent]?.incoming.some(conn => conn.source === key));
    
    return isConnected ? "ring-2 ring-yellow-700 shadow-md" : "opacity-50";
  };
  
  // Find entry points (events with no incoming connections)
  const findEntryPoints = () => {
    return Object.entries(eventMap)
      .filter(([key, data]) => data.incoming.length === 0)
      .map(([key]) => key);
  };
  
  // Find exit points (events with no outgoing connections)
  const findExitPoints = () => {
    return Object.entries(eventMap)
      .filter(([key, data]) => data.outgoing.length === 0)
      .map(([key]) => key);
  };
  
  // Find orphaned events (no incoming or outgoing connections)
  const findOrphanedEvents = () => {
    return Object.entries(eventMap)
      .filter(([key, data]) => data.incoming.length === 0 && data.outgoing.length === 0)
      .map(([key]) => key);
  };
  
  // Get events with macros
  const getEventsWithMacros = () => {
    return Object.entries(eventMap)
      .filter(([key, data]) => data.macroCount > 0)
      .length;
  };
  
  // Get events with conditions
  const getEventsWithConditions = () => {
    return Object.entries(eventMap)
      .filter(([key, data]) => data.conditionCount > 0 || data.conditionalTextCount > 0)
      .length;
  };
  
  // Sort events to visualize flow
  const sortEvents = () => {
    // If no events, return empty array
    if (Object.keys(eventMap).length === 0) return [];
    
    // Get entry points
    const entryPoints = findEntryPoints();
    const exitPoints = findExitPoints();
    const orphans = findOrphanedEvents();
    
    // Remove orphans from entry and exit points
    const trueEntryPoints = entryPoints.filter(key => !orphans.includes(key));
    const trueExitPoints = exitPoints.filter(key => !orphans.includes(key));
    
    // Get all other events
    const middleEvents = Object.keys(eventMap).filter(key => 
      !trueEntryPoints.includes(key) && 
      !trueExitPoints.includes(key) &&
      !orphans.includes(key)
    );
    
    // Return sorted events
    return [
      ...trueEntryPoints,
      ...middleEvents,
      ...trueExitPoints,
      ...orphans
    ];
  };
  
  // Render connection indicator
  const renderConnectionIndicator = (conn) => {
    let baseColor = '';
    if (conn.type === 'default') baseColor = 'bg-yellow-500';
    else if (conn.type === 'choice') baseColor = 'bg-blue-500';
    else baseColor = 'bg-green-500';
    
    // Add special indicators for macros and conditions
    if (conn.hasMacros && conn.hasCondition) {
      return <span className={`inline-block w-2 h-2 rounded-full mr-2 ${baseColor} ring-2 ring-purple-400`}></span>;
    } else if (conn.hasMacros) {
      return <span className={`inline-block w-2 h-2 rounded-full mr-2 ${baseColor} ring-2 ring-green-400`}></span>;
    } else if (conn.hasCondition) {
      return <span className={`inline-block w-2 h-2 rounded-full mr-2 ${baseColor} ring-2 ring-orange-400`}></span>;
    } else {
      return <span className={`inline-block w-2 h-2 rounded-full mr-2 ${baseColor}`}></span>;
    }
  };
  
  if (Object.keys(eventMap).length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-yellow-400 text-center">
          <p className="text-lg font-bold mb-2">No events to display</p>
          <p>Create events in the Edit Mode to see the flow graph.</p>
        </div>
      </div>
    );
  }
  
  const sortedEventKeys = sortEvents();
  const entryPoints = findEntryPoints();
  const exitPoints = findExitPoints();
  const orphans = findOrphanedEvents();
  
  return (
    <div className="p-4 space-y-6 overflow-auto">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-yellow-500">Event Flow Graph</h3>
          <p className="text-sm text-yellow-400">Click on any event to edit it</p>
        </div>
        <button
          onClick={() => setShowMacrosAndConditions(!showMacrosAndConditions)}
          className={`px-3 py-1 rounded text-sm font-medium ${
            showMacrosAndConditions 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {showMacrosAndConditions ? 'Hide' : 'Show'} Macros & Conditions
        </button>
      </div>
      
      {/* Summary statistics */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <div className="bg-gray-900 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-500">{events.length}</div>
          <div className="text-sm text-yellow-400">Total Events</div>
        </div>
        
        <div className="bg-gray-900 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-500">{entryPoints.length - orphans.length}</div>
          <div className="text-sm text-yellow-400">Entry Points</div>
        </div>
        
        <div className="bg-gray-900 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-500">{exitPoints.length - orphans.length}</div>
          <div className="text-sm text-yellow-400">Exit Points</div>
        </div>
        
        <div className="bg-gray-900 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-gray-500">{orphans.length}</div>
          <div className="text-sm text-yellow-400">Orphaned</div>
        </div>
        
        <div className="bg-gray-900 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-400">{getEventsWithMacros()}</div>
          <div className="text-sm text-yellow-400">With Macros</div>
        </div>
        
        <div className="bg-gray-900 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-400">{getEventsWithConditions()}</div>
          <div className="text-sm text-yellow-400">With Conditions</div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="bg-gray-900 p-3 rounded-lg">
        <div className="text-sm font-semibold text-yellow-500 mb-2">Legend:</div>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
            <span className="text-xs text-gray-300">Direct Next Event</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
            <span className="text-xs text-gray-300">Pre-Dialog Choice</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
            <span className="text-xs text-gray-300">Post-Dialog Choice</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-blue-500 ring-2 ring-green-400 mr-2"></span>
            <span className="text-xs text-gray-300">Choice with Macros</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-blue-500 ring-2 ring-orange-400 mr-2"></span>
            <span className="text-xs text-gray-300">Conditional Choice</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 border-2 border-green-500 rounded mr-2"></span>
            <span className="text-xs text-gray-300">Entry Point</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 border-2 border-red-500 rounded mr-2"></span>
            <span className="text-xs text-gray-300">Exit Point</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 border-2 border-gray-500 rounded mr-2"></span>
            <span className="text-xs text-gray-300">Orphaned Event</span>
          </div>
        </div>
      </div>
      
      {/* Event flow visualization */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8" style={{ minHeight: '400px' }}>
        {sortedEventKeys.map(key => {
          const data = eventMap[key];
          const isEntryPoint = entryPoints.includes(key);
          const isExitPoint = exitPoints.includes(key);
          const isOrphan = orphans.includes(key);
          
          let borderStyle = "";
          if (isOrphan) {
            borderStyle = "border-gray-500";
          } else if (isEntryPoint) {
            borderStyle = "border-green-500";
          } else if (isExitPoint) {
            borderStyle = "border-red-500";
          } else {
            borderStyle = "border-yellow-700";
          }
          
          return (
            <div 
              key={key}
              className={`bg-gray-800 p-4 rounded-lg border-2 ${borderStyle} ${getEventCardStyle(key)} transition-all duration-200`}
              onClick={() => onSelectEvent(findEventIndex(key))}
              onMouseEnter={() => highlightConnections(key)}
              onMouseLeave={clearHighlight}
            >
              <div className="font-bold text-yellow-500 mb-2 flex justify-between items-center">
                <span className="truncate">{data.title}</span>
                <button 
                  className="text-gray-400 hover:text-yellow-400 focus:outline-none flex-shrink-0 ml-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleEventExpanded(key);
                  }}
                >
                  {expandedEvents[key] ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
              
              <div className="text-xs text-yellow-300 mb-2">Key: {key}</div>
              
              {/* Show tags if any */}
              {data.tags.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {data.tags.map((tag, i) => (
                    <span key={i} className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Show macro and condition counts */}
              {showMacrosAndConditions && (
                <div className="mb-3 flex space-x-2">
                  {data.macroCount > 0 && (
                    <span className="bg-green-700 text-green-200 px-2 py-1 rounded-full text-xs">
                      {data.macroCount} macro{data.macroCount !== 1 ? 's' : ''}
                    </span>
                  )}
                  {data.conditionCount > 0 && (
                    <span className="bg-blue-700 text-blue-200 px-2 py-1 rounded-full text-xs">
                      {data.conditionCount} condition{data.conditionCount !== 1 ? 's' : ''}
                    </span>
                  )}
                  {data.conditionalTextCount > 0 && (
                    <span className="bg-purple-700 text-purple-200 px-2 py-1 rounded-full text-xs">
                      {data.conditionalTextCount} conditional text
                    </span>
                  )}
                </div>
              )}
              
              {data.outgoing.length > 0 && (
                <div className={`mb-3 ${expandedEvents[key] ? '' : 'line-clamp-2'}`}>
                  <div className="text-sm font-semibold text-yellow-400 mb-1">Leads to:</div>
                  <ul className="text-xs text-gray-300 space-y-1">
                    {data.outgoing.map((conn, i) => (
                      <li 
                        key={i} 
                        className={`flex items-center ${isConnectionHighlighted(key, conn.target) ? 'text-white font-semibold' : ''}`}
                      >
                        {renderConnectionIndicator(conn)}
                        <span className="truncate">{eventMap[conn.target]?.title} ({conn.label})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {data.incoming.length > 0 && expandedEvents[key] && (
                <div>
                  <div className="text-sm font-semibold text-yellow-400 mb-1">Coming from:</div>
                  <ul className="text-xs text-gray-300 space-y-1">
                    {data.incoming.map((conn, i) => (
                      <li 
                        key={i} 
                        className={`flex items-center ${isConnectionHighlighted(conn.source, key) ? 'text-white font-semibold' : ''}`}
                      >
                        {renderConnectionIndicator(conn)}
                        <span className="truncate">{eventMap[conn.source]?.title} ({conn.label})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {!data.outgoing.length && !data.incoming.length && (
                <div className="text-xs text-gray-500 italic">
                  This event is not connected to any other events.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventFlowGraph;