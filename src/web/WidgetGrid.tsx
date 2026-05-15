import React from 'react';
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
  activeNotes: Set<number>;
  noteVelocities: Map<string, number>;
}

export function WidgetGrid({ widgets, ccValues, onRemove, activeNotes, noteVelocities }: WidgetGridProps): React.ReactElement {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      {widgets.map((widget) => {
        const value = ccValues.get(`${widget.channel}:${widget.cc}`);
        return (
          <div key={widget.id} className="relative">
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
        );
      })}
    </div>
  );
}
