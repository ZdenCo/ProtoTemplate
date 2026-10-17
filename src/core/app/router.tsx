import { createHashRouter } from 'react-router';
import type { RouteObject } from 'react-router';

import { allModules } from '../modules/registry';
import { AppShell } from './app-shell';
import { composition } from './config';
import { ModuleRoutePage, NotFoundPage, SandboxPage } from './core-pages';

export function buildRoutes(): RouteObject[] {
  const pages: RouteObject[] = Object.values(composition.pages).map((page) => ({
    path: page.path,
    handle: { title: page.title },
    lazy: async () => ({ Component: (await page.page()).default }),
  }));

  const moduleRoutes: RouteObject[] = allModules().flatMap((module) =>
    (module.routes ?? []).map((route) => ({
      path: `/m/${module.id}/${route.path}`,
      handle: { title: route.title, back: true },
      element: <ModuleRoutePage moduleId={module.id} block={route.block} title={route.title} />,
    })),
  );

  return [
    {
      element: <AppShell />,
      children: [...pages, ...moduleRoutes, { path: '/__sandbox/:moduleId', element: <SandboxPage /> }, { path: '*', element: <NotFoundPage /> }],
    },
  ];
}

// Hash routing: the build runs from any folder on any static host without rewrite rules.
export const createAppRouter = () => createHashRouter(buildRoutes());
