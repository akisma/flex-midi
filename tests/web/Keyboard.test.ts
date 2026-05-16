import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { Keyboard } from '../../src/web/Keyboard.js';

describe('Keyboard', () => {
  it('renders 21 white keys (3 octaves: C3-B5)', () => {
    const { container } = render(
      React.createElement(Keyboard, { activeNotes: new Map<number, number>() })
    );
    const whiteKeys = container.querySelectorAll('[data-key-type="white"]');
    expect(whiteKeys.length).toBe(21);
  });

  it('renders 15 black keys (3 octaves of sharps/flats)', () => {
    const { container } = render(
      React.createElement(Keyboard, { activeNotes: new Map<number, number>() })
    );
    const blackKeys = container.querySelectorAll('[data-key-type="black"]');
    expect(blackKeys.length).toBe(15);
  });

  it('highlights a white key when its note is in activeNotes', () => {
    // C3 = note 48, which is a white key
    const activeNotes = new Map([[48, 1]]);
    const { container } = render(
      React.createElement(Keyboard, { activeNotes })
    );
    const key = container.querySelector('[data-note="48"]') as HTMLElement;
    expect(key).not.toBeNull();
    expect(key.style.backgroundColor).toBe('rgb(76, 175, 80)');
  });

  it('highlights a black key when its note is in activeNotes', () => {
    // C#3 = note 49, which is a black key
    const activeNotes = new Map([[49, 1]]);
    const { container } = render(
      React.createElement(Keyboard, { activeNotes })
    );
    const key = container.querySelector('[data-note="49"]') as HTMLElement;
    expect(key).not.toBeNull();
    expect(key.style.backgroundColor).toBe('rgb(76, 175, 80)');
  });

  it('does not highlight keys not in activeNotes', () => {
    // Only note 48 is active; note 50 (D3, white) should not be highlighted
    const activeNotes = new Map([[48, 1]]);
    const { container } = render(
      React.createElement(Keyboard, { activeNotes })
    );
    const key = container.querySelector('[data-note="50"]') as HTMLElement;
    expect(key).not.toBeNull();
    expect(key.style.backgroundColor).not.toBe('rgb(76, 175, 80)');
  });

  it('handles empty activeNotes set (no keys lit)', () => {
    const { container } = render(
      React.createElement(Keyboard, { activeNotes: new Map<number, number>() })
    );
    const allKeys = container.querySelectorAll('[data-note]');
    allKeys.forEach((key) => {
      expect((key as HTMLElement).style.backgroundColor).not.toBe('rgb(76, 175, 80)');
    });
  });

  it('in interactive mode, mousedown on a white key calls onNoteOn with correct bytes', () => {
    const onNoteOn = vi.fn();
    const { container } = render(
      React.createElement(Keyboard, {
        activeNotes: new Map<number, number>(),
        interactive: true,
        onNoteOn,
      })
    );
    // C3 = note 48, white key
    const key = container.querySelector('[data-note="48"]') as HTMLElement;
    fireEvent.mouseDown(key);
    expect(onNoteOn).toHaveBeenCalledTimes(1);
    const arg = onNoteOn.mock.calls[0][0] as Uint8Array;
    expect(arg).toBeInstanceOf(Uint8Array);
    expect(Array.from(arg)).toEqual([0x90, 48, 100]);
  });

  it('in interactive mode, mouseup on a key calls onNoteOff with correct bytes', () => {
    const onNoteOff = vi.fn();
    const { container } = render(
      React.createElement(Keyboard, {
        activeNotes: new Map<number, number>(),
        interactive: true,
        onNoteOff,
      })
    );
    // D3 = note 50, white key
    const key = container.querySelector('[data-note="50"]') as HTMLElement;
    fireEvent.mouseUp(key);
    expect(onNoteOff).toHaveBeenCalledTimes(1);
    const arg = onNoteOff.mock.calls[0][0] as Uint8Array;
    expect(arg).toBeInstanceOf(Uint8Array);
    expect(Array.from(arg)).toEqual([0x80, 50, 0]);
  });

  it('in non-interactive mode, mousedown does not call onNoteOn', () => {
    const onNoteOn = vi.fn();
    const { container } = render(
      React.createElement(Keyboard, {
        activeNotes: new Map<number, number>(),
        interactive: false,
        onNoteOn,
      })
    );
    const key = container.querySelector('[data-note="48"]') as HTMLElement;
    fireEvent.mouseDown(key);
    expect(onNoteOn).not.toHaveBeenCalled();
  });

  it('onMouseLeave on a pressed key calls onNoteOff', () => {
    const onNoteOn = vi.fn();
    const onNoteOff = vi.fn();
    const { container } = render(
      React.createElement(Keyboard, {
        activeNotes: new Map<number, number>(),
        interactive: true,
        onNoteOn,
        onNoteOff,
      })
    );
    // C#3 = note 49, black key
    const key = container.querySelector('[data-note="49"]') as HTMLElement;
    fireEvent.mouseDown(key);
    expect(onNoteOn).toHaveBeenCalledTimes(1);
    fireEvent.mouseLeave(key);
    expect(onNoteOff).toHaveBeenCalledTimes(1);
    const arg = onNoteOff.mock.calls[0][0] as Uint8Array;
    expect(Array.from(arg)).toEqual([0x80, 49, 0]);
  });
});
