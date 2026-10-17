import { camera } from '@protoshell/sdk';

import type { CameraApi, Photo, PhotoOptions } from './api';

const toPhoto = (result: camera.MediaResult): Photo => ({ webPath: result.webPath ?? result.uri ?? '', uri: result.uri ?? result.webPath ?? '' });

const options = ({ quality, maxSize, camera: direction }: PhotoOptions) => ({
  quality,
  targetWidth: maxSize,
  targetHeight: maxSize,
  cameraDirection: direction === 'front' ? camera.CameraDirection.Front : camera.CameraDirection.Rear,
});

export const realCamera: CameraApi = {
  takePhoto: async (opts = {}) => toPhoto(await camera.takePhoto(options(opts))),
  pickPhotos: async ({ multiple, ...opts } = {}) =>
    (await camera.chooseFromGallery({ ...options(opts), allowMultipleSelection: multiple })).map(toPhoto),
};
