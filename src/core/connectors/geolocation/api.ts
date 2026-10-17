export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface GeoPosition extends GeoPoint {
  /** Metres. */
  accuracy: number;
  altitude: number | null;
  /** m/s while moving. */
  speed: number | null;
  /** Degrees clockwise from north while moving. */
  heading: number | null;
  timestamp: number;
}

export interface PositionOptions {
  /** GPS instead of network location. Default true. */
  highAccuracy?: boolean;
  /** Default 15000. */
  timeoutMs?: number;
}

export interface GeolocationApi {
  /** Current position; asks for "while using the app" permission on first use. */
  getPosition(options?: PositionOptions): Promise<GeoPosition>;
  /** Streams positions (foreground only) until unsubscribed. */
  watchPosition(onPosition: (position: GeoPosition) => void, onError?: (error: Error) => void, options?: PositionOptions): Promise<() => void>;
  /** Great-circle distance in metres. */
  distance(a: GeoPoint, b: GeoPoint): number;
}
