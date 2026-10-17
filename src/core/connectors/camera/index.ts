import { defineConnector } from '../types';
import type { CameraApi } from './api';
import { mockCamera } from './mock';
import { realCamera } from './real';

export type * from './api';

declare module '../types' {
  interface ConnectorRegistry {
    camera: CameraApi;
  }
}

export default defineConnector<CameraApi>({ id: 'camera', real: realCamera, mock: mockCamera });
