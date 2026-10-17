import type { ComponentType } from 'react';

import type { ConnectorId } from '../connectors/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BlockComponent = ComponentType<any>;
export type BlockLoader = () => Promise<{ default: BlockComponent }>;

export type SettingDefinition =
  | { type: 'string'; label: string; default: string }
  | { type: 'number'; label: string; default: number; min?: number; max?: number; step?: number }
  | { type: 'boolean'; label: string; default: boolean }
  | { type: 'select'; label: string; default: string; options: { value: string; label: string }[] };

export type SettingsSchema = Record<string, SettingDefinition>;
export type SettingsValues<S extends SettingsSchema> = { [K in keyof S]: S[K]['default'] };

export interface ModuleRoute {
  /** Relative to /m/<moduleId>/, e.g. 'history' or 'item/:id'. */
  path: string;
  /** Name of a block in `blocks`. Route params arrive through useRouteParams(). */
  block: string;
  /** Header title. */
  title: string;
}

export interface ModuleSetupContext {
  module: ModuleDefinition;
}

export interface ModuleDefinition<S extends SettingsSchema = SettingsSchema> {
  /** Must equal the folder name in modules/. kebab-case. */
  id: string;
  title: string;
  description?: string;
  /** Emoji or short text. */
  icon?: string;
  /** The module renders only when all of these are available / enabled. */
  requires?: {
    capabilities?: ConnectorId[];
    modules?: string[];
  };
  /** Capabilities used when present (check with useCapability). Informational, used by prune. */
  optional?: {
    capabilities?: ConnectorId[];
  };
  /** Named components that the composition places into page zones. Always lazy imports. */
  blocks: Record<string, BlockLoader>;
  /** Extra full screens under /m/<moduleId>/<path>, e.g. a detail view. */
  routes?: ModuleRoute[];
  /** User-adjustable settings (shown in the dev overlay; read with useModuleSettings). */
  settings?: S;
  /** Runs once at boot when the module is enabled (event subscriptions, background work). May return a cleanup. */
  setup?: (ctx: ModuleSetupContext) => void | (() => void);
}

export function defineModule<S extends SettingsSchema>(definition: ModuleDefinition<S>): ModuleDefinition<S> {
  return definition;
}
