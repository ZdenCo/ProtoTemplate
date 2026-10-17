// Public API for modules. Modules import from '@core', '@core/ui', '@core/recipes/<id>' and
// (types only) '@core/connectors/<id>'. Nothing else in core is public.
//
// This file must not statically import a connector or recipe folder: those can be pruned.

export { defineModule } from './modules/types';
export type { BlockComponent, ModuleDefinition, ModuleRoute, SettingDefinition, SettingsSchema } from './modules/types';

export { getConnector, useCapability, useConnector, useSubscription } from './connectors';
export type { ConnectorId, DownloadableModel, Unsubscribe } from './connectors';

export { useModule } from './modules/context';
export { useBlobStore, useModuleSettings, useModuleStorage, useNav, useRouteParams, useStoredState } from './modules/hooks';
export type { Nav } from './modules/hooks';
export { emit, on, useEmit, useEvent } from './modules/events';
export type { AppEvents } from './modules/events';
export { isFlagOn, useFlag } from './modules/flags';

export { createKeyValueStore } from './storage/kv';
export type { KeyValueStore } from './storage/kv';
export { toBlob } from './storage/blobs';
export type { BlobStore } from './storage/blobs';
export { persistStorage } from './storage/persist';

export { usePlatform } from './platform/platform';
export { config as appConfig } from './app/config';
export type { PlatformMode } from './platform/platform';

export {
  CapabilityUnavailableError,
  CoreError,
  DeviceUnsupportedError,
  PermissionDeniedError,
  TimeoutError,
  UserCancelledError,
  errorMessage,
} from './errors';

export { toast } from './ui/toast';
