import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadWidgets, saveWidgets } from '../../src/web/persistence.js';
import type { WidgetConfig } from '../../src/types.js';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

const STORAGE_KEY = 'flex-midi-widgets';

const validWidget: WidgetConfig = {
  id: 'abc123',
  type: 'value',
  channel: 0,
  cc: 7,
  label: 'Volume',
};

beforeEach(() => {
  localStorage.clear();
});

describe('loadWidgets', () => {
  it('loads widgets from localStorage on mount', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([validWidget]));
    const result = loadWidgets();
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(validWidget);
  });

  it('returns empty array when localStorage key is missing', () => {
    const result = loadWidgets();
    expect(result).toEqual([]);
  });

  it('handles corrupt JSON in localStorage gracefully (starts empty)', () => {
    localStorage.setItem(STORAGE_KEY, 'not valid json {{{}');
    const result = loadWidgets();
    expect(result).toEqual([]);
  });

  it('filters out invalid widget configs on load', () => {
    const invalidWidget = { id: 'bad', type: 'unknown-type', channel: 0, cc: 0, label: 'Bad' };
    const missingLabel = { id: 'x', type: 'value', channel: 0, cc: 0 };
    const outOfRangeChannel = { id: 'y', type: 'value', channel: 99, cc: 0, label: 'Test' };
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([invalidWidget, missingLabel, outOfRangeChannel, validWidget])
    );
    const result = loadWidgets();
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(validWidget);
  });
});

describe('saveWidgets', () => {
  it('saves widgets to localStorage', () => {
    saveWidgets([validWidget]);
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toEqual(validWidget);
  });

  it('saves an empty array when widgets list is empty', () => {
    saveWidgets([]);
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!)).toEqual([]);
  });
});
