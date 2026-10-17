import { defineConnector } from '../types';
import type { MotionApi } from './api';
import { mockMotion } from './mock';
import { realMotion } from './real';

export type * from './api';

declare module '../types' {
  interface ConnectorRegistry {
    motion: MotionApi;
  }
}

export default defineConnector<MotionApi>({ id: 'motion', real: realMotion, mock: mockMotion });
