export type LlmAvailability = 'available' | 'downloadable' | 'notready' | 'unavailable';

export interface LlmAskOptions {
  /** System instructions for this session. */
  instructions?: string;
  /** Same id across calls = multi-turn conversation (the model remembers). */
  sessionId?: string;
  temperature?: number;
  /** Android caps this at 256. */
  maxTokens?: number;
}

export interface LlmApi {
  availability(): Promise<LlmAvailability>;
  /** Resolves once usable (triggers the Gemini Nano download on Android). Rejects with DeviceUnsupportedError. */
  ensureReady(timeoutMs?: number): Promise<void>;
  /** Whole answer at once: no streaming. */
  ask(prompt: string, options?: LlmAskOptions): Promise<string>;
  endSession(sessionId: string): Promise<void>;
}
