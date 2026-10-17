import { Suspense, lazy } from 'react';
import type { LazyExoticComponent } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { ErrorState } from '../ui/components/states';
import { Spinner } from '../ui/components/spinner';
import { ModuleProvider } from './context';
import { allModules, getModule } from './registry';
import type { BlockComponent } from './types';

// One lazy component per block, created once at startup (lazy() only loads on first render).
const blocks = new Map<string, LazyExoticComponent<BlockComponent>>(
  allModules().flatMap((m) => Object.entries(m.blocks).map(([name, loader]) => [`${m.id}/${name}`, lazy(loader)] as const)),
);

/**
 * Renders one module block, isolated: its own error boundary and loading state, and the module
 * context its hooks need. A crashing block shows an error card; the page keeps working.
 */
export function BlockHost({ module: moduleId, block, props }: { module: string; block: string; props?: Record<string, unknown> }) {
  const module = getModule(moduleId);
  const Block = blocks.get(`${moduleId}/${block}`);
  if (!module || !Block) return <ErrorState title="Missing block" message={`${moduleId}/${block} does not exist`} />;
  return (
    <ModuleProvider module={module}>
      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <ErrorState title={`${module.title} failed`} message={String((error as Error)?.message ?? error)} onRetry={resetErrorBoundary} />
        )}
      >
        <Suspense fallback={<div className="flex justify-center py-6"><Spinner /></div>}>
          <div data-module={moduleId} data-block={block} className="contents">
            {/* Stable: looked up from the module-level map above, not created here. */}
            {/* eslint-disable-next-line react-hooks/static-components */}
            <Block {...props} />
          </div>
        </Suspense>
      </ErrorBoundary>
    </ModuleProvider>
  );
}
