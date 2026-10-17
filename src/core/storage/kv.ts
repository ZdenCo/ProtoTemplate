import { getConnector } from '../connectors/registry';

/** Key/value store whose keys are all prefixed (per app and module). */
export interface KeyValueStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
  /** Keys without the prefix. */
  keys(): Promise<string[]>;
  getJSON<T>(key: string, fallback: T): Promise<T>;
  setJSON(key: string, value: unknown): Promise<void>;
  /** Removes every key of this store. */
  clear(): Promise<void>;
}

export function createKeyValueStore(prefix: string): KeyValueStore {
  const storage = () => getConnector('storage');
  const store: KeyValueStore = {
    get: (key) => storage().get(prefix + key),
    set: (key, value) => storage().set(prefix + key, value),
    remove: (key) => storage().remove(prefix + key),
    keys: async () => (await storage().keys(prefix)).map((k) => k.slice(prefix.length)),
    async getJSON<T>(key: string, fallback: T): Promise<T> {
      const raw = await store.get(key);
      if (raw === null) return fallback;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return fallback;
      }
    },
    setJSON: (key, value) => store.set(key, JSON.stringify(value)),
    async clear() {
      for (const key of await store.keys()) await store.remove(key);
    },
  };
  return store;
}
