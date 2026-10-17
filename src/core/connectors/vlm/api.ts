import type { DownloadableModel } from '../types';

export type { DownloadableModel };

export type VlmModelId = 'qwen3-vl-2b' | 'qwen3-vl-4b';


export interface VlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  /** Photo uri / webPath, data URL or file URL. */
  images?: string[];
}

export interface VlmGenerateOptions {
  maxTokens?: number;
  temperature?: number;
}

export interface VlmResult {
  text: string;
  tokensPerSecond: number;
  /** Stopped by cancel(). */
  cancelled: boolean;
  /** Hit maxTokens. */
  truncated: boolean;
}

export interface VlmApi {
  models(): DownloadableModel[];
  isDownloaded(id: VlmModelId): Promise<boolean>;
  /** Resumable download; `onProgress` gets 0..1. */
  download(id: VlmModelId, onProgress?: (fraction: number) => void): Promise<void>;
  deleteModel(id: VlmModelId): Promise<void>;
  /** Id of the model in memory, or null. */
  loadedModel(): Promise<string | null>;
  /** Loads into memory (unloads any other model). Takes a few seconds. */
  load(id: VlmModelId): Promise<void>;
  unload(): Promise<void>;
  /** Single question, optionally about images; streams pieces to `onToken`. */
  ask(prompt: string, options?: VlmGenerateOptions & { images?: string[]; system?: string }, onToken?: (piece: string) => void): Promise<VlmResult>;
  /** Full conversation (stateless: send the whole history each time). */
  chat(messages: VlmMessage[], options?: VlmGenerateOptions, onToken?: (piece: string) => void): Promise<VlmResult>;
  /** Stops the running generation; it resolves with `cancelled: true`. */
  cancel(): Promise<void>;
}
