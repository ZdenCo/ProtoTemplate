// Every connector call rejects with one of these, so modules can branch on `instanceof`
// instead of parsing native error messages.

export class CoreError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = new.target.name;
  }
}

/** The capability is not in this shell build, not registered natively, or switched off in mock mode. */
export class CapabilityUnavailableError extends CoreError {
  constructor(readonly capability: string, reason = 'not available here') {
    super(`Capability "${capability}" is unavailable: ${reason}`);
  }
}

/** The user (or the OS) denied a permission: camera, microphone, location, notifications, Bluetooth. */
export class PermissionDeniedError extends CoreError {}

/** The user closed a native UI without finishing it: scanner, camera, photo picker. Usually not an error to show. */
export class UserCancelledError extends CoreError {}

export class TimeoutError extends CoreError {}

/** The device can't do it (no on-device LLM, no speech service, not enough memory). */
export class DeviceUnsupportedError extends CoreError {}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Maps a raw plugin / bridge error onto the CoreError classes above. */
export function normalizeError(error: unknown, capability?: string): CoreError {
  if (error instanceof CoreError) return error;
  const message = errorMessage(error);
  const name = error instanceof Error ? error.name : '';
  if (name === 'CapabilityUnavailableError') return new CapabilityUnavailableError(capability ?? 'unknown', message);
  if (/cancel(l)?ed|user cancel|dismiss/i.test(message)) return new UserCancelledError(message, error);
  if (/permission|denied|not authori[sz]ed|unauthori[sz]ed/i.test(message)) return new PermissionDeniedError(message, error);
  if (/timed? ?out/i.test(message)) return new TimeoutError(message, error);
  if (/not supported|unsupported|unavailable on this device/i.test(message)) return new DeviceUnsupportedError(message, error);
  return new CoreError(message, error);
}
