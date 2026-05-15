import React, { useState, useEffect } from 'react';
import type { WidgetConfig, MidiMessage } from '../types.js';
import { midiNoteName } from './utils.js';

interface AddWidgetDialogProps {
  open: boolean;
  onAdd: (config: WidgetConfig) => void;
  onClose: () => void;
  lastMidiMessage?: MidiMessage | null;
}

export function AddWidgetDialog({ open, onAdd, onClose, lastMidiMessage }: AddWidgetDialogProps): React.ReactElement | null {
  const [label, setLabel] = useState('');
  const [channel, setChannel] = useState(0);
  const [cc, setCc] = useState(0);
  const [type, setType] = useState<'value' | 'onoff' | 'range' | 'toggle' | 'note'>('value');
  const [threshold, setThreshold] = useState(64);
  const [learning, setLearning] = useState(false);

  useEffect(() => {
    if (!learning || !lastMidiMessage) return;
    if (lastMidiMessage.type === 'controlChange') {
      setChannel(lastMidiMessage.channel);
      setCc(lastMidiMessage.controller);
      setLabel(`CC ${lastMidiMessage.controller}`);
      setType('range');
      setLearning(false);
    } else if (lastMidiMessage.type === 'noteOn') {
      setChannel(lastMidiMessage.channel);
      setCc(lastMidiMessage.note);
      setLabel(midiNoteName(lastMidiMessage.note));
      setType('note');
      setLearning(false);
    }
  }, [lastMidiMessage, learning]);

  if (!open) return null;

  const labelError = label.trim() === '';
  const channelError = channel < 0 || channel > 15;
  const ccError = cc < 0 || cc > 127;
  const thresholdError = threshold < 0 || threshold > 127;

  const isValid = !labelError && !channelError && !ccError && (type !== 'onoff' && type !== 'toggle' || !thresholdError);

  const handleAdd = () => {
    if (!isValid) return;
    const config: WidgetConfig = {
      id: crypto.randomUUID(),
      type,
      channel,
      cc,
      label: label.trim(),
      ...(type === 'onoff' || type === 'toggle' ? { threshold } : {}),
    };
    onAdd(config);
    handleClose();
  };

  const handleClose = () => {
    setLabel('');
    setChannel(0);
    setCc(0);
    setType('value' as 'value' | 'onoff' | 'range' | 'toggle' | 'note');
    setThreshold(64);
    setLearning(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4">Add Widget</h2>
        {learning ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-white text-sm">Waiting for MIDI input...</span>
            </div>
            <button
              className="px-4 py-2 rounded font-medium text-gray-300 hover:text-white border border-gray-600"
              onClick={() => setLearning(false)}
            >
              Cancel Learn
            </button>
          </div>
        ) : (
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
            <label htmlFor="widget-cc" className="text-sm text-gray-400 mb-1 block">{type === 'note' ? 'Note Number' : 'CC Number'}</label>
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
              onChange={(e) => setType(e.target.value as 'value' | 'onoff' | 'range' | 'toggle' | 'note')}
            >
              <option value="value">Value Display</option>
              <option value="onoff">On/Off Indicator</option>
              <option value="range">Range</option>
              <option value="toggle">Toggle</option>
              <option value="note">Note Monitor</option>
            </select>
          </div>
          {(type === 'onoff' || type === 'toggle') && (
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
        )}
        <div className="flex justify-end gap-2 mt-6">
          {!learning && (
            <button
              className="px-4 py-2 rounded font-medium bg-purple-600 text-white hover:bg-purple-700"
              onClick={() => setLearning(true)}
            >
              Learn
            </button>
          )}
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
