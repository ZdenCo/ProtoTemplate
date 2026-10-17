import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

import type { ModuleDefinition } from './types';

const ModuleContext = createContext<ModuleDefinition | null>(null);

export function ModuleProvider({ module, children }: { module: ModuleDefinition; children: ReactNode }) {
  return <ModuleContext.Provider value={module}>{children}</ModuleContext.Provider>;
}

/** The module whose block is rendering. Throws outside a module block. */
export function useModule(): ModuleDefinition {
  const module = useContext(ModuleContext);
  if (!module) throw new Error('useModule() must be used inside a module block');
  return module;
}

/** Module id, or '__app' outside modules (core screens). */
export function useModuleId(): string {
  return useContext(ModuleContext)?.id ?? '__app';
}
