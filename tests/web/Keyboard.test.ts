import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { Keyboard } from '../../src/web/Keyboard.js';

describe('Keyboard', () => {
  it('renders 21 white keys (3 octaves: C3-B5)', () => {
    const { container } = render(
      React.createElement(Keyboard, { activeNotes: new Set<number>() })
    );
    const whiteKeys = container.querySelectorAll('[data-key-type="white"]');
    expect(whiteKeys.length).toBe(21);
  });

  it('renders 15 black keys (3 octaves of sharps/flats)', () => {
    const { container } = render(
      React.createElement(Keyboard, { activeNotes: new Set<number>() })
    );
    const blackKeys = container.querySelectorAll('[data-key-type="black"]');
    expect(blackKeys.length).toBe(15);
  });

  it('highlights a white key when its note is in activeNotes', () => {
    // C3 = note 48, which is a white key
    const activeNotes = new Set([48]);
    const { container } = render(
      React.createElement(Keyboard, { activeNotes })
    );
    const key = container.querySelector('[data-note="48"]') as HTMLElement;
    expect(key).not.toBeNull();
    expect(key.style.backgroundColor).toBe('rgb(76, 175, 80)');
  });

  it('highlights a black key when its note is in activeNotes', () => {
    // C#3 = note 49, which is a black key
    const activeNotes = new Set([49]);
    const { container } = render(
      React.createElement(Keyboard, { activeNotes })
    );
    const key = container.querySelector('[data-note="49"]') as HTMLElement;
    expect(key).not.toBeNull();
    expect(key.style.backgroundColor).toBe('rgb(76, 175, 80)');
  });

  it('does not highlight keys not in activeNotes', () => {
    // Only note 48 is active; note 50 (D3, white) should not be highlighted
    const activeNotes = new Set([48]);
    const { container } = render(
      React.createElement(Keyboard, { activeNotes })
    );
    const key = container.querySelector('[data-note="50"]') as HTMLElement;
    expect(key).not.toBeNull();
    expect(key.style.backgroundColor).not.toBe('rgb(76, 175, 80)');
  });

  it('handles empty activeNotes set (no keys lit)', () => {
    const { container } = render(
      React.createElement(Keyboard, { activeNotes: new Set<number>() })
    );
    const allKeys = container.querySelectorAll('[data-note]');
    allKeys.forEach((key) => {
      expect((key as HTMLElement).style.backgroundColor).not.toBe('rgb(76, 175, 80)');
    });
  });
});
