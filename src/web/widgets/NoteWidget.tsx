import React from 'react';
import type { WidgetConfig } from '../../types.js';
import { midiNoteName } from '../utils.js';

interface NoteWidgetProps {
  config: WidgetConfig;
  isActive: boolean;
  velocity: number | undefined;
}

export function NoteWidget({ config, isActive, velocity }: NoteWidgetProps): React.ReactElement {
  const noteName = midiNoteName(config.cc);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <div
          data-testid="note-indicator"
          data-state={isActive ? 'active' : 'inactive'}
          className={`w-4 h-4 rounded-full ${
            isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-600'
          }`}
        />
        <div className="text-white text-lg font-mono font-bold">{noteName}</div>
      </div>
      <div className="text-gray-400 text-sm">{config.label}</div>
      <div className="text-gray-500 text-xs">Ch {config.channel} · Note {config.cc}</div>
      <div className="text-white text-sm mt-1">
        {velocity !== undefined ? `vel ${velocity}` : '\u2014'}
      </div>
    </div>
  );
}
