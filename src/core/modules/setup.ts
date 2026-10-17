import { usePlatform } from '../platform/platform';
import { useFlags } from './flags';
import { allModules } from './registry';
import { moduleStatus } from './status';

/** Runs `setup` of every enabled module once at boot. */
export function runModuleSetups(): void {
  const flags = useFlags.getState().values;
  const capabilities = usePlatform.getState().capabilities;
  for (const module of allModules()) {
    if (!module.setup || !moduleStatus(module.id, flags, capabilities).enabled) continue;
    try {
      module.setup({ module });
    } catch (error) {
      console.error(`[modules] setup of "${module.id}" failed`, error);
    }
  }
}
