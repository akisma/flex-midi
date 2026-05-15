import type { WidgetConfig } from '../types.js';

const STORAGE_KEY = 'flex-midi-widgets';

const VALID_TYPES = new Set(['value', 'onoff', 'range', 'toggle', 'note']);

function isValidWidgetConfig(config: unknown): config is WidgetConfig {
  if (typeof config !== 'object' || config === null) return false;
  const c = config as Record<string, unknown>;
  if (typeof c.id !== 'string') return false;
  if (typeof c.type !== 'string' || !VALID_TYPES.has(c.type)) return false;
  if (typeof c.channel !== 'number' || c.channel < 0 || c.channel > 15) return false;
  if (typeof c.cc !== 'number' || c.cc < 0 || c.cc > 127) return false;
  if (typeof c.label !== 'string') return false;
  return true;
}

export function loadWidgets(): WidgetConfig[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidWidgetConfig);
  } catch {
    return [];
  }
}

export function saveWidgets(widgets: WidgetConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
  } catch (err) {
    console.warn('flex-midi: failed to save widgets to localStorage', err);
  }
}
