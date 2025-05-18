import React, { useState } from 'react';
import EventList from './EventList';
import EventEditor from './EventEditor';
import EventFlowGraph from './EventFlowGraph';

const EventsEditor = ({ events, onEventsChange }) => {
  const [selectedEventIndex, setSelectedEventIndex] = useState(events.length > 0 ? 0 : null);
  const [viewMode, setViewMode] = useState('edit'); // 'edit' or 'flow'
  
  // Create a blank event template with a unique key
  const createNewEvent = () => {
    // Generate a unique key based on existing events
    const existingKeys = new Set(events.map(event => event.key));
    let newKey = `event_${events.length + 1}`;
    let counter = events.length + 1;
    
    // Ensure the key is unique
    while (existingKeys.has(newKey)) {
      counter++;
      newKey = `event_${counter}`;
    }
    
    const newEvent = {
      key: newKey,
      title: `New Event ${counter}`,
      preDialog: [
        {
          background: "/assets/backgrounds/default.jpg",
          characters: {},
          text: "This is a new event."
        }
      ],
      nextEvent: null
    };
    
    const newEvents = [...events, newEvent];
    onEventsChange(newEvents);
    setSelectedEventIndex(newEvents.length - 1);
  };
  
  // Duplicate an existing event
  const duplicateEvent = (index) => {
    if (index === null || index < 0 || index >= events.length) return;
    
    const existingEvent = events[index];
    
    // Generate a unique key for the duplicate
    const existingKeys = new Set(events.map(event => event.key));
    let newKey = `${existingEvent.key}_copy`;
    let counter = 1;
    
    // Ensure the key is unique
    while (existingKeys.has(newKey)) {
      counter++;
      newKey = `${existingEvent.key}_copy${counter}`;
    }
    
    // Create a deep copy of the event with the new key
    const duplicatedEvent = JSON.parse(JSON.stringify(existingEvent));
    duplicatedEvent.key = newKey;
    duplicatedEvent.title = `${existingEvent.title} (Copy)`;
    
    const newEvents = [...events, duplicatedEvent];
    onEventsChange(newEvents);
    setSelectedEventIndex(newEvents.length - 1);
  };
  
  // Delete the selected event
  const deleteEvent = (index) => {
    if (index === null || index < 0 || index >= events.length) return;
    
    // Get the key of the event to be deleted
    const eventToDeleteKey = events[index].key;
    
    // Create a filtered list of events without the deleted one
    const newEvents = [...events];
    newEvents.splice(index, 1);
    
    // Update any references to the deleted event in other events
    const updatedEvents = newEvents.map(event => {
      let updatedEvent = { ...event };
      
      // Update direct nextEvent references
      if (event.nextEvent === eventToDeleteKey) {
        updatedEvent.nextEvent = null;
      }
      
      // Update nextEvent references in preDialog choices
      if (event.preDialog) {
        updatedEvent.preDialog = event.preDialog.map(dialog => {
          if (dialog.choices) {
            const updatedChoices = dialog.choices.map(choice => {
              if (choice.nextEvent === eventToDeleteKey) {
                return { ...choice, nextEvent: null };
              }
              return choice;
            });
            return { ...dialog, choices: updatedChoices };
          }
          return dialog;
        });
      }
      
      // Update nextEvent references in postDialog choices
      if (event.postDialog) {
        updatedEvent.postDialog = event.postDialog.map(dialog => {
          if (dialog.choices) {
            const updatedChoices = dialog.choices.map(choice => {
              if (choice.nextEvent === eventToDeleteKey) {
                return { ...choice, nextEvent: null };
              }
              return choice;
            });
            return { ...dialog, choices: updatedChoices };
          }
          return dialog;
        });
      }
      
      return updatedEvent;
    });
    
    onEventsChange(updatedEvents);
    
    // Update selected index
    if (updatedEvents.length === 0) {
      setSelectedEventIndex(null);
    } else if (index >= updatedEvents.length) {
      setSelectedEventIndex(updatedEvents.length - 1);
    } else {
      setSelectedEventIndex(index);
    }
  };
  
  // Update a specific event
  const updateEvent = (index, updatedEvent) => {
    if (index === null || index < 0 || index >= events.length) return;
    
    // Check if the key has changed
    const oldKey = events[index].key;
    const newKey = updatedEvent.key;
    
    if (oldKey !== newKey) {
      // Verify the new key is unique
      const existingKeys = events.map(event => event.key);
      if (existingKeys.includes(newKey)) {
        alert(`Event key "${newKey}" already exists. Keys must be unique.`);
        return;
      }
      
      // Update references to this event in other events
      const updatedEvents = events.map((event, i) => {
        if (i === index) return updatedEvent;
        
        let eventCopy = { ...event };
        
        // Update direct nextEvent references
        if (event.nextEvent === oldKey) {
          eventCopy.nextEvent = newKey;
        }
        
        // Update nextEvent references in preDialog choices
        if (event.preDialog) {
          eventCopy.preDialog = event.preDialog.map(dialog => {
            if (dialog.choices) {
              const updatedChoices = dialog.choices.map(choice => {
                if (choice.nextEvent === oldKey) {
                  return { ...choice, nextEvent: newKey };
                }
                return choice;
              });
              return { ...dialog, choices: updatedChoices };
            }
            return dialog;
          });
        }
        
        // Update nextEvent references in postDialog choices
        if (event.postDialog) {
          eventCopy.postDialog = event.postDialog.map(dialog => {
            if (dialog.choices) {
              const updatedChoices = dialog.choices.map(choice => {
                if (choice.nextEvent === oldKey) {
                  return { ...choice, nextEvent: newKey };
                }
                return choice;
              });
              return { ...dialog, choices: updatedChoices };
            }
            return dialog;
          });
        }
        
        return eventCopy;
      });
      
      onEventsChange(updatedEvents);
    } else {
      // No key change, just update the event
      const newEvents = [...events];
      newEvents[index] = updatedEvent;
      onEventsChange(newEvents);
    }
  };
  
  return (
    <div className="h-full">
      <div className="flex space-x-4 mb-4">
        <button
          className={`px-4 py-2 rounded-lg font-semibold ${viewMode === 'edit' ? 'bg-yellow-700 text-white' : 'bg-gray-700 text-yellow-400 hover:bg-gray-600'}`}
          onClick={() => setViewMode('edit')}
        >
          Edit Mode
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-semibold ${viewMode === 'flow' ? 'bg-yellow-700 text-white' : 'bg-gray-700 text-yellow-400 hover:bg-gray-600'}`}
          onClick={() => setViewMode('flow')}
        >
          Flow Graph
        </button>
        <div className="flex-grow"></div>
        <button
          className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded"
          onClick={createNewEvent}
        >
          Add New Event
        </button>
      </div>
      
      {viewMode === 'edit' ? (
        <div className="grid grid-cols-4 gap-4 h-full">
          <div className="col-span-1 bg-gray-800 p-4 rounded-lg border border-yellow-700 overflow-y-auto">
            <EventList 
              events={events}
              selectedEventIndex={selectedEventIndex}
              onSelectEvent={(index) => setSelectedEventIndex(index)}
              onDeleteEvent={deleteEvent}
              onDuplicateEvent={duplicateEvent}
            />
          </div>
          
          <div className="col-span-3 bg-gray-800 p-4 rounded-lg border border-yellow-700 overflow-y-auto">
            {selectedEventIndex !== null ? (
              <EventEditor 
                event={events[selectedEventIndex]}
                allEvents={events} // For selecting nextEvent targets
                onEventChange={(updatedEvent) => updateEvent(selectedEventIndex, updatedEvent)}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-yellow-400 mb-4">No event selected or no events exist.</p>
                <button
                  className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded"
                  onClick={createNewEvent}
                >
                  Create Your First Event
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 p-4 rounded-lg border border-yellow-700 h-full">
          <EventFlowGraph 
            events={events}
            onSelectEvent={(index) => {
              setSelectedEventIndex(index);
              setViewMode('edit');
            }}
          />
        </div>
      )}
    </div>
  );
};

export default EventsEditor;