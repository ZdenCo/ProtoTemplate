// Core tests use only the `storage` connector: every other connector can be pruned.
import { describe, expect, it } from 'vitest';

import { connectorIds, getConnector } from './connectors';
import { CapabilityUnavailableError, PermissionDeniedError, UserCancelledError, normalizeError } from './errors';
import { emit, on } from './modules/events';
import { initFlags, isFlagOn, setFlagOverride } from './modules/flags';
import { moduleStatus } from './modules/status';
import { bootPlatform, usePlatform } from './platform/platform';
import { createKeyValueStore } from './storage/kv';
import { setMocks } from './testing';

describe('errors', () => {
  it('maps native messages to typed errors', () => {
    expect(normalizeError(new Error('User cancelled photos app'))).toBeInstanceOf(UserCancelledError);
    expect(normalizeError(new Error('Permission denied'))).toBeInstanceOf(PermissionDeniedError);
  });
});

describe('platform and connectors', () => {
  it('boots in mock mode outside the shell with every connector available', async () => {
    await bootPlatform(connectorIds());
    expect(usePlatform.getState().mode).toBe('mock');
    expect(usePlatform.getState().capabilities.storage).toBe(true);
  });

  it('rejects calls to a capability switched off', async () => {
    setMocks({ unavailable: ['storage'] });
    await bootPlatform(connectorIds());
    expect(() => getConnector('storage').get('x')).toThrow(CapabilityUnavailableError);
  });
});

describe('storage', () => {
  it('prefixes keys', async () => {
    await bootPlatform(connectorIds());
    const store = createKeyValueStore('app.mod.');
    await store.setJSON('a', { x: 1 });
    expect(await getConnector('storage').keys('app.mod.')).toEqual(['app.mod.a']);
    expect(await store.keys()).toEqual(['a']);
    expect(await store.getJSON('a', null)).toEqual({ x: 1 });
    await store.clear();
    expect(await store.keys()).toEqual([]);
  });
});

describe('flags, modules, events', () => {
  it('applies and resets device overrides', async () => {
    await bootPlatform(connectorIds());
    await initFlags();
    await setFlagOverride('__testFlag', true);
    expect(isFlagOn('__testFlag')).toBe(true);
    await setFlagOverride('__testFlag', null);
    expect(isFlagOn('__testFlag')).toBe(false);
    expect(isFlagOn(undefined)).toBe(true);
  });

  it('reports unknown modules as disabled', () => {
    expect(moduleStatus('__missing', {}, {}).reason).toMatch(/not found/);
  });

  it('delivers events until unsubscribed', () => {
    const seen: unknown[] = [];
    const off = on('__test' as never, (p) => seen.push(p));
    emit('__test' as never, 1 as never);
    off();
    emit('__test' as never, 2 as never);
    expect(seen).toEqual([1]);
  });
});
