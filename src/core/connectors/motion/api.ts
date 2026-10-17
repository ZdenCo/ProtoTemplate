export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface AccelerationEvent {
  /** m/s² without gravity. */
  acceleration: Vector3;
  /** m/s²; flat, face up: z ≈ +9.81. */
  accelerationIncludingGravity: Vector3;
  /** deg/s. */
  rotationRate: { alpha: number; beta: number; gamma: number };
  /** ms between samples. */
  interval: number;
}

export interface OrientationEvent {
  /** Rotation around the screen normal, 0..360 counter-clockwise. */
  alpha: number;
  /** Front/back tilt, -180..180, 90 = upright. */
  beta: number;
  /** Left/right tilt, -90..90. */
  gamma: number;
  /** Compass heading of the top edge, clockwise from north; null when not magnetically referenced. */
  heading: number | null;
}

export interface MotionApi {
  /** ~50–60 Hz stream until unsubscribed. */
  watchAcceleration(onEvent: (event: AccelerationEvent) => void): Promise<() => void>;
  watchOrientation(onEvent: (event: OrientationEvent) => void): Promise<() => void>;
}
