import { defineConnector } from '../types';
import type { BluetoothApi } from './api';
import { mockBluetooth } from './mock';
import { realBluetooth } from './real';

export type * from './api';
export { BLE_UUIDS } from './api';

declare module '../types' {
  interface ConnectorRegistry {
    bluetooth: BluetoothApi;
  }
}

export default defineConnector<BluetoothApi>({ id: 'bluetooth', real: realBluetooth, mock: mockBluetooth });
