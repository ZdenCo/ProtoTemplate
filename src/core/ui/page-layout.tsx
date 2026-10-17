import { useRef } from 'react';
import type { ReactNode } from 'react';
import { useMatches, useNavigate } from 'react-router';

import { openDevOverlay } from '../dev/store';
import { cn } from './cn';

interface RouteHandle {
  title?: string;
  back?: boolean;
}

/**
 * Page frame: sticky header with the page title (from the composition), optional back button,
 * safe-area padding. Long-press the title to open the dev overlay.
 */
export function PageLayout({ title, back, children, className }: { title?: string; back?: boolean; children: ReactNode; className?: string }) {
  const navigate = useNavigate();
  const handle = (useMatches().at(-1)?.handle ?? {}) as RouteHandle;
  const heading = title ?? handle.title ?? '';
  const showBack = back ?? handle.back ?? false;
  const pressTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  return (
    <div className="flex min-h-full flex-col">
      <header className="pt-safe sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
        <div className="px-safe flex h-12 items-center gap-2">
          {showBack && (
            <button type="button" aria-label="Back" className="-ml-2 px-2 text-2xl text-accent" onClick={() => void navigate(-1)}>
              ‹
            </button>
          )}
          <h1
            className="flex-1 truncate text-lg font-semibold select-none"
            onPointerDown={() => (pressTimer.current = setTimeout(openDevOverlay, 700))}
            onPointerUp={() => clearTimeout(pressTimer.current)}
            onPointerLeave={() => clearTimeout(pressTimer.current)}
          >
            {heading}
          </h1>
        </div>
      </header>
      <main className={cn('px-safe flex flex-1 flex-col gap-4 py-4', className)}>{children}</main>
    </div>
  );
}
