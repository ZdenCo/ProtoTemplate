import { useMemo } from 'react';

import { composition } from '../app/config';
import { usePlatform } from '../platform/platform';
import type { Placement } from './composition-types';
import { useFlags } from './flags';
import { getModule } from './registry';

export interface ModuleStatus {
  enabled: boolean;
  /** Why it is disabled. */
  reason?: string;
}

type Flags = Record<string, boolean>;
type Capabilities = Record<string, boolean>;

/** Enabled = registered, module flag on, required capabilities available, required modules enabled. */
export function moduleStatus(id: string, flags: Flags, capabilities: Capabilities, visiting = new Set<string>()): ModuleStatus {
  const module = getModule(id);
  if (!module) return { enabled: false, reason: `module "${id}" not found` };
  const flag = composition.modules?.[id]?.flag;
  if (flag && flags[flag] !== true) return { enabled: false, reason: `flag "${flag}" is off` };
  const missing = (module.requires?.capabilities ?? []).filter((c) => capabilities[c] !== true);
  if (missing.length) return { enabled: false, reason: `missing capability: ${missing.join(', ')}` };
  if (visiting.has(id)) return { enabled: false, reason: 'dependency cycle' };
  visiting.add(id);
  for (const dependency of module.requires?.modules ?? []) {
    const status = moduleStatus(dependency, flags, capabilities, visiting);
    if (!status.enabled) return { enabled: false, reason: `requires module "${dependency}" (${status.reason})` };
  }
  visiting.delete(id);
  return { enabled: true };
}

export function useModuleStatus(id: string): ModuleStatus {
  const flags = useFlags((s) => s.values);
  const capabilities = usePlatform((s) => s.capabilities);
  return useMemo(() => moduleStatus(id, flags, capabilities), [id, flags, capabilities]);
}

export function placementEnabled(placement: Placement, flags: Flags, capabilities: Capabilities): boolean {
  if (placement.flag && flags[placement.flag] !== true) return false;
  return moduleStatus(placement.module, flags, capabilities).enabled;
}

/** Enabled placements for a zone, sorted by `order`. */
export function usePlacements(zone: string): Placement[] {
  const flags = useFlags((s) => s.values);
  const capabilities = usePlatform((s) => s.capabilities);
  return useMemo(
    () =>
      composition.placements
        .filter((p) => p.zone === zone && placementEnabled(p, flags, capabilities))
        .sort((a, b) => (a.order ?? 100) - (b.order ?? 100)),
    [zone, flags, capabilities],
  );
}
