import { defineConnector } from '../types';
import type { QrApi } from './api';
import { mockQr } from './mock';
import { realQr } from './real';

export type * from './api';

declare module '../types' {
  interface ConnectorRegistry {
    qr: QrApi;
  }
}

export default defineConnector<QrApi>({ id: 'qr', real: realQr, mock: mockQr });
