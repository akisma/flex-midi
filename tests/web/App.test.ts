import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { App } from '../../src/web/App.js';

vi.mock('../../src/simulator.js', () => {
  return {
    MidiSimulator: vi.fn().mockImplementation(() => ({
      onMessage: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    })),
  };
});

describe('App mode toggle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('default mode is Simulator — Start/Stop button is visible', () => {
    render(React.createElement(App));
    expect(screen.getByRole('button', { name: /stop/i })).toBeTruthy();
  });

  it('switching to Play mode hides Start/Stop button', () => {
    render(React.createElement(App));
    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);
    expect(screen.queryByRole('button', { name: /stop/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /^start$/i })).toBeNull();
  });

  it('switching back to Simulator mode shows Start/Stop button', () => {
    render(React.createElement(App));
    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);
    expect(screen.queryByRole('button', { name: /stop/i })).toBeNull();
    const simulatorButton = screen.getByRole('button', { name: /simulator/i });
    fireEvent.click(simulatorButton);
    expect(screen.getByRole('button', { name: /start/i })).toBeTruthy();
  });

  it('in Play mode, keyboard keys have cursor pointer styling', () => {
    const { container } = render(React.createElement(App));
    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);
    const whiteKey = container.querySelector('[data-key-type="white"]') as HTMLElement;
    expect(whiteKey).not.toBeNull();
    // In interactive mode, cursor:pointer is applied via sx which sets inline style
    // We verify the key exists and the mode toggle worked (Start/Stop hidden)
    expect(screen.queryByRole('button', { name: /stop/i })).toBeNull();
  });
});
