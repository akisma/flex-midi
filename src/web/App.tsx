import React, { useState, useEffect, useRef } from 'react';
import { MessageLog } from './MessageLog.js';
import type { MessageEntry } from './MessageLog.js';
import { Keyboard } from './Keyboard.js';
import { StatusPanel } from './StatusPanel.js';
import { WidgetGrid } from './WidgetGrid.js';
import { AddWidgetDialog } from './AddWidgetDialog.js';
import { MidiSimulator } from '../simulator.js';
import { parseMidiMessage } from '../parser.js';
import type { MidiMessage, WidgetConfig } from '../types.js';

const MAX_MESSAGES = 100;

export function App(): React.ReactElement {
  const [messages, setMessages] = useState<MessageEntry[]>([]);
  const [running, setRunning] = useState(true);
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  const [lastNote, setLastNote] = useState<(MidiMessage & { type: 'noteOn' }) | null>(null);
  const [lastChannel, setLastChannel] = useState<number | null>(null);
  const [messagesPerSecond, setMessagesPerSecond] = useState(0);
  const [mode, setMode] = useState<'simulator' | 'play'>('simulator');
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [ccValues, setCcValues] = useState<Map<string, number>>(new Map());
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const simulatorRef = useRef<MidiSimulator | null>(null);
  const timestampsRef = useRef<Date[]>([]);

  const handleMidiInput = (data: Uint8Array) => {
    const message = parseMidiMessage(data);
    const entry: MessageEntry = { message, timestamp: new Date() };
    setMessages((prev) => {
      const next = [...prev, entry];
      return next.length > MAX_MESSAGES ? next.slice(next.length - MAX_MESSAGES) : next;
    });
    if (message.type === 'noteOn') {
      setActiveNotes((prev) => {
        const next = new Set(prev);
        next.add(message.note);
        return next;
      });
      setLastNote(message);
    } else if (message.type === 'noteOff') {
      setActiveNotes((prev) => {
        const next = new Set(prev);
        next.delete(message.note);
        return next;
      });
    }
    if (message.type === 'controlChange') {
      setCcValues((prev) => {
        const next = new Map(prev);
        next.set(`${message.channel}:${message.controller}`, message.value);
        return next;
      });
    }
    if ('channel' in message) {
      setLastChannel(message.channel);
    }
    timestampsRef.current.push(new Date());
  };

  useEffect(() => {
    const simulator = new MidiSimulator();
    simulatorRef.current = simulator;

    simulator.onMessage((data) => {
      handleMidiInput(data);
    });

    simulator.start();

    const mpsInterval = setInterval(() => {
      const now = new Date();
      const cutoff = new Date(now.getTime() - 5000);
      timestampsRef.current = timestampsRef.current.filter((t) => t >= cutoff);
      setMessagesPerSecond(timestampsRef.current.length / 5);
    }, 500);

    return () => {
      simulator.stop();
      clearInterval(mpsInterval);
    };
  }, []);

  const handleToggle = () => {
    const simulator = simulatorRef.current;
    if (!simulator) return;
    if (running) {
      simulator.stop();
      setRunning(false);
    } else {
      simulator.start();
      setRunning(true);
    }
  };

  const handleModeChange = (_: React.MouseEvent<HTMLElement>, newMode: 'simulator' | 'play' | null) => {
    if (newMode === null) return;
    const simulator = simulatorRef.current;
    if (newMode === 'play') {
      if (simulator && running) {
        simulator.stop();
        setRunning(false);
      }
      setActiveNotes(new Set());
    } else {
      setActiveNotes(new Set());
    }
    setMode(newMode);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-xl font-bold text-white">MIDI Dashboard</h1>
          <div className="flex rounded overflow-hidden border border-gray-600">
            <button
              className={`px-3 py-1 text-sm font-medium ${
                mode === 'simulator'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => handleModeChange(null as unknown as React.MouseEvent<HTMLElement>, 'simulator')}
            >
              Simulator
            </button>
            <button
              className={`px-3 py-1 text-sm font-medium ${
                mode === 'play'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => handleModeChange(null as unknown as React.MouseEvent<HTMLElement>, 'play')}
            >
              Play
            </button>
          </div>
          {mode === 'simulator' && (
            <button
              className={`px-4 py-2 rounded font-medium text-white ${
                running ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
              onClick={handleToggle}
            >
              {running ? 'Stop' : 'Start'}
            </button>
          )}
          <button
            className="px-4 py-2 rounded font-medium bg-gray-700 text-white hover:bg-gray-600 border border-gray-600"
            onClick={() => setAddDialogOpen(true)}
          >
            Add Widget
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
          <div className="md:col-span-8">
            <Keyboard
              activeNotes={activeNotes}
              interactive={mode === 'play'}
              onNoteOn={mode === 'play' ? handleMidiInput : undefined}
              onNoteOff={mode === 'play' ? handleMidiInput : undefined}
            />
          </div>
          <div className="md:col-span-4">
            <StatusPanel
              lastNote={lastNote}
              lastChannel={lastChannel}
              activeNoteCount={activeNotes.size}
              messagesPerSecond={messagesPerSecond}
            />
          </div>
        </div>
        <WidgetGrid
          widgets={widgets}
          ccValues={ccValues}
          onRemove={(id) => setWidgets((prev) => prev.filter((w) => w.id !== id))}
        />
        <MessageLog messages={messages} />
        <AddWidgetDialog
          open={addDialogOpen}
          onAdd={(config) => {
            setWidgets((prev) => [...prev, config]);
            setAddDialogOpen(false);
          }}
          onClose={() => setAddDialogOpen(false)}
        />
      </div>
    </div>
  );
}
