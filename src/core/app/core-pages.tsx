import { useParams } from 'react-router';

import { BlockHost } from '../modules/block-host';
import { getModule } from '../modules/registry';
import { useModuleStatus } from '../modules/status';
import { EmptyState, ErrorState } from '../ui/components/states';
import { PageLayout } from '../ui/page-layout';

/** /m/:moduleId/<route path>: renders a module route's block full screen. */
export function ModuleRoutePage({ moduleId, block, title }: { moduleId: string; block: string; title: string }) {
  const status = useModuleStatus(moduleId);
  return (
    <PageLayout title={title} back>
      {status.enabled ? <BlockHost module={moduleId} block={block} /> : <EmptyState icon="🚫" title="Not available" message={status.reason} />}
    </PageLayout>
  );
}

/**
 * /__sandbox/:moduleId[?block=name]: every block of one module, ignoring flags. Used by the AI
 * while building a module and by the e2e screenshots.
 */
export function SandboxPage() {
  const { moduleId = '' } = useParams();
  const module = getModule(moduleId);
  const only = new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('block');
  if (!module) {
    return (
      <PageLayout title="Sandbox" back>
        <ErrorState title="Unknown module" message={moduleId} />
      </PageLayout>
    );
  }
  const blocks = Object.keys(module.blocks).filter((b) => !only || b === only);
  return (
    <PageLayout title={`Sandbox: ${module.title}`} back>
      {blocks.map((block) => (
        <section key={block} className="flex flex-col gap-2" data-sandbox-block={block}>
          <p className="font-mono text-xs text-muted">
            {module.id}/{block}
          </p>
          <BlockHost module={module.id} block={block} />
        </section>
      ))}
    </PageLayout>
  );
}

export function NotFoundPage() {
  return (
    <PageLayout title="Not found" back>
      <EmptyState icon="🧭" title="Page not found" />
    </PageLayout>
  );
}
