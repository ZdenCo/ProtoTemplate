import { defineConnector } from '../types';
import type { TtsApi } from './api';
import { mockTts } from './mock';
import { realTts } from './real';

export type * from './api';

declare module '../types' {
  interface ConnectorRegistry {
    tts: TtsApi;
  }
}

export default defineConnector<TtsApi>({ id: 'tts', real: realTts, mock: mockTts });
