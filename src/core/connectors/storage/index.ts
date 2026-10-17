import { defineConnector } from '../types';
import type { StorageApi } from './api';
import { mockStorage } from './mock';
import { realStorage } from './real';

export type * from './api';

declare module '../types' {
  interface ConnectorRegistry {
    storage: StorageApi;
  }
}

export default defineConnector<StorageApi>({ id: 'storage', real: realStorage, mock: mockStorage, core: true });
