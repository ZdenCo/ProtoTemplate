export interface ScanOptions {
  /** Text shown on the scanner screen. */
  instructions?: string;
  /** Accept every barcode format (EAN, Code 128, DataMatrix, …), not only QR codes. */
  anyFormat?: boolean;
  /** Default `back`. */
  camera?: 'back' | 'front';
}

export interface ScanResult {
  text: string;
  /** Barcode format name, e.g. `QR_CODE`, `EAN_13`. */
  format: string;
}

export interface QrApi {
  /** Opens the native full-screen scanner. Rejects with UserCancelledError when closed. */
  scan(options?: ScanOptions): Promise<ScanResult>;
}
