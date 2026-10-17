import { delay, fixture, maybeFail } from '../mock-utils';
import type { QrApi } from './api';

// Fixtures: window.__mocks.qr = { text: '…', format: 'QR_CODE', fail: 'cancel' | 'message' }
export const mockQr: QrApi = {
  async scan() {
    await delay(600);
    maybeFail('qr');
    return {
      text: fixture('qr', 'text', 'https://example.com/mock-qr'),
      format: fixture('qr', 'format', 'QR_CODE'),
    };
  },
};
