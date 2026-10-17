import { defineConnector } from '../types';
import type { HapticsApi } from './api';
import { mockHaptics } from './mock';
import { realHaptics } from './real';

export type * from './api';

declare module '../types' {
  interface ConnectorRegistry {
    haptics: HapticsApi;
  }
}

export default defineConnector<HapticsApi>({ id: 'haptics', real: realHaptics, mock: mockHaptics });
