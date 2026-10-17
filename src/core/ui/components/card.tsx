import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '../cn';

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode;
  subtitle?: ReactNode;
  icon?: string;
  /** Right side of the header (buttons, badges). */
  actions?: ReactNode;
  /** Makes the whole card tappable. */
  onPress?: () => void;
}

export function Card({ title, subtitle, icon, actions, onPress, className, children, ...rest }: CardProps) {
  const header = (title || actions) && (
    <div className="flex items-start gap-3">
      {icon && <span className="text-2xl leading-none" aria-hidden>{icon}</span>}
      <div className="min-w-0 flex-1">
        {title && <h2 className="text-base font-semibold">{title}</h2>}
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
  return (
    <section
      className={cn('flex flex-col gap-3 rounded-card border border-line bg-surface p-4', onPress && 'cursor-pointer active:bg-surface-2', className)}
      onClick={onPress}
      role={onPress ? 'button' : undefined}
      {...rest}
    >
      {header}
      {children}
    </section>
  );
}

export function Row({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-wrap items-center gap-2', className)} {...rest} />;
}

export function Stack({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-3', className)} {...rest} />;
}

export function Badge({ tone = 'neutral', children }: { tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'accent'; children: ReactNode }) {
  const tones = {
    neutral: 'bg-surface-2 text-muted',
    success: 'bg-success/15 text-success',
    warning: 'bg-warning/15 text-warning',
    danger: 'bg-danger/15 text-danger',
    accent: 'bg-accent/15 text-accent',
  };
  return <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', tones[tone])}>{children}</span>;
}

export function Text({ muted, small, className, ...rest }: HTMLAttributes<HTMLParagraphElement> & { muted?: boolean; small?: boolean }) {
  return <p className={cn(muted && 'text-muted', small && 'text-sm', className)} {...rest} />;
}
