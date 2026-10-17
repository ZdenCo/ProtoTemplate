export interface ListenOptions {
  /** BCP 47, e.g. 'en-US', 'cs-CZ'. Default: device language. */
  language?: string;
}

export interface SpeechApi {
  /** Asks for microphone + recognition permission; true when granted. */
  ensurePermission(): Promise<boolean>;
  /** False when the device has no recognition service. */
  isAvailable(): Promise<boolean>;
  /**
   * Listens until the user stops talking (or stop() is called) and resolves with the transcript.
   * `onPartial` receives the live transcript while speaking.
   */
  listen(options?: ListenOptions, onPartial?: (text: string) => void): Promise<string>;
  /** Ends the current listen(); it resolves with what was heard so far. */
  stop(): Promise<void>;
  languages(): Promise<string[]>;
}
