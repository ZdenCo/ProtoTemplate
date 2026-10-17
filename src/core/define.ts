// Leaf module (no imports from the rest of core) so app.config.ts / app.composition.ts can
// import it without creating an import cycle.
export { defineComposition } from './modules/composition-types';
export type { Composition, FlagDefinition, ModuleConfig, PageDefinition, Placement } from './modules/composition-types';

export interface AppConfig {
  /** Unique, stable id: prefixes every storage key. Never change it after release (data would be orphaned). */
  id: string;
  name: string;
  version: string;
  /** Browser/OS chrome colour. */
  themeColor?: string;
}

export function defineAppConfig(config: AppConfig): AppConfig {
  return config;
}
