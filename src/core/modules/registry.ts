import type { ModuleDefinition } from './types';

// Every modules/<id>/index.ts is a module. Folders starting with "_" (the template) are ignored.
const loaded = import.meta.glob<{ default: ModuleDefinition }>(['/modules/*/index.ts', '!/modules/_*/index.ts'], { eager: true });

const modules = new Map<string, ModuleDefinition>();
for (const [path, { default: definition }] of Object.entries(loaded)) {
  const folder = path.split('/').at(-2);
  if (definition.id !== folder) console.error(`[modules] ${path}: id "${definition.id}" must equal the folder name "${folder}"`);
  modules.set(definition.id, definition);
}

export function getModule(id: string): ModuleDefinition | undefined {
  return modules.get(id);
}

export function allModules(): ModuleDefinition[] {
  return [...modules.values()];
}

/** Module id -> folder path, for validation. */
export function modulePaths(): Record<string, string> {
  return Object.fromEntries(Object.entries(loaded).map(([path, { default: d }]) => [d.id, path]));
}
