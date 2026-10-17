import { defineConnector } from '../types';
import type { VlmApi } from './api';
import { mockVlm } from './mock';
import { realVlm } from './real';

export type * from './api';

declare module '../types' {
  interface ConnectorRegistry {
    vlm: VlmApi;
  }
}

export default defineConnector<VlmApi>({ id: 'vlm', real: realVlm, mock: mockVlm });
