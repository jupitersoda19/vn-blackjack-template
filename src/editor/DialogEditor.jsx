import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DialogSegmentEditor from './DialogSegmentEditor';

// Sortable dialog segment item
const SortableDialogSegment = ({ segment, index, onRemove, onUpdate }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: `dialog-${index}` });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-800 p-4 rounded-lg border border-gray-700"
    >
      <div className="flex justify-between items-center mb-3">
        <div 
          {...attributes}
          {...listeners}
          className="cursor-move bg-gray-700 p-1 rounded"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </div>
        
        <span className="text-yellow-500 font-semibold">Dialog #{index + 1}</span>
        
        <button
          onClick={() => onRemove(index)}
          className="text-gray-400 hover:text-red-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <DialogSegmentEditor 
        segment={segment}
        onSegmentChange={(updatedSegment) => onUpdate(index, updatedSegment)}
      />
    </div>
  );
};

const DialogEditor = ({ dialogSequence, onDialogChange }) => {
  // Setup sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Handle adding a new dialog segment
  const addDialogSegment = () => {
    const newSegment = {
      background: "/assets/backgrounds/default.jpg",
      characters: {},
      text: "New dialog text."
    };
    
    onDialogChange([...dialogSequence, newSegment]);
  };
  
  // Handle removing a dialog segment
  const removeDialogSegment = (index) => {
    const newDialogSequence = [...dialogSequence];
    newDialogSequence.splice(index, 1);
    onDialogChange(newDialogSequence);
  };
  
  // Handle updating a dialog segment
  const updateDialogSegment = (index, updatedSegment) => {
    const newDialogSequence = [...dialogSequence];
    newDialogSequence[index] = updatedSegment;
    onDialogChange(newDialogSequence);
  };
  
  // Handle drag end and reordering
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const activeIndex = parseInt(active.id.split('-')[1]);
      const overIndex = parseInt(over.id.split('-')[1]);
      
      const items = arrayMove(dialogSequence, activeIndex, overIndex);
      onDialogChange(items);
    }
  };
  
  // Create sortable IDs for each dialog segment
  const items = dialogSequence.map((_, index) => `dialog-${index}`);
  
  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-4">
          {dialogSequence.length === 0 ? (
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <p className="text-yellow-400">No dialog segments yet. Add your first segment!</p>
            </div>
          ) : (
            <SortableContext items={items} strategy={verticalListSortingStrategy}>
              {dialogSequence.map((segment, index) => (
                <SortableDialogSegment 
                  key={`dialog-${index}`}
                  segment={segment}
                  index={index}
                  onRemove={removeDialogSegment}
                  onUpdate={updateDialogSegment}
                />
              ))}
            </SortableContext>
          )}
        </div>
      </DndContext>
      
      <div className="mt-4">
        <button
          onClick={addDialogSegment}
          className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
          Add Dialog Segment
        </button>
      </div>
    </div>
  );
};

export default DialogEditor;