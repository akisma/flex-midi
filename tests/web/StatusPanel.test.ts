import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { StatusPanel, midiNoteName } from '../../src/web/StatusPanel.js';

describe('midiNoteName', () => {
  it('note 60 = C4', () => {
    expect(midiNoteName(60)).toBe('C4');
  });

  it('note 61 = C#4', () => {
    expect(midiNoteName(61)).toBe('C#4');
  });

  it('note 69 = A4', () => {
    expect(midiNoteName(69)).toBe('A4');
  });

  it('note 48 = C3', () => {
    expect(midiNoteName(48)).toBe('C3');
  });

  it('note 83 = B5', () => {
    expect(midiNoteName(83)).toBe('B5');
  });

  it('note 0 = C-1', () => {
    expect(midiNoteName(0)).toBe('C-1');
  });

  it('note 127 = G9', () => {
    expect(midiNoteName(127)).toBe('G9');
  });
});

describe('StatusPanel', () => {
  it('renders \u2014 when no last note', () => {
    render(
      React.createElement(StatusPanel, {
        lastNote: null,
        lastChannel: null,
        activeNoteCount: 0,
        messagesPerSecond: 0,
      })
    );
    expect(screen.getAllByText('\u2014').length).toBeGreaterThan(0);
  });

  it('displays note name and velocity when lastNote is provided', () => {
    render(
      React.createElement(StatusPanel, {
        lastNote: { type: 'noteOn', channel: 0, note: 60, velocity: 92 },
        lastChannel: 0,
        activeNoteCount: 1,
        messagesPerSecond: 0,
      })
    );
    expect(screen.getByText('C4 (vel 92)')).toBeTruthy();
  });

  it('displays channel number', () => {
    render(
      React.createElement(StatusPanel, {
        lastNote: null,
        lastChannel: 3,
        activeNoteCount: 0,
        messagesPerSecond: 0,
      })
    );
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('displays active note count', () => {
    render(
      React.createElement(StatusPanel, {
        lastNote: null,
        lastChannel: null,
        activeNoteCount: 5,
        messagesPerSecond: 0,
      })
    );
    expect(screen.getByText('5')).toBeTruthy();
  });

  it('displays messages per second with one decimal', () => {
    render(
      React.createElement(StatusPanel, {
        lastNote: null,
        lastChannel: null,
        activeNoteCount: 0,
        messagesPerSecond: 4.2,
      })
    );
    expect(screen.getByText('4.2')).toBeTruthy();
  });
});
