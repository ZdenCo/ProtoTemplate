import { qr } from '@protoshell/sdk';

import type { QrApi } from './api';

export const realQr: QrApi = {
  scan: ({ instructions, anyFormat, camera } = {}) =>
    qr.scanWithFormat({
      instructions,
      hint: anyFormat ? qr.CapacitorBarcodeScannerTypeHintALLOption.ALL : qr.CapacitorBarcodeScannerTypeHint.QR_CODE,
      cameraDirection: camera === 'front' ? 2 : 1,
    }),
};
