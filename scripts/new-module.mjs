#!/usr/bin/env node
// npm run new:module <id> [-- --title "Title"]
// Copies modules/_template to modules/<id> and prints the composition snippet to add.

import { cpSync, existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { filesIn, modulesDir } from './lib.mjs';

const [id, ...rest] = process.argv.slice(2);
const titleIndex = rest.indexOf('--title');
if (!id || !/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(id)) {
  console.error('Usage: npm run new:module <kebab-case-id> [-- --title "Title"]');
  process.exit(1);
}
const title = titleIndex >= 0 ? rest[titleIndex + 1] : id.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
const target = join(modulesDir, id);
if (existsSync(target)) {
  console.error(`modules/${id} already exists`);
  process.exit(1);
}

cpSync(join(modulesDir, '_template'), target, { recursive: true });
for (const file of filesIn(target)) {
  writeFileSync(file, readFileSync(file, 'utf8').replaceAll('__MODULE_ID__', id).replaceAll('__MODULE_TITLE__', title));
}
if (existsSync(join(target, 'README.md'))) renameSync(join(target, 'README.md'), join(target, 'NOTES.md'));

const flag = id.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
console.log(`Created modules/${id}

Add to src/app.composition.ts:

  flags:      ${flag}: { default: true, description: '${title}' },
  modules:    '${id}': { flag: '${flag}' },
  placements: { zone: 'home.main', module: '${id}', block: 'card', order: 50 },

Then: npm run validate && open #/__sandbox/${id}`);
