import type { StorageApi } from './api';

// Browser localStorage under "mock:" so mock data survives reloads; in-memory when unavailable.
const PREFIX = 'mock:';
const memory = new Map<string, string>();

function local(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export const mockStorage: StorageApi = {
  async get(key) {
    const store = local();
    return store ? store.getItem(PREFIX + key) : (memory.get(key) ?? null);
  },
  async set(key, value) {
    const store = local();
    if (store) store.setItem(PREFIX + key, value);
    else memory.set(key, value);
  },
  async remove(key) {
    const store = local();
    if (store) store.removeItem(PREFIX + key);
    else memory.delete(key);
  },
  async keys(prefix = '') {
    const store = local();
    const all = store
      ? Array.from({ length: store.length }, (_, i) => store.key(i) ?? '').filter((k) => k.startsWith(PREFIX)).map((k) => k.slice(PREFIX.length))
      : [...memory.keys()];
    return all.filter((k) => k.startsWith(prefix));
  },
};
