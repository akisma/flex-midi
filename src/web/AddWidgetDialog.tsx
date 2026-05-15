import React, { useState } from 'react';
import type { WidgetConfig } from '../types.js';

interface AddWidgetDialogProps {
  open: boolean;
  onAdd: (config: WidgetConfig) => void;
  onClose: () => void;
}

export function AddWidgetDialog({ open, onAdd, onClose }: AddWidgetDialogProps): React.ReactElement | null {
  const [label, setLabel] = useState('');
  const [channel, setChannel] = useState(0);
  const [cc, setCc] = useState(0);
  const [type, setType] = useState<'value' | 'onoff'>('value');
  const [threshold, setThreshold] = useState(64);

  if (!open) return null;

  const labelError = label.trim() === '';
  const channelError = channel < 0 || channel > 15;
  const ccError = cc < 0 || cc > 127;
  const thresholdError = threshold < 0 || threshold > 127;

  const isValid = !labelError && !channelError && !ccError && (type !== 'onoff' || !thresholdError);

  const handleAdd = () => {
    if (!isValid) return;
    const config: WidgetConfig = {
      id: crypto.randomUUID(),
      type,
      channel,
      cc,
      label: label.trim(),
      ...(type === 'onoff' ? { threshold } : {}),
    };
    onAdd(config);
    handleClose();
  };

  const handleClose = () => {
    setLabel('');
    setChannel(0);
    setCc(0);
    setType('value');
    setThreshold(64);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4">Add Widget</h2>
        <div className="flex flex-col gap-3">
          <div>
            <label htmlFor="widget-label" className="text-sm text-gray-400 mb-1 block">Label</label>
            <input
              id="widget-label"
              className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
            {labelError && label !== '' && (
              <span className="text-red-400 text-xs mt-1">Label is required</span>
            )}
          </div>
          <div>
            <label htmlFor="widget-channel" className="text-sm text-gray-400 mb-1 block">Channel</label>
            <input
              id="widget-channel"
              type="number"
              min={0}
              max={15}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
              value={channel}
              onChange={(e) => setChannel(Number(e.target.value))}
            />
            {channelError && (
              <span className="text-red-400 text-xs mt-1">Must be 0-15</span>
            )}
          </div>
          <div>
            <label htmlFor="widget-cc" className="text-sm text-gray-400 mb-1 block">CC Number</label>
            <input
              id="widget-cc"
              type="number"
              min={0}
              max={127}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
              value={cc}
              onChange={(e) => setCc(Number(e.target.value))}
            />
            {ccError && (
              <span className="text-red-400 text-xs mt-1">Must be 0-127</span>
            )}
          </div>
          <div>
            <label htmlFor="widget-type" className="text-sm text-gray-400 mb-1 block">Type</label>
            <select
              id="widget-type"
              className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600"
              value={type}
              onChange={(e) => setType(e.target.value as 'value' | 'onoff')}
            >
              <option value="value">Value Display</option>
              <option value="onoff">On/Off Indicator</option>
            </select>
          </div>
          {type === 'onoff' && (
            <div>
              <label htmlFor="widget-threshold" className="text-sm text-gray-400 mb-1 block">Threshold</label>
              <input
                id="widget-threshold"
                type="number"
                min={0}
                max={127}
                className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
              />
              {thresholdError && (
                <span className="text-red-400 text-xs mt-1">Must be 0-127</span>
              )}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            className="px-4 py-2 rounded font-medium text-gray-300 hover:text-white"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded font-medium bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAdd}
            disabled={!isValid}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
