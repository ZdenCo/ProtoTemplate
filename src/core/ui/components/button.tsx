import { useState } from 'react';
import type { ButtonHTMLAttributes } from 'react';

import { UserCancelledError, errorMessage } from '../../errors';
import { cn } from '../cn';
import { toast } from '../toast';
import { Spinner } from './spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-on-accent active:bg-accent-strong',
  secondary: 'bg-surface-2 text-text active:bg-line',
  ghost: 'bg-transparent text-accent active:bg-surface-2',
  danger: 'bg-danger text-white active:opacity-80',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-base',
  lg: 'h-13 px-5 text-lg',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  block?: boolean;
  icon?: string;
}

export function Button({ variant = 'primary', size = 'md', loading, block, icon, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 rounded-xl font-medium transition disabled:opacity-50',
        variants[variant],
        sizes[size],
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? <Spinner className="size-4 text-current" /> : icon ? <span aria-hidden>{icon}</span> : null}
      {children}
    </button>
  );
}

export interface AsyncButtonProps extends Omit<ButtonProps, 'onClick' | 'loading'> {
  /** Runs on tap; the button shows a spinner meanwhile. Errors become a toast (UserCancelledError is ignored). */
  onClick: () => Promise<unknown>;
  onError?: (error: unknown) => void;
}

/** The default button for anything that calls a connector. */
export function AsyncButton({ onClick, onError, ...rest }: AsyncButtonProps) {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      {...rest}
      loading={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await onClick();
        } catch (error) {
          if (error instanceof UserCancelledError) return;
          if (onError) onError(error);
          else toast.error(errorMessage(error));
        } finally {
          setBusy(false);
        }
      }}
    />
  );
}
