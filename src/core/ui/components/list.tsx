import type { ReactNode } from 'react';

import { cn } from '../cn';

export function List({ children, className }: { children: ReactNode; className?: string }) {
  return <ul className={cn('divide-y divide-line overflow-hidden rounded-card border border-line bg-surface', className)}>{children}</ul>;
}

export interface ListItemProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Emoji or image URL. */
  leading?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
}

export function ListItem({ title, subtitle, leading, trailing, onPress }: ListItemProps) {
  return (
    <li
      className={cn('flex min-h-14 items-center gap-3 px-4 py-2', onPress && 'cursor-pointer active:bg-surface-2')}
      onClick={onPress}
      role={onPress ? 'button' : undefined}
    >
      {leading && <div className="shrink-0 text-xl">{leading}</div>}
      <div className="min-w-0 flex-1">
        <div className="truncate">{title}</div>
        {subtitle && <div className="truncate text-sm text-muted">{subtitle}</div>}
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </li>
  );
}
