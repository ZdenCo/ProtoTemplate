// `npm run validate`: static checks of the module system. Run after every change to modules/,
// src/pages or src/app.composition.ts.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { composition } from '../app/config';
import { connectorIds } from '../connectors/registry';
import { allModules, getModule, modulePaths } from '../modules/registry';

const root = resolve(__dirname, '../../..');
const shellManifest = JSON.parse(readFileSync(join(root, 'vendor/protoshell.json'), 'utf8')) as { plugins: { capability: string }[] };
const shellCapabilities = new Set(shellManifest.plugins.map((p) => p.capability));

function zonesInPages(): Map<string, string> {
  const zones = new Map<string, string>();
  const dir = join(root, 'src/pages');
  for (const file of readdirSync(dir)) {
    for (const match of readFileSync(join(dir, file), 'utf8').matchAll(/<Zone\s+[^>]*name="([^"]+)"/g)) zones.set(match[1]!, file);
  }
  return zones;
}

function filesIn(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? filesIn(join(dir, e.name)) : [join(dir, e.name)]));
}

describe('modules', () => {
  const modules = allModules();

  it('have ids equal to their folder names', () => {
    for (const [id, path] of Object.entries(modulePaths())) expect(path, `module ${id}`).toBe(`/modules/${id}/index.ts`);
  });

  it.each(modules.map((m) => [m.id, m] as const))('%s: requirements exist', (_id, module) => {
    for (const capability of module.requires?.capabilities ?? []) {
      expect(connectorIds(), `connector "${capability}" (requires)`).toContain(capability);
      expect([...shellCapabilities], `ProtoShell has no "${capability}"`).toContain(capability);
    }
    for (const capability of module.optional?.capabilities ?? []) expect(connectorIds()).toContain(capability);
    for (const dependency of module.requires?.modules ?? []) expect(getModule(dependency), `required module "${dependency}"`).toBeDefined();
    for (const route of module.routes ?? []) expect(Object.keys(module.blocks), `route "${route.path}" block`).toContain(route.block);
  });

  it.each(modules.map((m) => [m.id] as const))('%s: imports stay inside the module', (id) => {
    const dir = join(root, 'modules', id);
    for (const file of filesIn(dir).filter((f) => /\.(ts|tsx)$/.test(f))) {
      const source = readFileSync(file, 'utf8');
      for (const [, spec] of source.matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)) {
        const where = `${relative(root, file)} imports "${spec}"`;
        if (spec!.startsWith('.')) expect(resolve(dirname(file), spec!).startsWith(dir), where).toBe(true);
        expect(/^(@modules|@app|@protoshell|@capacitor|@capgo)(\/|$)/.test(spec!), where).toBe(false);
        const isTest = /\.test\.tsx?$/.test(file);
        const internal = /^@core\/(app|dev|modules|platform|storage|testing|validate|define)(\/|$)/.test(spec!);
        const allowed = spec === '@core/modules/events' || (isTest && spec === '@core/testing');
        expect(internal && !allowed, where).toBe(false);
        expect(/^@core\/connectors\/[^/]+\/.+/.test(spec!), `${where} (use '@core/connectors/<id>')`).toBe(false);
      }
    }
  });

  it('have no dependency cycles', () => {
    const visit = (id: string, path: string[]): void => {
      expect(path, `cycle: ${[...path, id].join(' -> ')}`).not.toContain(id);
      for (const dep of getModule(id)?.requires?.modules ?? []) visit(dep, [...path, id]);
    };
    for (const m of modules) visit(m.id, []);
  });
});

describe('composition', () => {
  const zones = zonesInPages();
  const flags = new Set(Object.keys(composition.flags ?? {}));

  it.each(composition.placements.map((p) => [`${p.zone} <- ${p.module}/${p.block}`, p] as const))('%s', (_name, placement) => {
    expect([...zones.keys()], `zone "${placement.zone}" not found in src/pages`).toContain(placement.zone);
    const module = getModule(placement.module);
    expect(module, `module "${placement.module}"`).toBeDefined();
    expect(Object.keys(module!.blocks), `block "${placement.block}"`).toContain(placement.block);
    if (placement.flag) expect([...flags], `flag "${placement.flag}" not declared in flags`).toContain(placement.flag);
  });

  it('module configs reference existing modules and declared flags', () => {
    for (const [id, cfg] of Object.entries(composition.modules ?? {})) {
      expect(getModule(id), `modules.${id}`).toBeDefined();
      if (cfg.flag) expect([...flags], `flag "${cfg.flag}" of ${id}`).toContain(cfg.flag);
    }
  });

  it('pages have unique paths and zone names use the page key', () => {
    const paths = Object.values(composition.pages).map((p) => p.path);
    expect(new Set(paths).size).toBe(paths.length);
    for (const zone of zones.keys()) expect(Object.keys(composition.pages), `zone "${zone}" prefix`).toContain(zone.split('.')[0]);
  });

  it('pages contain only layout and zones', () => {
    const dir = join(root, 'src/pages');
    for (const file of readdirSync(dir)) {
      const source = readFileSync(join(dir, file), 'utf8');
      for (const [, spec] of source.matchAll(/from\s+['"]([^'"]+)['"]/g)) expect(spec, `${file} may import only '@core/ui'`).toBe('@core/ui');
      expect(/use[A-Z]\w*\(/.test(source), `${file} must not use hooks`).toBe(false);
    }
  });

  it('every module is placed or required by another module', () => {
    const used = new Set([...composition.placements.map((p) => p.module), ...allModules().flatMap((m) => m.requires?.modules ?? [])]);
    for (const m of allModules()) expect(used.has(m.id) || (m.routes?.length ?? 0) > 0, `module "${m.id}" is never placed`).toBe(true);
  });
});
