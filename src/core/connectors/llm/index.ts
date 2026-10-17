import { defineConnector } from '../types';
import type { LlmApi } from './api';
import { mockLlm } from './mock';
import { realLlm } from './real';

export type * from './api';

declare module '../types' {
  interface ConnectorRegistry {
    llm: LlmApi;
  }
}

export default defineConnector<LlmApi>({ id: 'llm', real: realLlm, mock: mockLlm });
