import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

export const root = resolve(import.meta.dirname, '..');
export const connectorsDir = join(root, 'src/core/connectors');
export const recipesDir = join(root, 'src/core/recipes');
export const modulesDir = join(root, 'modules');

const dirs = (dir) => (existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name) : []);
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

export function connectors() {
  return dirs(connectorsDir)
    .filter((id) => existsSync(join(connectorsDir, id, 'meta.json')))
    .map((id) => ({
      ...readJson(join(connectorsDir, id, 'meta.json')),
      core: /core:\s*true/.test(readFileSync(join(connectorsDir, id, 'index.ts'), 'utf8')),
    }));
}

export function recipes() {
  return dirs(recipesDir)
    .filter((id) => existsSync(join(recipesDir, id, 'meta.json')))
    .map((id) => readJson(join(recipesDir, id, 'meta.json')));
}

export function moduleIds({ includeTemplate = false } = {}) {
  return dirs(modulesDir).filter((id) => includeTemplate || !id.startsWith('_'));
}

export function filesIn(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? filesIn(join(dir, e.name)) : [join(dir, e.name)]));
}

export function moduleInfo(id) {
  const source = readFileSync(join(modulesDir, id, 'index.ts'), 'utf8');
  const field = (name) => source.match(new RegExp(`${name}:\\s*'([^']*)'`))?.[1] ?? '';
  return { id, title: field('title'), description: field('description') };
}

export function shellCapabilities() {
  const path = join(root, 'vendor/protoshell.json');
  return existsSync(path) ? new Set(readJson(path).plugins.map((p) => p.capability)) : new Set();
}
