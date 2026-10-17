#!/usr/bin/env node
// Vendors the ProtoShell frontend packages from a local agent-fe checkout.
//
//   npm run sync:shell                 # uses ../agent-fe
//   npm run sync:shell -- /path/to/agent-fe
//
// Packs slim tarballs (dist/ only, no native code) of @protoshell/sdk and the three
// @protoshell/capacitor-* packages into vendor/, copies the shell build manifest
// (protoshell.json) and points package.json at the tarballs.

import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const shellRepo = resolve(root, process.argv[2] ?? process.env.PROTOSHELL_DIR ?? '../agent-fe');
const vendor = join(root, 'vendor');
const PACKAGES = ['capacitor-shell', 'capacitor-vlm', 'capacitor-neural-tts', 'sdk'];

if (!existsSync(join(shellRepo, 'packages/sdk/package.json'))) {
  console.error(`ProtoShell repo not found at ${shellRepo}`);
  process.exit(1);
}

if (PACKAGES.some((p) => !existsSync(join(shellRepo, 'packages', p, 'dist')))) {
  console.log('Building ProtoShell packages…');
  execFileSync('npm', ['run', 'build:packages'], { cwd: shellRepo, stdio: 'inherit' });
}

rmSync(vendor, { recursive: true, force: true });
mkdirSync(vendor, { recursive: true });

const tarballs = {};
for (const name of PACKAGES) {
  const source = join(shellRepo, 'packages', name);
  const pkg = JSON.parse(readFileSync(join(source, 'package.json'), 'utf8'));
  const staging = mkdtempSync(join(tmpdir(), 'protoshell-'));
  cpSync(join(source, 'dist'), join(staging, 'dist'), { recursive: true });
  delete pkg.scripts;
  delete pkg.devDependencies;
  pkg.files = ['dist/'];
  writeFileSync(join(staging, 'package.json'), JSON.stringify(pkg, null, 2));
  const out = execFileSync('npm', ['pack', '--silent', '--pack-destination', vendor], { cwd: staging, encoding: 'utf8' }).trim();
  rmSync(staging, { recursive: true, force: true });
  tarballs[pkg.name] = `file:vendor/${out.split('\n').pop()}`;
  console.log(`  ${pkg.name}@${pkg.version} -> ${tarballs[pkg.name]}`);
}

const manifest = join(shellRepo, 'apps/shell/public/protoshell.json');
if (!existsSync(manifest)) {
  console.error('apps/shell/public/protoshell.json missing: build the shell app once (npm run build in agent-fe).');
  process.exit(1);
}
cpSync(manifest, join(vendor, 'protoshell.json'));

const sdkPkg = JSON.parse(readFileSync(join(shellRepo, 'packages/sdk/package.json'), 'utf8'));
const capacitorCore = sdkPkg.devDependencies?.['@capacitor/core'];

const appPkgPath = join(root, 'package.json');
const appPkg = JSON.parse(readFileSync(appPkgPath, 'utf8'));
appPkg.dependencies = { ...appPkg.dependencies, ...tarballs };
if (capacitorCore) appPkg.dependencies['@capacitor/core'] = capacitorCore;
appPkg.dependencies = Object.fromEntries(Object.entries(appPkg.dependencies).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(appPkgPath, `${JSON.stringify(appPkg, null, 2)}\n`);

console.log(`\nVendored ${readdirSync(vendor).length} files. Run npm install, then npm run gen:capabilities.`);
