export interface BleDevice {
  deviceId: string;
  name?: string;
}

export interface BleScanResult {
  device: BleDevice;
  rssi?: number;
  localName?: string;
}

export interface BleFilter {
  /** Service UUIDs (full 128-bit or 16-bit like '180d'). */
  services?: string[];
  namePrefix?: string;
}

export interface BleCharacteristicInfo {
  uuid: string;
  read: boolean;
  write: boolean;
  notify: boolean;
}

export interface BleServiceInfo {
  uuid: string;
  characteristics: BleCharacteristicInfo[];
}

export interface BluetoothApi {
  /** Scans until unsubscribed. Results repeat as RSSI changes. */
  scan(filter: BleFilter, onResult: (result: BleScanResult) => void): Promise<() => void>;
  /** Native device picker. Rejects with UserCancelledError when closed. */
  requestDevice(filter?: BleFilter): Promise<BleDevice>;
  connect(deviceId: string, onDisconnect?: () => void): Promise<void>;
  disconnect(deviceId: string): Promise<void>;
  services(deviceId: string): Promise<BleServiceInfo[]>;
  read(deviceId: string, service: string, characteristic: string): Promise<DataView>;
  write(deviceId: string, service: string, characteristic: string, value: DataView): Promise<void>;
  /** Subscribes to notifications until unsubscribed. */
  subscribe(deviceId: string, service: string, characteristic: string, onValue: (value: DataView) => void): Promise<() => void>;
}

/** Standard 16-bit UUIDs expanded to 128-bit. */
export const BLE_UUIDS = {
  heartRateService: '0000180d-0000-1000-8000-00805f9b34fb',
  heartRateMeasurement: '00002a37-0000-1000-8000-00805f9b34fb',
  batteryService: '0000180f-0000-1000-8000-00805f9b34fb',
  batteryLevel: '00002a19-0000-1000-8000-00805f9b34fb',
} as const;
