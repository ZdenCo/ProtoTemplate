import { CapabilityUnavailableError, normalizeError } from '../errors';
import { isCapabilityAvailable, usePlatform } from '../platform/platform';
import type { ConnectorDefinition, ConnectorId, ConnectorRegistry } from './types';

// Every folder with an index.ts is a connector. Delete the folder to remove it.
const loaded = import.meta.glob<{ default: ConnectorDefinition }>('./*/index.ts', { eager: true });

const definitions = new Map<string, ConnectorDefinition>(
  Object.values(loaded).map(({ default: definition }) => [definition.id, definition]),
);

export function connectorIds(): string[] {
  return [...definitions.keys()];
}

export function hasConnector(id: string): boolean {
  return definitions.has(id);
}

export function getConnectorDefinition(id: string): ConnectorDefinition | undefined {
  return definitions.get(id);
}

const wrapped = new Map<string, object>();

function wrap<Api extends object>(id: string, pick: () => Api): Api {
  // Resolved per call, so switching mode at boot (or in tests) needs no re-wrap.
  return new Proxy({} as Api, {
    get(_target, key) {
      const value = (pick() as Record<PropertyKey, unknown>)[key];
      if (typeof value !== 'function') return value;
      return (...args: unknown[]) => {
        if (!isCapabilityAvailable(id)) {
          const mode = usePlatform.getState().mode;
          throw new CapabilityUnavailableError(id, mode === 'shell' ? 'not in this shell build' : 'disabled in mock mode');
        }
        try {
          const result = (value as (...a: unknown[]) => unknown)(...args);
          return result instanceof Promise ? result.catch((error: unknown) => Promise.reject(normalizeError(error, id))) : result;
        } catch (error) {
          throw normalizeError(error, id);
        }
      };
    },
  });
}

/**
 * Typed connector API, real inside ProtoShell and mocked elsewhere. Every call checks that the
 * capability is available and rejects with a CoreError subclass (see core/errors.ts).
 */
export function getConnector<Id extends ConnectorId>(id: Id): ConnectorRegistry[Id] {
  let api = wrapped.get(id);
  if (!api) {
    const definition = definitions.get(id);
    if (!definition) throw new Error(`Unknown connector "${id}"`);
    api = wrap(id, () => (usePlatform.getState().mode === 'shell' ? definition.real : definition.mock));
    wrapped.set(id, api);
  }
  return api as ConnectorRegistry[Id];
}
