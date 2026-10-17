import type { ReactNode } from 'react';

import { cn } from '../cn';
import { Button } from './button';

export function EmptyState({ icon = '✨', title, message, action }: { icon?: string; title: string; message?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
      <span className="text-4xl" aria-hidden>{icon}</span>
      <p className="font-semibold">{title}</p>
      {message && <p className="text-sm text-muted">{message}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }: { title?: string; message?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col gap-2 rounded-card border border-danger/40 bg-danger/10 p-4">
      <p className="font-semibold text-danger">{title}</p>
      {message && <p className="text-sm break-words text-muted">{message}</p>}
      {onRetry && (
        <Button size="sm" variant="secondary" className="self-start" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

/** Determinate progress (0..1) or indeterminate when `value` is undefined. */
export function ProgressBar({ value, label, className }: { value?: number; label?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && <div className="flex justify-between text-sm text-muted">{label}{value !== undefined && <span>{Math.round(value * 100)}%</span>}</div>}
      <div className="h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={value === undefined ? undefined : Math.round(value * 100)}>
        <div
          className={cn('h-full rounded-full bg-accent transition-[width]', value === undefined && 'w-1/3 animate-pulse')}
          style={value === undefined ? undefined : { width: `${Math.max(0, Math.min(1, value)) * 100}%` }}
        />
      </div>
    </div>
  );
}

/** Text that grows while an LLM streams; shows a caret while `streaming`. */
export function StreamingText({ text, streaming, placeholder, className }: { text: string; streaming?: boolean; placeholder?: string; className?: string }) {
  return (
    <p className={cn('whitespace-pre-wrap break-words', !text && 'text-muted', className)} aria-live="polite">
      {text || placeholder}
      {streaming && <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-accent align-middle" />}
    </p>
  );
}

export function Thumbnail({ src, alt = '', className }: { src: string; alt?: string; className?: string }) {
  return <img src={src} alt={alt} className={cn('aspect-square w-full rounded-xl bg-surface-2 object-cover', className)} />;
}

export function Divider() {
  return <hr className="border-line" />;
}
