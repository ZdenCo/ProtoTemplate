// Binary/large data (photos, recordings, long histories) in IndexedDB, namespaced per module.
// Falls back to memory when IndexedDB is missing (jsdom, some private modes).

export interface BlobStore {
  put(key: string, value: Blob): Promise<void>;
  get(key: string): Promise<Blob | undefined>;
  /** Object URL for <img src>; revoke with URL.revokeObjectURL when done. */
  url(key: string): Promise<string | undefined>;
  remove(key: string): Promise<void>;
  keys(): Promise<string[]>;
}

const STORE = 'blobs';
const memory = new Map<string, Blob>();
const databases = new Map<string, Promise<IDBDatabase | null>>();

function open(name: string): Promise<IDBDatabase | null> {
  let db = databases.get(name);
  if (!db) {
    db = new Promise((resolve) => {
      if (typeof indexedDB === 'undefined') return resolve(null);
      const request = indexedDB.open(name, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    });
    databases.set(name, db);
  }
  return db;
}

function run<T>(db: IDBDatabase, mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest): Promise<T> {
  return new Promise((resolve, reject) => {
    const request = action(db.transaction(STORE, mode).objectStore(STORE));
    request.onsuccess = () => resolve(request.result as T);
    request.onerror = () => reject(request.error);
  });
}

/** `database` is the app id, `namespace` the module id. */
export function createBlobStore(database: string, namespace: string): BlobStore {
  const prefix = `${namespace}/`;
  const store: BlobStore = {
    async put(key, value) {
      const db = await open(database);
      if (!db) return void memory.set(prefix + key, value);
      await run(db, 'readwrite', (s) => s.put(value, prefix + key));
    },
    async get(key) {
      const db = await open(database);
      if (!db) return memory.get(prefix + key);
      return run<Blob | undefined>(db, 'readonly', (s) => s.get(prefix + key));
    },
    async url(key) {
      const blob = await store.get(key);
      return blob ? URL.createObjectURL(blob) : undefined;
    },
    async remove(key) {
      const db = await open(database);
      if (!db) return void memory.delete(prefix + key);
      await run(db, 'readwrite', (s) => s.delete(prefix + key));
    },
    async keys() {
      const db = await open(database);
      const all = db ? (await run<IDBValidKey[]>(db, 'readonly', (s) => s.getAllKeys())).map(String) : [...memory.keys()];
      return all.filter((k) => k.startsWith(prefix)).map((k) => k.slice(prefix.length));
    },
  };
  return store;
}

/** Fetches a photo (webPath / data URL) into a Blob for storing. */
export async function toBlob(src: string): Promise<Blob> {
  return (await fetch(src)).blob();
}
