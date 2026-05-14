import React, { useState, useEffect, useRef } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { MessageLog } from './MessageLog.js';
import type { MessageEntry } from './MessageLog.js';
import { MidiSimulator } from '../simulator.js';
import { parseMidiMessage } from '../parser.js';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const MAX_MESSAGES = 100;

export function App(): React.ReactElement {
  const [messages, setMessages] = useState<MessageEntry[]>([]);
  const [running, setRunning] = useState(true);
  const simulatorRef = useRef<MidiSimulator | null>(null);

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
    });

    simulator.start();

    return () => {
      simulator.stop();
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
            MIDI Message Log
          </Typography>
          <Button
            variant="contained"
            color={running ? 'error' : 'success'}
            onClick={handleToggle}
          >
            {running ? 'Stop' : 'Start'}
          </Button>
        </Box>
        <MessageLog messages={messages} />
      </Container>
    </ThemeProvider>
  );
}
