import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';

import { connectorIds } from '../connectors/registry';
import { captureConsole } from '../dev/store';
import { initFlags } from '../modules/flags';
import { runModuleSetups } from '../modules/setup';
import { bootPlatform } from '../platform/platform';
import { config } from './config';
import { createAppRouter } from './router';

/** Boot order: platform (shell or mock) -> flags -> module setup -> render. */
export async function bootCore(): Promise<void> {
  await bootPlatform(connectorIds());
  await initFlags();
  runModuleSetups();
}

export async function startApp(root: HTMLElement): Promise<void> {
  captureConsole();
  document.title = config.name;
  if (config.themeColor) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', config.themeColor);
  await bootCore();
  createRoot(root).render(
    <StrictMode>
      <RouterProvider router={createAppRouter()} />
    </StrictMode>,
  );
}
