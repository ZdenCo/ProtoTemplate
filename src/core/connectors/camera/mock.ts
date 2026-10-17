import { delay, fixture, maybeFail, placeholderImage } from '../mock-utils';
import type { CameraApi, Photo } from './api';

// Fixtures: window.__mocks.camera = { image: '<data or http URL>', fail: 'cancel' | 'message' }
const photo = (label: string, hue: number): Photo => {
  const src = fixture('camera', 'image', placeholderImage(label, hue));
  return { webPath: src, uri: src };
};

export const mockCamera: CameraApi = {
  async takePhoto() {
    await delay(500);
    maybeFail('camera');
    return photo('Mock photo', 210);
  },
  async pickPhotos({ multiple } = {}) {
    await delay(500);
    maybeFail('camera');
    return multiple ? [photo('Mock photo 1', 210), photo('Mock photo 2', 30)] : [photo('Mock photo', 210)];
  },
};
