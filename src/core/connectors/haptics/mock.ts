import type { HapticsApi } from './api';

// Uses navigator.vibrate where the browser has it (Android Chrome); otherwise a no-op.
const buzz = (ms: number) => {
  if (import.meta.env.MODE !== 'test') navigator.vibrate?.(ms);
  return Promise.resolve();
};

export const mockHaptics: HapticsApi = {
  impact: (style = 'medium') => buzz(style === 'light' ? 10 : style === 'medium' ? 20 : 40),
  notify: () => buzz(30),
  selection: () => buzz(5),
  vibrate: (durationMs = 300) => buzz(durationMs),
};
