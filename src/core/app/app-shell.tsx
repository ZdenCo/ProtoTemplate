import { NavLink, Outlet } from 'react-router';

import { DevOverlay } from '../dev/dev-overlay';
import { cn } from '../ui/cn';
import { Toaster } from '../ui/toast';
import { composition } from './config';

function TabBar() {
  const tabs = Object.values(composition.pages).filter((p) => p.tab);
  if (tabs.length < 2) return null;
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/95 backdrop-blur">
      <div className="flex">
        {tabs.map((page) => (
          <NavLink
            key={page.path}
            to={page.path}
            end={page.path === '/'}
            className={({ isActive }) => cn('flex h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs', isActive ? 'text-accent' : 'text-muted')}
          >
            <span className="text-xl leading-none" aria-hidden>
              {page.tab!.icon}
            </span>
            {page.tab!.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

const hasTabs = Object.values(composition.pages).filter((p) => p.tab).length >= 2;

export function AppShell() {
  return (
    <>
      <div className={cn('min-h-full', hasTabs && 'pb-[calc(3.5rem+env(safe-area-inset-bottom))]')}>
        <Outlet />
      </div>
      <TabBar />
      <Toaster />
      <DevOverlay />
    </>
  );
}
