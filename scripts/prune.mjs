#!/usr/bin/env node
// npm run prune            -> report unused connectors and recipes
// npm run prune -- --apply -> delete them and regenerate CAPABILITIES.md
//
// "Used" = referenced from any module (except the template): useConnector/getConnector/useCapability
// ids, requires/optional capabilities, '@core/connectors/<id>' and '@core/recipes/<id>' imports,
// plus everything the used recipes need. Core connectors (storage) are always kept.

import { execFileSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import { join, relative } from 'node:path';

import { connectors, connectorsDir, filesIn, moduleIds, modulesDir, recipes, recipesDir, root } from './lib.mjs';

const apply = process.argv.includes('--apply');
const allConnectors = connectors();
const allRecipes = recipes();
const connectorIds = new Set(allConnectors.map((c) => c.id));

const usedConnectors = new Set(allConnectors.filter((c) => c.core).map((c) => c.id));
const usedRecipes = new Set();

for (const id of moduleIds()) {
  for (const file of filesIn(join(modulesDir, id)).filter((f) => /\.(ts|tsx)$/.test(f))) {
    const source = readFileSync(file, 'utf8');
    for (const [, c] of source.matchAll(/(?:useConnector|getConnector|useCapability)\(\s*['"](\w+)['"]/g)) usedConnectors.add(c);
    for (const [, c] of source.matchAll(/@core\/connectors\/(\w+)/g)) usedConnectors.add(c);
    for (const [, r] of source.matchAll(/@core\/recipes\/(\w+)/g)) usedRecipes.add(r);
    for (const [, list] of source.matchAll(/capabilities:\s*\[([^\]]*)\]/g)) {
      for (const [, c] of list.matchAll(/['"](\w+)['"]/g)) usedConnectors.add(c);
    }
  }
}

// Recipes pull in their recipes and connectors.
const queue = [...usedRecipes];
while (queue.length) {
  const recipe = allRecipes.find((r) => r.id === queue.pop());
  if (!recipe) continue;
  for (const c of recipe.connectors) usedConnectors.add(c);
  for (const r of recipe.recipes) {
    if (usedRecipes.has(r)) continue;
    usedRecipes.add(r);
    queue.push(r);
  }
}

const unknown = [...usedConnectors].filter((c) => !connectorIds.has(c));
const unusedConnectors = allConnectors.filter((c) => !usedConnectors.has(c.id)).map((c) => c.id);
const unusedRecipes = allRecipes.filter((r) => !usedRecipes.has(r.id)).map((r) => r.id);
const examples = moduleIds().filter((id) => id.startsWith('example-'));

console.log(`Used connectors: ${[...usedConnectors].filter((c) => connectorIds.has(c)).sort().join(', ') || '-'}`);
console.log(`Used recipes:    ${[...usedRecipes].sort().join(', ') || '-'}`);
console.log(`Unused connectors: ${unusedConnectors.join(', ') || '-'}`);
console.log(`Unused recipes:    ${unusedRecipes.join(', ') || '-'}`);
if (unknown.length) console.warn(`\nReferenced but missing connectors: ${unknown.join(', ')}`);
if (examples.length) {
  console.warn(`\nExample modules still present (${examples.join(', ')}): they keep their connectors alive.`);
  console.warn('Delete the folders and their entries in src/app.composition.ts first if the app does not need them.');
}

if (!apply) {
  console.log('\nDry run. Run `npm run prune -- --apply` to delete the unused folders.');
  process.exit(0);
}

for (const id of unusedConnectors) rmSync(join(connectorsDir, id), { recursive: true, force: true });
for (const id of unusedRecipes) rmSync(join(recipesDir, id), { recursive: true, force: true });
console.log(`\nDeleted ${unusedConnectors.length} connector(s) and ${unusedRecipes.length} recipe(s) under ${relative(root, join(root, 'src/core'))}.`);
execFileSync(process.execPath, [join(root, 'scripts/gen-capabilities.mjs')], { stdio: 'inherit' });
console.log('Now run: npm run verify');
