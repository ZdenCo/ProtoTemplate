export interface HapticsApi {
  /** Physical tap, e.g. on a button press. */
  impact(style?: 'light' | 'medium' | 'heavy'): Promise<void>;
  /** Success / warning / error pattern. */
  notify(type?: 'success' | 'warning' | 'error'): Promise<void>;
  /** Light tick for picker-style selection changes. */
  selection(): Promise<void>;
  vibrate(durationMs?: number): Promise<void>;
}
