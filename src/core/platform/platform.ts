import { getCapabilities, getShellInfo, isInShell, navigation } from '@protoshell/sdk';
import type { ShellInfo } from '@protoshell/sdk';
import { create } from 'zustand';

import { getParam, hasParam } from './url';

/**
 * `shell`: running inside ProtoShell, connectors call native plugins.
 * `mock`: normal browser, tests, or `?mock=1`; connectors use deterministic mocks.
 */
export type PlatformMode = 'shell' | 'mock';

export interface PlatformState {
  ready: boolean;
  mode: PlatformMode;
  info: ShellInfo | null;
  /** Capability id -> usable right now. In mock mode every registered connector is available unless disabled. */
  capabilities: Record<string, boolean>;
}

export const usePlatform = create<PlatformState>(() => ({
  ready: false,
  mode: 'mock',
  info: null,
  capabilities: {},
}));

declare global {
  interface Window {
    /** Mock fixtures and switches, set by tests or the dev overlay before the app boots. */
    __mocks?: MockConfig;
  }
}

export interface MockConfig {
  /** Capability ids to report as unavailable in mock mode (test fallbacks). */
  unavailable?: string[];
  /** Per-connector fixture values, see each connector's mock.ts. */
  [connector: string]: unknown;
}

export async function bootPlatform(registeredConnectors: string[]): Promise<void> {
  const forceMock = hasParam('mock');
  const mode: PlatformMode = isInShell() && !forceMock ? 'shell' : 'mock';

  let info: ShellInfo | null = null;
  let capabilities: Record<string, boolean>;

  if (mode === 'shell') {
    info = await getShellInfo().catch(() => null);
    capabilities = await getCapabilities().catch(() => ({}));
  } else {
    const disabled = new Set([...(window.__mocks?.unavailable ?? []), ...(getParam('unavailable')?.split(',') ?? [])]);
    capabilities = Object.fromEntries(registeredConnectors.map((id) => [id, !disabled.has(id)]));
  }

  usePlatform.setState({ ready: true, mode, info, capabilities });
}

export function isCapabilityAvailable(id: string): boolean {
  return usePlatform.getState().capabilities[id] === true;
}

/** Shell navigation; in a browser `home` is a no-op and `reload` reloads the page. */
export const shell = {
  home: () => navigation.home(),
  reload: () => navigation.reload(),
  showMenu: () => navigation.showMenu(),
};
