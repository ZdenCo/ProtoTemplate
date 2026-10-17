import { useEffect, useRef } from 'react';

import { usePlatform } from '../platform/platform';
import { getConnector } from './registry';
import type { ConnectorId, ConnectorRegistry, Unsubscribe } from './types';

/** Connector API for use in components. Stable across renders. */
export function useConnector<Id extends ConnectorId>(id: Id): ConnectorRegistry[Id] {
  return getConnector(id);
}

/** `true` when the capability can be used right now (reactive). */
export function useCapability(id: ConnectorId): boolean {
  return usePlatform((state) => state.capabilities[id] === true);
}

/**
 * Starts a subscription while the component is mounted (and `enabled`), and stops it on unmount
 * or when `deps` change. Handles subscriptions that resolve after the component already unmounted.
 *
 *   useSubscription(() => motion.watchOrientation(setOrientation), [])
 */
export function useSubscription(
  subscribe: () => Promise<Unsubscribe> | Unsubscribe,
  deps: React.DependencyList,
  options: { enabled?: boolean; onError?: (error: unknown) => void } = {},
): void {
  const { enabled = true } = options;
  const onError = useRef(options.onError);
  useEffect(() => {
    onError.current = options.onError;
  });

  useEffect(() => {
    if (!enabled) return;
    let stop: Unsubscribe | undefined;
    let disposed = false;
    Promise.resolve()
      .then(subscribe)
      .then((unsubscribe) => {
        if (disposed) unsubscribe();
        else stop = unsubscribe;
      })
      .catch((error: unknown) => onError.current?.(error));
    return () => {
      disposed = true;
      stop?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);
}
