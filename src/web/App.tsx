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
} from '@mui/material';
import { MessageLog } from './MessageLog.js';
import type { MessageEntry } from './MessageLog.js';
import { Keyboard } from './Keyboard.js';
import { StatusPanel } from './StatusPanel.js';
import { MidiSimulator } from '../simulator.js';
import { parseMidiMessage } from '../parser.js';
import type { MidiMessage } from '../types.js';

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
  const simulatorRef = useRef<MidiSimulator | null>(null);
  const timestampsRef = useRef<Date[]>([]);

  useEffect(() => {
    const simulator = new MidiSimulator();
    simulatorRef.current = simulator;

    simulator.onMessage((data) => {
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
      if ('channel' in message) {
        setLastChannel(message.channel);
      }
      timestampsRef.current.push(new Date());
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

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
          <Typography variant="h5" component="h1">
            MIDI Dashboard
          </Typography>
          <Button
            variant="contained"
            color={running ? 'error' : 'success'}
            onClick={handleToggle}
          >
            {running ? 'Stop' : 'Start'}
          </Button>
        </Box>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={8}>
            <Keyboard activeNotes={activeNotes} />
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
        <MessageLog messages={messages} />
      </Container>
    </ThemeProvider>
  );
}
