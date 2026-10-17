import type { ComponentType } from 'react';

export interface PageDefinition {
  /** Router path, e.g. '/' or '/tools'. */
  path: string;
  title: string;
  /** Lazy import of a zones-only page component from src/pages. */
  page: () => Promise<{ default: ComponentType }>;
  /** Show in the bottom tab bar. */
  tab?: { label: string; icon: string };
}

export interface Placement {
  /** '<page>.<zone>', must match a <Zone name> in a page file. */
  zone: string;
  module: string;
  /** Block name from the module's `blocks`. */
  block: string;
  /** Lower comes first. Default 100. */
  order?: number;
  /** Extra flag for just this placement (on top of the module flag). */
  flag?: string;
  /** Props passed to the block component. */
  props?: Record<string, unknown>;
}

export interface FlagDefinition {
  default: boolean;
  description?: string;
}

export interface ModuleConfig {
  /** Flag that switches the whole module (placements, routes, setup). */
  flag?: string;
}

export interface Composition {
  pages: Record<string, PageDefinition>;
  /** Per-module config; modules without an entry are always on (if their requirements are met). */
  modules?: Record<string, ModuleConfig>;
  placements: Placement[];
  flags?: Record<string, FlagDefinition>;
}

export function defineComposition<C extends Composition>(composition: C): C {
  return composition;
}
