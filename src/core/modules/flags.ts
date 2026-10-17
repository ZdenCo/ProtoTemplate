import { create } from 'zustand';

import { composition, storagePrefix } from '../app/config';
import { getParam } from '../platform/url';
import { createKeyValueStore } from '../storage/kv';

// Flag value = first defined of: URL (?ff=name:on,other:off) > device override (dev overlay)
// > deployed flags.json > default in app.composition.ts.

type FlagMap = Record<string, boolean>;

interface FlagsState {
  defaults: FlagMap;
  remote: FlagMap;
  overrides: FlagMap;
  url: FlagMap;
  values: FlagMap;
}

const merge = (s: Omit<FlagsState, 'values'>): FlagMap => ({ ...s.defaults, ...s.remote, ...s.overrides, ...s.url });

export const useFlags = create<FlagsState>(() => ({ defaults: {}, remote: {}, overrides: {}, url: {}, values: {} }));

const kv = () => createKeyValueStore(storagePrefix());
const OVERRIDES_KEY = 'flagOverrides';

function parseUrlFlags(): FlagMap {
  const raw = getParam('ff');
  if (!raw) return {};
  return Object.fromEntries(
    raw.split(',').map((entry) => {
      const [name = '', value = 'on'] = entry.split(':');
      return [name.trim(), !/^(off|0|false)$/i.test(value.trim())];
    }),
  );
}

async function fetchRemoteFlags(): Promise<FlagMap> {
  try {
    const response = await fetch('./flags.json', { cache: 'no-store' });
    if (!response.ok) return {};
    const json = (await response.json()) as { flags?: FlagMap };
    return json.flags ?? {};
  } catch {
    return {};
  }
}

export async function initFlags(): Promise<void> {
  const defaults = Object.fromEntries(Object.entries(composition.flags ?? {}).map(([name, def]) => [name, def.default]));
  const [remote, overrides] = await Promise.all([fetchRemoteFlags(), kv().getJSON<FlagMap>(OVERRIDES_KEY, {}).catch(() => ({}))]);
  const state = { defaults, remote, overrides, url: parseUrlFlags() };
  useFlags.setState({ ...state, values: merge(state) });
}

/** Device-local override (dev overlay). `null` removes it. Takes effect immediately for zones; module setup needs a reload. */
export async function setFlagOverride(name: string, value: boolean | null): Promise<void> {
  const overrides = { ...useFlags.getState().overrides };
  if (value === null) delete overrides[name];
  else overrides[name] = value;
  useFlags.setState((s) => ({ overrides, values: merge({ ...s, overrides }) }));
  await kv().setJSON(OVERRIDES_KEY, overrides);
}

export function isFlagOn(name: string | undefined): boolean {
  if (!name) return true;
  return useFlags.getState().values[name] === true;
}

export function useFlag(name: string): boolean {
  return useFlags((s) => s.values[name] === true);
}
