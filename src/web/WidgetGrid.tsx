import React from 'react';
import type { WidgetConfig } from '../types.js';
import { ValueWidget } from './widgets/ValueWidget.js';
import { OnOffWidget } from './widgets/OnOffWidget.js';

interface WidgetGridProps {
  widgets: WidgetConfig[];
  ccValues: Map<string, number>;
  onRemove: (id: string) => void;
}

export function WidgetGrid({ widgets, ccValues, onRemove }: WidgetGridProps): React.ReactElement {
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
            {widget.type === 'value' ? (
              <ValueWidget config={widget} value={value} />
            ) : (
              <OnOffWidget config={widget} value={value} />
            )}
          </div>
        );
      })}
    </div>
  );
}
