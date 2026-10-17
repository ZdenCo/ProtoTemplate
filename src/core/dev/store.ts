import { create } from 'zustand';

export const useDevOverlay = create<{ open: boolean }>(() => ({ open: false }));

export const openDevOverlay = () => useDevOverlay.setState({ open: true });
export const closeDevOverlay = () => useDevOverlay.setState({ open: false });

export interface LogEntry {
  at: number;
  level: 'log' | 'info' | 'warn' | 'error';
  text: string;
}

export const useLogs = create<{ entries: LogEntry[] }>(() => ({ entries: [] }));

/** Mirrors console output and uncaught errors into the dev overlay (last 200 entries). */
export function captureConsole(): void {
  const push = (level: LogEntry['level'], args: unknown[]) => {
    const text = args.map((a) => (a instanceof Error ? `${a.name}: ${a.message}` : typeof a === 'string' ? a : safeJson(a))).join(' ');
    useLogs.setState((s) => ({ entries: [...s.entries.slice(-199), { at: Date.now(), level, text }] }));
  };
  for (const level of ['log', 'info', 'warn', 'error'] as const) {
    const original = console[level].bind(console);
    console[level] = (...args: unknown[]) => {
      push(level, args);
      original(...args);
    };
  }
  window.addEventListener('error', (e) => push('error', [e.error ?? e.message]));
  window.addEventListener('unhandledrejection', (e) => push('error', ['Unhandled rejection:', e.reason]));
}

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
