import { defineConnector } from '../types';
import type { SpeechApi } from './api';
import { mockSpeech } from './mock';
import { realSpeech } from './real';

export type * from './api';

declare module '../types' {
  interface ConnectorRegistry {
    speech: SpeechApi;
  }
}

export default defineConnector<SpeechApi>({ id: 'speech', real: realSpeech, mock: mockSpeech });
