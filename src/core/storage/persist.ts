import { createJSONStorage } from 'zustand/middleware';
import type { PersistStorage } from 'zustand/middleware';

import { storagePrefix } from '../app/config';
import { createKeyValueStore } from './kv';

/**
 * Storage for zustand's `persist` middleware, namespaced to a module:
 *
 *   export const useHistory = create(persist(() => ({ items: [] }), { name: 'history', storage: persistStorage('scan') }))
 */
export function persistStorage<S>(moduleId: string): PersistStorage<S> | undefined {
  const kv = createKeyValueStore(storagePrefix(moduleId));
  return createJSONStorage<S>(() => ({
    getItem: (name) => kv.get(name),
    setItem: (name, value) => kv.set(name, value),
    removeItem: (name) => kv.remove(name),
  }));
}
