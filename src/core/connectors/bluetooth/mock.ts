import { delay, maybeFail } from '../mock-utils';
import { BLE_UUIDS } from './api';
import type { BluetoothApi } from './api';

// One fake heart-rate strap (heart rate + battery) and one unnamed beacon.
const STRAP = { deviceId: 'mock-hr-01', name: 'Mock HR Strap' };
const BEACON = { deviceId: 'mock-beacon-02' };
const short = (id: string) => (/^[0-9a-f]{4}$/i.test(id) ? `0000${id.toLowerCase()}-0000-1000-8000-00805f9b34fb` : id.toLowerCase());

export const mockBluetooth: BluetoothApi = {
  async scan(_filter, onResult) {
    maybeFail('bluetooth');
    const timer = setInterval(() => {
      onResult({ device: STRAP, rssi: -55 - Math.round(Math.random() * 10), localName: STRAP.name });
      onResult({ device: BEACON, rssi: -80 - Math.round(Math.random() * 10) });
    }, 700);
    return () => clearInterval(timer);
  },
  async requestDevice() {
    await delay(500);
    maybeFail('bluetooth');
    return STRAP;
  },
  connect: () => delay(400),
  disconnect: () => delay(100),
  async services() {
    return [
      { uuid: BLE_UUIDS.heartRateService, characteristics: [{ uuid: BLE_UUIDS.heartRateMeasurement, read: false, write: false, notify: true }] },
      { uuid: BLE_UUIDS.batteryService, characteristics: [{ uuid: BLE_UUIDS.batteryLevel, read: true, write: false, notify: true }] },
    ];
  },
  async read(_deviceId, _service, characteristic) {
    if (short(characteristic) !== BLE_UUIDS.batteryLevel) throw new Error('Characteristic is not readable');
    return new DataView(new Uint8Array([87]).buffer);
  },
  write: () => delay(50),
  async subscribe(_deviceId, _service, characteristic, onValue) {
    const isHeartRate = short(characteristic) === BLE_UUIDS.heartRateMeasurement;
    const timer = setInterval(() => {
      const value = isHeartRate ? [0, 68 + Math.round(Math.random() * 10)] : [87];
      onValue(new DataView(new Uint8Array(value).buffer));
    }, 1000);
    return () => clearInterval(timer);
  },
};
