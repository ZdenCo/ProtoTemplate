# AGENTS.md: how to build an app on this template

You are building a **mobile web app that runs inside ProtoShell**, a native shell on the user's
phone that exposes device features (camera, QR, on-device AI, voice, sensors, BLE …).
The app is a static React SPA. There is **no backend**: all data stays on the device.

Read **[CAPABILITIES.md](CAPABILITIES.md)** first. It lists every device feature, recipe, hook and UI
component you can use, with limits and examples.

## Architecture in one picture

```
src/pages/*.tsx          empty layouts: <PageLayout> + <Zone name="page.zone" />   (no logic)
src/app.composition.ts   which module block goes into which zone, behind which flag
src/app.config.ts        app id / name / version
modules/<id>/            YOUR CODE: one folder per feature (blocks, routes, settings, events)
src/core/                the frozen core: connectors, recipes, module runtime, UI kit
```

A **module** is a self-contained feature. It exports named **blocks** (React components).
The **composition** places blocks into **zones** of pages and gates modules with **flags**.
Pages never know which modules exist.

## Rules (enforced by `npm run lint` and `npm run validate`)

1. Write feature code only in `modules/<id>/`. Edit `src/app.composition.ts` to place it.
2. Do **not** edit `src/core/**`. Exception: `npm run prune` deletes unused connectors/recipes.
3. Pages contain only `PageLayout` and `Zone` from `@core/ui`: no hooks, no other imports.
   You may add a new page file (same shape) and register it in `composition.pages` when the app needs one.
4. Modules import only from `@core`, `@core/ui`, `@core/recipes/<id>`, `@core/connectors/<id>` (types),
   `@core/modules/events` (event typing), `react`, `react-router` and their own files.
   Never from `@protoshell/*`, `@capacitor/*`, another module, or `@app/*`.
5. Modules never import each other. Talk through typed events (`useEmit` / `useEvent`).
6. Every block that calls a device feature must list it in `requires.capabilities` (hard
   requirement: module hidden without it) or `optional.capabilities` (check `useCapability`).
7. Use `AsyncButton` for anything that calls a connector: it shows a spinner and turns errors
   into toasts. `UserCancelledError` (user closed scanner/camera) is not an error, so ignore it.
8. Persist with `useStoredState` / `useModuleStorage` / `useBlobStore`. Never `localStorage` directly.
   Keys are namespaced per app and module automatically.
9. Style with Tailwind using the theme tokens (`bg-surface`, `text-muted`, `bg-accent` …), not raw colours.
   App-wide colour changes go in `src/theme.css`.
10. Ask before big downloads: wrap vlm / neuralTts features in `<ModelGate>` (recipe `models`).

## Workflow

1. **Plan.** Map the requested app to modules (one per feature) and pages/zones. Check
   CAPABILITIES.md limits: e.g. `llm` has no streaming and 256 tokens on Android; `vlm` needs a 1.6 GB
   download.
2. **Set identity.** Edit `src/app.config.ts` (`id` is a short, stable, unique slug; `name`; `version`).
3. **Remove what you don't need.** Delete the `example-*` module folders and their `flags`,
   `modules` and `placements` entries in `src/app.composition.ts`. Keep the ones that are a useful
   starting point and rename/adapt them. Keep or replace `app-info`.
4. **Create modules.** `npm run new:module <id> -- --title "Title"`, then build blocks in
   `modules/<id>/blocks/`. Look at the example modules for patterns.
5. **Compose.** Add the flag, module config and placements the generator printed to
   `src/app.composition.ts`. Adjust pages/zones/tabs if needed.
6. **Test.** Unit test each block with `renderBlock` + `setMocks` (see `modules/example-scan`).
   Check every module in the sandbox at `#/__sandbox/<id>` (`npm run dev`).
7. **Prune.** `npm run prune` (report) then `npm run prune -- --apply`: deletes connectors and
   recipes no module uses and regenerates CAPABILITIES.md.
8. **Verify.** `npm run verify` must pass. Look at the screenshots in `e2e/screenshots/`.

## Module anatomy

```ts
// modules/plant-doctor/index.ts
import { defineModule } from '@core';

declare module '@core/modules/events' {
  interface AppEvents {
    'plant-doctor:diagnosed': { plant: string; healthy: boolean };
  }
}

export default defineModule({
  id: 'plant-doctor',                       // = folder name, kebab-case
  title: 'Plant doctor',
  description: 'Photograph a plant, get a diagnosis.',
  icon: '🌿',
  requires: { capabilities: ['camera', 'vlm'] },
  optional: { capabilities: ['haptics'] },
  blocks: {
    card: () => import('./blocks/Card'),      // small entry widget for a page zone
    screen: () => import('./blocks/Screen'),  // full UI
  },
  routes: [{ path: 'diagnose', block: 'screen', title: 'Diagnose' }],  // -> /m/plant-doctor/diagnose
  settings: {
    detail: { type: 'select', label: 'Detail', default: 'short', options: [{ value: 'short', label: 'Short' }, { value: 'long', label: 'Long' }] },
  },
});
```

```tsx
// modules/plant-doctor/blocks/Card.tsx
import { useNav } from '@core';
import { Card } from '@core/ui';

export default function PlantCard() {
  const nav = useNav();
  return <Card icon="🌿" title="Check a plant" onPress={() => nav.toRoute('diagnose')} />;
}
```

Blocks:
- are default-exported components, loaded lazily, each in its own error boundary;
- may take props, which the composition passes via `placements[].props`;
- get module context automatically (`useModuleStorage`, `useModuleSettings`, `useNav().toRoute`).

`setup(ctx)` in `defineModule` runs once at boot for enabled modules (e.g. subscribe to events with
`on()` from `@core`). Prefer hooks inside blocks.

## Composition

```ts
// src/app.composition.ts
export default defineComposition({
  pages: {
    home: { path: '/', title: 'Plants', page: () => import('./pages/HomePage'), tab: { label: 'Home', icon: '🏠' } },
  },
  flags: { plantDoctor: { default: true, description: 'Plant diagnosis' } },
  modules: { 'plant-doctor': { flag: 'plantDoctor' } },
  placements: [
    { zone: 'home.main', module: 'plant-doctor', block: 'card', order: 10, props: { title: 'Scan a plant' } },
  ],
});
```

- Zone names are `<pageKey>.<zone>` and must exist as `<Zone name="…">` in a page file.
- A module is enabled when its flag is on, its required capabilities are available and its
  required modules are enabled. Disabled modules are never downloaded.
- Flag precedence: URL `?ff=plantDoctor:off` > device override (dev overlay) > deployed
  `flags.json` > default. New features: default `true` unless told otherwise.
- Tabs appear when 2+ pages have `tab`.

## Device features and mocks

`useConnector('<id>')` returns the real API inside ProtoShell and a deterministic mock in a
browser, in tests and with `?mock=1`. Mock fixtures come from `window.__mocks`:

```ts
setMocks({ qr: { text: 'ABC-123' }, camera: { fail: 'cancel' }, unavailable: ['vlm'] });  // in tests
```

In the browser, `?unavailable=vlm,llm` simulates a phone without those features.
Streaming APIs (motion, geolocation, bluetooth, notifications.onTap) return an unsubscribe
function: use `useSubscription(() => api.watchX(cb), deps, { enabled })`.
Sensor streams fire ~60 Hz: throttle before `setState` (see `example-sensors/blocks/Compass.tsx`).

## Commands

| Command | What |
| --- | --- |
| `npm run dev` | Dev server on the LAN + QR code to open it in ProtoShell |
| `npm run new:module <id> -- --title "T"` | Scaffold a module from `modules/_template` |
| `npm run validate` | Architecture checks (zones, blocks, flags, capabilities, import boundaries) |
| `npm run test` | Unit tests (Vitest, jsdom, mocks) |
| `npm run e2e` | Playwright on the production build: every page + every module sandbox, screenshots |
| `npm run prune [-- --apply]` | Remove connectors/recipes no module uses |
| `npm run gen:capabilities` | Regenerate CAPABILITIES.md |
| `npm run verify` | typecheck + lint + validate + test + build + e2e |
| `npm run build` | Static build in `dist/` (relative paths, hash routing: upload anywhere) |

First run on a new machine: `npm install && npx playwright install chromium`.

## Definition of done

- `npm run verify` passes.
- Example modules you didn't adapt are deleted, and `npm run prune -- --apply` was run.
- Every module has at least one unit test for its main flow.
- Screenshots in `e2e/screenshots/` look right on both phone sizes, in light and dark.
- `src/app.config.ts` has the real app id, name and version.

## Debugging

- Long-press a page title (or open with `?debug`) for developer tools: capabilities, module
  status with the reason a module is hidden, flag toggles, storage export/import, console logs.
- `?zones=1` outlines empty zones.
- `#/__sandbox/<moduleId>` renders all blocks of one module, ignoring flags.
