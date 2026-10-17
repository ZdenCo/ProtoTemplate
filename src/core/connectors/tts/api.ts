export interface SystemVoice {
  /** Pass as `voice` to speak(). */
  index: number;
  name: string;
  lang: string;
  /** Works without network (voice data installed on the device). */
  offline: boolean;
}

export interface SystemSpeakOptions {
  /** BCP 47, e.g. 'en-US', 'cs-CZ', 'de-DE'. Default 'en-US'. */
  lang?: string;
  /** 1 = normal. */
  rate?: number;
  pitch?: number;
  /** SystemVoice.index. */
  voice?: number;
}

export interface TtsApi {
  /** Speaks with an OS system voice; resolves when finished. */
  speak(text: string, options?: SystemSpeakOptions): Promise<void>;
  stop(): Promise<void>;
  voices(): Promise<SystemVoice[]>;
}
