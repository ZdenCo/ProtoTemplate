import { defineModule } from '@core';

declare module '@core/modules/events' {
  interface AppEvents {
    'example-scan:scanned': { text: string; format: string };
  }
}

export default defineModule({
  id: 'example-scan',
  title: 'Scanner',
  description: 'Scan QR codes and barcodes, keep a history.',
  icon: '🔳',
  requires: { capabilities: ['qr', 'haptics'] },
  blocks: {
    card: () => import('./blocks/ScanCard'),
    history: () => import('./blocks/ScanHistory'),
  },
  routes: [{ path: 'history', block: 'history', title: 'Scan history' }],
  settings: {
    anyFormat: { type: 'boolean', label: 'Accept all barcode formats', default: true },
  },
});
