import type { DownloadableModel } from '../types';

export type NeuralVoiceLanguage = 'en-US' | 'en-GB' | 'es' | 'fr' | 'hi' | 'it' | 'pt-BR' | 'zh';

export interface NeuralVoice {
  /** Kokoro voice id, e.g. 'af_heart' (default), 'am_michael', 'bf_emma'. */
  id: string;
  language: NeuralVoiceLanguage;
  gender: 'female' | 'male';
}

export interface NeuralSpeakOptions {
  voice?: string;
  /** 1 = normal, > 1 faster. */
  speed?: number;
  /** Play after what is already playing instead of interrupting. */
  queue?: boolean;
}

export interface SpeechStream {
  /** Add the next piece (e.g. a streamed token). Complete sentences start speaking immediately. */
  push(piece: string): void;
  /** Speak the rest; resolves when everything was played. */
  end(): Promise<void>;
  cancel(): Promise<void>;
}

export interface NeuralTtsApi {
  model(): DownloadableModel;
  isDownloaded(): Promise<boolean>;
  /** One-time ~370 MB download; `onProgress` gets 0..1. */
  download(onProgress?: (fraction: number) => void): Promise<void>;
  deleteModel(): Promise<void>;
  /** Downloads if needed, then loads into memory. Call before speak(). */
  prepare(onProgress?: (fraction: number) => void): Promise<void>;
  voices(language?: NeuralVoiceLanguage): NeuralVoice[];
  /** Resolves when playback ends. */
  speak(text: string, options?: NeuralSpeakOptions): Promise<void>;
  /** WAV data URL without playing. */
  synthesize(text: string, options?: Omit<NeuralSpeakOptions, 'queue'>): Promise<{ audio: string; durationMs: number }>;
  stop(): Promise<void>;
  /** Speak text that arrives in pieces (streamed LLM output); strips Markdown. */
  createSpeechStream(options?: Omit<NeuralSpeakOptions, 'queue'>): SpeechStream;
}
