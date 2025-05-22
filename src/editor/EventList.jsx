import React, { useState, useMemo } from 'react';

const EventList = ({ events, selectedEventIndex, onSelectEvent, onDeleteEvent, onDuplicateEvent }) => {
  const [filter, setFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [macroFilter, setMacroFilter] = useState('all'); // 'all', 'with', 'without'
  const [conditionFilter, setConditionFilter] = useState('all'); // 'all', 'with', 'without'
  
  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set();
    events.forEach(event => {
      if (event.editorTags) {
        event.editorTags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [events]);
  
  // Count macros and conditions for an event
  const getEventMetrics = (event) => {
    let macroCount = 0;
    let conditionCount = 0;
    let conditionalTextCount = 0;
    let choiceMacroCount = 0;
    let choiceConditionCount = 0;
    
    // Count in preDialog
    if (event.preDialog) {
      event.preDialog.forEach(dialog => {
        if (dialog.macros) macroCount += dialog.macros.length;
        if (dialog.conditions) conditionCount += dialog.conditions.length;
        if (dialog.conditionalText) conditionalTextCount += Object.keys(dialog.conditionalText).length;
        
        // Count choice macros and conditions
        if (dialog.choices) {
          dialog.choices.forEach(choice => {
            if (choice.macros) choiceMacroCount += choice.macros.length;
            if (choice.requiresCondition) choiceConditionCount += 1;
          });
        }
      });
    }
    
    // Count in postDialog
    if (event.postDialog) {
      event.postDialog.forEach(dialog => {
        if (dialog.macros) macroCount += dialog.macros.length;
        if (dialog.conditions) conditionCount += dialog.conditions.length;
        if (dialog.conditionalText) conditionalTextCount += Object.keys(dialog.conditionalText).length;
        
        // Count choice macros and conditions
        if (dialog.choices) {
          dialog.choices.forEach(choice => {
            if (choice.macros) choiceMacroCount += choice.macros.length;
            if (choice.requiresCondition) choiceConditionCount += 1;
          });
        }
      });
    }
    
    return {
      totalMacros: macroCount + choiceMacroCount,
      totalConditions: conditionCount + choiceConditionCount,
      conditionalTextCount,
      dialogMacros: macroCount,
      dialogConditions: conditionCount,
      choiceMacros: choiceMacroCount,
      choiceConditions: choiceConditionCount
    };
  };
  
  // Filter events based on search criteria
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Text filter
      const matchesText = !filter || 
        event.title?.toLowerCase().includes(filter.toLowerCase()) ||
        event.key?.toLowerCase().includes(filter.toLowerCase());
      
      // Tag filter
      const matchesTag = !tagFilter || 
        (event.editorTags && event.editorTags.includes(tagFilter));
      
      // Macro filter
      const metrics = getEventMetrics(event);
      const matchesMacroFilter = 
        macroFilter === 'all' ||
        (macroFilter === 'with' && metrics.totalMacros > 0) ||
        (macroFilter === 'without' && metrics.totalMacros === 0);
      
      // Condition filter
      const matchesConditionFilter = 
        conditionFilter === 'all' ||
        (conditionFilter === 'with' && (metrics.totalConditions > 0 || metrics.conditionalTextCount > 0)) ||
        (conditionFilter === 'without' && metrics.totalConditions === 0 && metrics.conditionalTextCount === 0);
      
      return matchesText && matchesTag && matchesMacroFilter && matchesConditionFilter;
    });
  }, [events, filter, tagFilter, macroFilter, conditionFilter]);
  
  // Get total metrics for all events
  const totalMetrics = useMemo(() => {
    let totalMacros = 0;
    let totalConditions = 0;
    let totalConditionalText = 0;
    
    events.forEach(event => {
      const metrics = getEventMetrics(event);
      totalMacros += metrics.totalMacros;
      totalConditions += metrics.totalConditions;
      totalConditionalText += metrics.conditionalTextCount;
    });
    
    return { totalMacros, totalConditions, totalConditionalText };
  }, [events]);
  
  const handleDeleteEvent = (index, event) => {
    if (window.confirm(`Are you sure you want to delete "${event.title}"? This action cannot be undone.`)) {
      // Find the actual index in the original events array
      const originalIndex = events.findIndex(e => e.key === event.key);
      onDeleteEvent(originalIndex);
    }
  };
  
  const handleDuplicateEvent = (index, event) => {
    // Find the actual index in the original events array
    const originalIndex = events.findIndex(e => e.key === event.key);
    onDuplicateEvent(originalIndex);
  };
  
  const handleSelectEvent = (event) => {
    // Find the actual index in the original events array
    const originalIndex = events.findIndex(e => e.key === event.key);
    onSelectEvent(originalIndex);
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-yellow-500">Events List</h3>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="text-xs text-gray-400 hover:text-yellow-400"
          >
            {showAdvancedFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>
        
        {/* Basic search */}
        <input
          type="text"
          placeholder="Search events..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full bg-gray-700 text-white border border-yellow-600 rounded py-2 px-3 text-sm focus:outline-none focus:border-yellow-500"
        />
        
        {/* Advanced filters */}
        {showAdvancedFilters && (
          <div className="space-y-2 p-3 bg-gray-900 rounded border border-gray-600">
            <div>
              <label className="block text-yellow-400 text-xs font-bold mb-1">Filter by Tag</label>
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-sm focus:outline-none"
              >
                <option value="">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-yellow-400 text-xs font-bold mb-1">Macros</label>
                <select
                  value={macroFilter}
                  onChange={(e) => setMacroFilter(e.target.value)}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-sm focus:outline-none"
                >
                  <option value="all">All Events</option>
                  <option value="with">With Macros</option>
                  <option value="without">Without Macros</option>
                </select>
              </div>
              
              <div>
                <label className="block text-yellow-400 text-xs font-bold mb-1">Conditions</label>
                <select
                  value={conditionFilter}
                  onChange={(e) => setConditionFilter(e.target.value)}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded py-1 px-2 text-sm focus:outline-none"
                >
                  <option value="all">All Events</option>
                  <option value="with">With Conditions</option>
                  <option value="without">Without Conditions</option>
                </select>
              </div>
            </div>
          </div>
        )}
        
        {/* Summary stats */}
        <div className="text-xs text-gray-400 bg-gray-900 p-2 rounded">
          <div className="grid grid-cols-2 gap-2">
            <div>Showing: {filteredEvents.length} / {events.length} events</div>
            <div>Total Macros: {totalMetrics.totalMacros}</div>
            <div>Total Conditions: {totalMetrics.totalConditions}</div>
            <div>Conditional Text: {totalMetrics.totalConditionalText}</div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 space-y-2 overflow-y-auto">
        {filteredEvents.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p>No events match your search criteria.</p>
            {(filter || tagFilter || macroFilter !== 'all' || conditionFilter !== 'all') && (
              <button
                onClick={() => {
                  setFilter('');
                  setTagFilter('');
                  setMacroFilter('all');
                  setConditionFilter('all');
                }}
                className="mt-2 text-yellow-400 hover:text-yellow-300 text-sm"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          filteredEvents.map((event, filteredIndex) => {
            const originalIndex = events.findIndex(e => e.key === event.key);
            const isSelected = selectedEventIndex === originalIndex;
            const metrics = getEventMetrics(event);
            
            return (
              <div
                key={event.key}
                className={`p-3 rounded cursor-pointer border transition-colors ${
                  isSelected 
                    ? 'bg-yellow-700 border-yellow-500 text-white' 
                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-200'
                }`}
                onClick={() => handleSelectEvent(event)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{event.title}</h4>
                    <p className="text-xs text-gray-400 truncate">Key: {event.key}</p>
                  </div>
                  
                  <div className="flex space-x-1 ml-2 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateEvent(filteredIndex, event);
                      }}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs"
                      title="Duplicate Event"
                    >
                      ⧉
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(filteredIndex, event);
                      }}
                      className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-xs"
                      title="Delete Event"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                
                {/* Tags */}
                {event.editorTags && event.editorTags.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1">
                    {event.editorTags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="bg-gray-600 text-gray-300 px-2 py-1 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Metrics indicators */}
                <div className="flex flex-wrap gap-1 text-xs">
                  {metrics.totalMacros > 0 && (
                    <span className="bg-green-700 text-green-200 px-2 py-1 rounded-full">
                      {metrics.totalMacros} macro{metrics.totalMacros !== 1 ? 's' : ''}
                    </span>
                  )}
                  
                  {metrics.totalConditions > 0 && (
                    <span className="bg-blue-700 text-blue-200 px-2 py-1 rounded-full">
                      {metrics.totalConditions} condition{metrics.totalConditions !== 1 ? 's' : ''}
                    </span>
                  )}
                  
                  {metrics.conditionalTextCount > 0 && (
                    <span className="bg-purple-700 text-purple-200 px-2 py-1 rounded-full">
                      {metrics.conditionalTextCount} conditional text
                    </span>
                  )}
                  
                  {/* Connection indicators */}
                  {event.nextEvent && (
                    <span className="bg-yellow-700 text-yellow-200 px-2 py-1 rounded-full">
                      next: {event.nextEvent}
                    </span>
                  )}
                  
                  {/* Dialog indicators */}
                  <span className="bg-gray-600 text-gray-300 px-2 py-1 rounded-full">
                    {(event.preDialog?.length || 0) + (event.postDialog?.length || 0)} dialog{((event.preDialog?.length || 0) + (event.postDialog?.length || 0)) !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {/* Detailed breakdown on hover/selection */}
                {isSelected && (metrics.dialogMacros > 0 || metrics.choiceMacros > 0 || metrics.dialogConditions > 0 || metrics.choiceConditions > 0) && (
                  <div className="mt-2 pt-2 border-t border-yellow-600 text-xs">
                    <div className="grid grid-cols-2 gap-2 text-yellow-200">
                      {metrics.dialogMacros > 0 && (
                        <div>Dialog Macros: {metrics.dialogMacros}</div>
                      )}
                      {metrics.choiceMacros > 0 && (
                        <div>Choice Macros: {metrics.choiceMacros}</div>
                      )}
                      {metrics.dialogConditions > 0 && (
                        <div>Dialog Conditions: {metrics.dialogConditions}</div>
                      )}
                      {metrics.choiceConditions > 0 && (
                        <div>Choice Conditions: {metrics.choiceConditions}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EventList;