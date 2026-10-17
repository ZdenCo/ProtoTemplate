import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { composition, config, storagePrefix } from '../app/config';
import { createBlobStore } from '../storage/blobs';
import type { BlobStore } from '../storage/blobs';
import { createKeyValueStore } from '../storage/kv';
import type { KeyValueStore } from '../storage/kv';
import { useModule, useModuleId } from './context';
import type { SettingsSchema, SettingsValues } from './types';

/** Key/value storage of the current module (keys auto-prefixed '<appId>.<moduleId>.'). */
export function useModuleStorage(): KeyValueStore {
  const moduleId = useModuleId();
  return useMemo(() => createKeyValueStore(storagePrefix(moduleId)), [moduleId]);
}

/** IndexedDB blob storage of the current module (photos, audio, large lists). */
export function useBlobStore(): BlobStore {
  const moduleId = useModuleId();
  return useMemo(() => createBlobStore(config.id, moduleId), [moduleId]);
}

// Keeps every useStoredState instance with the same key in sync.
const storedListeners = new Map<string, Set<(value: unknown) => void>>();

/**
 * useState that persists (JSON) in the module's storage. `loaded` is false until the stored value
 * has been read; render a placeholder until then if the difference matters.
 */
export function useStoredState<T>(key: string, initial: T): [T, (next: T | ((previous: T) => T)) => void, { loaded: boolean }] {
  const moduleId = useModuleId();
  const fullKey = storagePrefix(moduleId) + key;
  const store = useMemo(() => createKeyValueStore(storagePrefix(moduleId)), [moduleId]);
  const [state, setState] = useState<{ value: T; loaded: boolean }>({ value: initial, loaded: false });

  useEffect(() => {
    let active = true;
    void store.getJSON<T>(key, initial).then((value) => active && setState({ value, loaded: true }));
    const listeners = storedListeners.get(fullKey) ?? new Set();
    const listener = (value: unknown) => setState({ value: value as T, loaded: true });
    listeners.add(listener);
    storedListeners.set(fullKey, listeners);
    return () => {
      active = false;
      listeners.delete(listener);
    };
    // `initial` is only the first-render fallback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, key, fullKey]);

  const set = useCallback(
    (next: T | ((previous: T) => T)) => {
      setState((previous) => {
        const value = typeof next === 'function' ? (next as (p: T) => T)(previous.value) : next;
        void store.setJSON(key, value);
        for (const listener of storedListeners.get(fullKey) ?? []) queueMicrotask(() => listener(value));
        return { value, loaded: true };
      });
    },
    [store, key, fullKey],
  );

  return [state.value, set, { loaded: state.loaded }];
}

/** Current settings of the module (defaults from `settings` in defineModule, overridden by the user). */
export function useModuleSettings<S extends SettingsSchema = SettingsSchema>(): [SettingsValues<S>, (patch: Partial<SettingsValues<S>>) => void] {
  const module = useModule();
  const defaults = useMemo(
    () => Object.fromEntries(Object.entries(module.settings ?? {}).map(([key, def]) => [key, def.default])) as SettingsValues<S>,
    [module],
  );
  const [stored, setStored] = useStoredState<Partial<SettingsValues<S>>>('__settings', {});
  const values = useMemo(() => ({ ...defaults, ...stored }), [defaults, stored]);
  const update = useCallback((patch: Partial<SettingsValues<S>>) => setStored((previous) => ({ ...previous, ...patch })), [setStored]);
  return [values, update];
}

export interface Nav {
  /** Go to a composition page by key ('home', 'tools'). */
  toPage(page: string): void;
  /** Go to one of the current module's routes, e.g. toRoute('history') or toRoute('item/42'). */
  toRoute(path: string): void;
  back(): void;
}

export function useNav(): Nav {
  const navigate = useNavigate();
  const moduleId = useModuleId();
  return useMemo(
    () => ({
      toPage: (page) => {
        const target = composition.pages[page];
        if (!target) throw new Error(`Unknown page "${page}"`);
        void navigate(target.path);
      },
      toRoute: (path) => void navigate(`/m/${moduleId}/${path.replace(/^\//, '')}`),
      back: () => void navigate(-1),
    }),
    [navigate, moduleId],
  );
}

/** Params of a module route (e.g. { id } for 'item/:id'). */
export function useRouteParams<T extends Record<string, string>>(): Partial<T> {
  return useParams() as Partial<T>;
}
