import React from 'react';
import type { WidgetConfig } from '../../types.js';

interface ValueWidgetProps {
  config: WidgetConfig;
  value: number | undefined;
}

export function ValueWidget({ config, value }: ValueWidgetProps): React.ReactElement {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="text-3xl font-bold text-white font-mono">
        {value !== undefined ? value : '\u2014'}
      </div>
      <div className="text-gray-400 text-sm mt-1">{config.label}</div>
      <div className="text-gray-500 text-xs">Ch {config.channel} · CC {config.cc}</div>
    </div>
  );
}
