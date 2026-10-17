# ProtoTemplate

Modular React frontend core for apps that run inside ProtoShell (the `protoshell` / agent-fe repo), the
Capacitor host app on your phone. Copy the template once per app. An AI agent then builds the
features as modules, guided by [AGENTS.md](AGENTS.md) and [CAPABILITIES.md](CAPABILITIES.md).

- **Pages are empty.** They hold only a layout and named zones.
- **Features are modules.** Each folder in `modules/` exports blocks, routes, settings and events.
- **The composition decides.** `src/app.composition.ts` places blocks into zones and switches
  modules on and off with feature flags. You can override the flags without a rebuild through
  `flags.json` on the server.
- **Connectors.** Every device feature has a typed API: QR, camera, Bluetooth LE, OS LLM, Qwen3-VL
  vision model, system and neural TTS, speech to text, storage, motion, geolocation, haptics and
  notifications. Each one has a real implementation and a browser mock.
- **Prune when done.** The template ships every connector so the AI knows what is possible.
  `npm run prune -- --apply` then deletes the ones the app doesn't use.

Stack: Vite, React 19, TypeScript, Tailwind 4, zustand, react-router (hash), Vitest, Playwright.

## Start a new app

```bash
cp -R prototemplate my-app && cd my-app      # or "Use this template" on GitHub
npm install
npx playwright install chromium
npm run dev                                   # scan the printed QR in ProtoShell
```

In a desktop browser the app runs with mock device features. Inside ProtoShell it uses the
real ones.

## Build and deploy

```bash
npm run verify     # typecheck, lint, architecture checks, tests, build, e2e
npm run build      # -> dist/
```

`dist/` is fully static, with relative asset paths and hash routing. Upload it to any folder
on any web host (FTP is fine) and open that URL in ProtoShell. To toggle modules in production,
edit `dist/flags.json` on the server.

Use HTTPS on the host if you can. Some web APIs, such as the clipboard, need a secure origin.

## Update ProtoShell packages

The ProtoShell SDK isn't on npm. Slim tarballs are vendored in `vendor/`:

```bash
npm run sync:shell                 # from ../agent-fe (or: npm run sync:shell -- /path/to/agent-fe)
npm install
npm run gen:capabilities
```

`vendor/protoshell.json` is the shell's build manifest. `npm run validate` checks that every
capability a module needs exists in it.

## Layout

```
src/core/            frozen core (see src/core/VERSION)
  connectors/<id>/   api.ts (types), real.ts (ProtoShell), mock.ts (browser), meta.json (docs)
  recipes/<id>/      ai, vision, voice, scan, models: hooks combining connectors
  modules/           defineModule, registry, composition, flags, events, Zone
  ui/                Tailwind UI kit + theme tokens
  dev/               developer overlay (long-press a page title)
  validate/          architecture tests (npm run validate)
src/pages/           zones-only pages
src/app.composition.ts
src/app.config.ts
modules/             features (example-* modules show the patterns; delete them for real apps)
scripts/             sync-shell, new-module, prune, gen-capabilities
```

Requires Node ≥ 22.22.
