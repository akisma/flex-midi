import React, { useState, useEffect, useRef } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Typography,
  Button,
  Box,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
const AddIcon = () => React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 24, height: 24, viewBox: '0 0 24 24', fill: 'currentColor' }, React.createElement('path', { d: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z' }));
import { MessageLog } from './MessageLog.js';
import type { MessageEntry } from './MessageLog.js';
import { Keyboard } from './Keyboard.js';
import { StatusPanel } from './StatusPanel.js';
import { WidgetGrid } from './WidgetGrid.js';
import { AddWidgetDialog } from './AddWidgetDialog.js';
import { MidiSimulator } from '../simulator.js';
import { parseMidiMessage } from '../parser.js';
import type { MidiMessage, WidgetConfig } from '../types.js';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

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
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
          <Typography variant="h5" component="h1">
            MIDI Dashboard
          </Typography>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleModeChange}
            size="small"
          >
            <ToggleButton value="simulator">Simulator</ToggleButton>
            <ToggleButton value="play">Play</ToggleButton>
          </ToggleButtonGroup>
          {mode === 'simulator' && (
            <Button
              variant="contained"
              color={running ? 'error' : 'success'}
              onClick={handleToggle}
            >
              {running ? 'Stop' : 'Start'}
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={React.createElement(AddIcon)}
            onClick={() => setAddDialogOpen(true)}
          >
            Add Widget
          </Button>
        </Box>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={8}>
            <Keyboard
              activeNotes={activeNotes}
              interactive={mode === 'play'}
              onNoteOn={mode === 'play' ? handleMidiInput : undefined}
              onNoteOff={mode === 'play' ? handleMidiInput : undefined}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatusPanel
              lastNote={lastNote}
              lastChannel={lastChannel}
              activeNoteCount={activeNotes.size}
              messagesPerSecond={messagesPerSecond}
            />
          </Grid>
        </Grid>
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
      </Container>
    </ThemeProvider>
  );
}
