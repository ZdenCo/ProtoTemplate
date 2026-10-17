// Test helpers for module blocks: mock connectors, flags and router included.
import { render } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router';

import { connectorIds } from '../connectors/registry';
import { BlockHost } from '../modules/block-host';
import { initFlags } from '../modules/flags';
import { bootPlatform } from '../platform/platform';
import type { MockConfig } from '../platform/platform';

/** Sets mock fixtures (see each connector's mock.ts), e.g. setMocks({ qr: { text: 'abc' }, unavailable: ['vlm'] }). */
export function setMocks(mocks: MockConfig): void {
  window.__mocks = { ...window.__mocks, ...mocks };
}

/** Boots core in mock mode and renders one module block. Use findBy* queries: blocks load lazily. */
export async function renderBlock(moduleId: string, block: string, props?: Record<string, unknown>): Promise<RenderResult> {
  await bootPlatform(connectorIds());
  await initFlags();
  const router = createMemoryRouter([
    { path: '/', element: <BlockHost module={moduleId} block={block} props={props} /> },
    { path: '*', element: <div data-testid="navigated" /> },
  ]);
  return render(<RouterProvider router={router} />);
}
