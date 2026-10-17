import { hasParam } from '../platform/url';
import { cn } from '../ui/cn';
import { BlockHost } from './block-host';
import { usePlacements } from './status';

/**
 * A named slot in a page. The composition decides which module blocks go in, in which order and
 * behind which flags. Pages contain nothing but layout and zones.
 */
export function Zone({ name, className }: { name: string; className?: string }) {
  const placements = usePlacements(name);
  if (!placements.length) {
    return hasParam('zones') ? <div className="rounded-xl border border-dashed border-line p-3 text-xs text-muted">{name}</div> : null;
  }
  return (
    <div data-zone={name} className={cn('flex flex-col gap-4', className)}>
      {placements.map((p) => (
        <BlockHost key={`${p.module}/${p.block}/${p.order ?? ''}`} module={p.module} block={p.block} props={p.props} />
      ))}
    </div>
  );
}
