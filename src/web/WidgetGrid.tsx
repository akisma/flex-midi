import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import type { WidgetConfig } from '../types.js';
import { ValueWidget } from './widgets/ValueWidget.js';
import { OnOffWidget } from './widgets/OnOffWidget.js';
import { RangeWidget } from './widgets/RangeWidget.js';
import { ToggleWidget } from './widgets/ToggleWidget.js';
import { NoteWidget } from './widgets/NoteWidget.js';

interface WidgetGridProps {
  widgets: WidgetConfig[];
  ccValues: Map<string, number>;
  onRemove: (id: string) => void;
  onReorder: (widgets: WidgetConfig[]) => void;
  activeNotes: Set<number>;
  noteVelocities: Map<string, number>;
}

function GripIcon(): React.ReactElement {
  return (
    <svg
      width="12"
      height="16"
      viewBox="0 0 12 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="3" cy="3" r="1.5" />
      <circle cx="9" cy="3" r="1.5" />
      <circle cx="3" cy="8" r="1.5" />
      <circle cx="9" cy="8" r="1.5" />
      <circle cx="3" cy="13" r="1.5" />
      <circle cx="9" cy="13" r="1.5" />
    </svg>
  );
}

export function WidgetGrid({
  widgets,
  ccValues,
  onRemove,
  onReorder,
  activeNotes,
  noteVelocities,
}: WidgetGridProps): React.ReactElement {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;

    const reordered = Array.from(widgets);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    onReorder(reordered);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="widget-grid" direction="horizontal">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4"
          >
            {widgets.map((widget, index) => {
              const value = ccValues.get(`${widget.channel}:${widget.cc}`);
              return (
                <Draggable key={widget.id} draggableId={widget.id} index={index}>
                  {(dragProvided, snapshot) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      className={`relative ${
                        snapshot.isDragging
                          ? 'opacity-75 shadow-2xl ring-2 ring-blue-500'
                          : ''
                      }`}
                    >
                      <div
                        data-testid="drag-handle"
                        {...dragProvided.dragHandleProps}
                        className="absolute top-2 left-2 text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing z-10"
                      >
                        <GripIcon />
                      </div>
                      <button
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-400 z-10"
                        onClick={() => onRemove(widget.id)}
                        aria-label="delete widget"
                      >
                        &#x2715;
                      </button>
                      {widget.type === 'value' && <ValueWidget config={widget} value={value} />}
                      {widget.type === 'onoff' && <OnOffWidget config={widget} value={value} />}
                      {widget.type === 'range' && <RangeWidget config={widget} value={value} />}
                      {widget.type === 'toggle' && <ToggleWidget config={widget} value={value} />}
                      {widget.type === 'note' && (
                        <NoteWidget
                          config={widget}
                          isActive={activeNotes.has(widget.cc)}
                          velocity={noteVelocities.get(`${widget.channel}:${widget.cc}`)}
                        />
                      )}
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
