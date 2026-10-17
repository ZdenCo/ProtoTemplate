/**
 * Every connector folder augments this interface with its API:
 *
 *   declare module '../types' { interface ConnectorRegistry { camera: CameraApi } }
 *
 * Deleting a connector folder therefore removes its id from `ConnectorId`, and any leftover
 * `useConnector('camera')` becomes a type error.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ConnectorRegistry {}

export type ConnectorId = keyof ConnectorRegistry & string;

/** A model the app downloads on demand (vlm, neuralTts). */
export interface DownloadableModel {
  id: string;
  name: string;
  description: string;
  sizeBytes: number;
}

/** Stops a subscription (sensor stream, BLE notifications, position watch …). */
export type Unsubscribe = () => void;

export interface ConnectorDefinition<Api extends object = object> {
  /** Same id as the ProtoShell capability (`camera`, `vlm`, …). */
  id: string;
  /** Native implementation through @protoshell/sdk. */
  real: Api;
  /** Deterministic browser/test implementation; reads fixtures from `window.__mocks[id]`. */
  mock: Api;
  /** Core depends on it; `npm run prune` never removes it. */
  core?: boolean;
}

export function defineConnector<Api extends object>(definition: ConnectorDefinition<Api>): ConnectorDefinition<Api> {
  return definition;
}
