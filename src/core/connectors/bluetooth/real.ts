import { bluetooth } from '@protoshell/sdk';

import type { BleFilter, BluetoothApi } from './api';

const uuid = (id: string) => (/^[0-9a-f]{4}$/i.test(id) ? bluetooth.numberToUUID(parseInt(id, 16)) : id.toLowerCase());
const filter = ({ services, namePrefix }: BleFilter = {}) => ({ services: services?.map(uuid), namePrefix });

export const realBluetooth: BluetoothApi = {
  async scan(options, onResult) {
    const ble = await bluetooth.ble();
    await ble.requestLEScan({ ...filter(options), allowDuplicates: true }, (r) =>
      onResult({ device: { deviceId: r.device.deviceId, name: r.device.name }, rssi: r.rssi, localName: r.localName }),
    );
    return () => void ble.stopLEScan();
  },
  async requestDevice(options) {
    const device = await (await bluetooth.ble()).requestDevice(filter(options));
    return { deviceId: device.deviceId, name: device.name };
  },
  connect: async (deviceId, onDisconnect) => (await bluetooth.ble()).connect(deviceId, () => onDisconnect?.()),
  disconnect: async (deviceId) => (await bluetooth.ble()).disconnect(deviceId),
  services: async (deviceId) =>
    (await (await bluetooth.ble()).getServices(deviceId)).map((s) => ({
      uuid: s.uuid,
      characteristics: s.characteristics.map((c) => ({
        uuid: c.uuid,
        read: c.properties.read,
        write: c.properties.write || c.properties.writeWithoutResponse,
        notify: c.properties.notify || c.properties.indicate,
      })),
    })),
  read: async (deviceId, service, characteristic) => (await bluetooth.ble()).read(deviceId, uuid(service), uuid(characteristic)),
  write: async (deviceId, service, characteristic, value) =>
    (await bluetooth.ble()).write(deviceId, uuid(service), uuid(characteristic), value),
  async subscribe(deviceId, service, characteristic, onValue) {
    const ble = await bluetooth.ble();
    await ble.startNotifications(deviceId, uuid(service), uuid(characteristic), onValue);
    return () => void ble.stopNotifications(deviceId, uuid(service), uuid(characteristic));
  },
};
