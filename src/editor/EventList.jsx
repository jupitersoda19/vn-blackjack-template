import React from 'react';

const EventList = ({ events, selectedEventIndex, onSelectEvent, onDeleteEvent, onDuplicateEvent }) => {
  return (
    <div>
      <h3 className="text-xl font-bold text-yellow-500 mb-4">Event List</h3>
      
      {events.length === 0 ? (
        <div className="text-yellow-400 text-center p-4">
          No events created yet.
        </div>
      ) : (
        <ul className="space-y-2">
          {events.map((event, index) => (
            <li 
              key={index}
              className={`
                p-3 rounded-lg cursor-pointer relative
                ${selectedEventIndex === index ? 
                  'bg-yellow-700 text-white' : 
                  'bg-gray-700 text-yellow-300 hover:bg-gray-600'
                }
              `}
              onClick={() => onSelectEvent(index)}
            >
              <div className="flex justify-between items-center">
                <div className="flex-grow">
                  <div className="font-semibold truncate">{event.title}</div>
                  <div className="text-xs opacity-75 truncate">Key: {event.key}</div>
                </div>
                <div className="flex space-x-2">
                  <button
                    className="text-gray-400 hover:text-blue-500 focus:outline-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateEvent(index);
                    }}
                    title="Duplicate event"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                      <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
                    </svg>
                  </button>
                  <button
                    className="text-gray-400 hover:text-red-500 focus:outline-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Are you sure you want to delete event "${event.title}"?`)) {
                        onDeleteEvent(index);
                      }
                    }}
                    title="Delete event"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Show connection info in a compact way */}
              <div className="mt-2 text-xs">
                {event.nextEvent && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span>Next: {event.nextEvent}</span>
                  </div>
                )}
                
                {/* Show number of choices if any */}
                {event.preDialog && event.preDialog.some(dialog => dialog.choices && dialog.choices.length > 0) && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      {event.preDialog.reduce((total, dialog) => 
                        total + (dialog.choices ? dialog.choices.length : 0), 0)
                      } choices
                    </span>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EventList;