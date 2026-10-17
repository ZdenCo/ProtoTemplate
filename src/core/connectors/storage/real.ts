import { storage } from '@protoshell/sdk';

import type { StorageApi } from './api';

export const realStorage: StorageApi = {
  get: (key) => storage.get(key),
  set: (key, value) => storage.set(key, value),
  remove: (key) => storage.remove(key),
  keys: (prefix) => storage.keys(prefix),
};
