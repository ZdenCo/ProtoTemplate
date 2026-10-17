export interface Photo {
  /** Use as <img src>. */
  webPath: string;
  /** Native file URL; pass straight to vlm (`images: [photo.uri]`), no base64 round trip. Equals webPath in mock mode. */
  uri: string;
}

export interface PhotoOptions {
  /** 1–100, default 85. */
  quality?: number;
  /** Downscale so neither side exceeds this (keep ≤ 1280 for vlm). */
  maxSize?: number;
  camera?: 'back' | 'front';
}

export interface CameraApi {
  /** Opens the camera. Rejects with UserCancelledError when closed. */
  takePhoto(options?: PhotoOptions): Promise<Photo>;
  /** Opens the photo picker. `multiple` allows several photos. */
  pickPhotos(options?: PhotoOptions & { multiple?: boolean }): Promise<Photo[]>;
}
