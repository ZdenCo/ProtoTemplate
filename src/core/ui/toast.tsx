import { create } from 'zustand';

import { cn } from './cn';

type Tone = 'info' | 'success' | 'error';
interface ToastItem {
  id: number;
  tone: Tone;
  message: string;
}

const useToasts = create<{ items: ToastItem[] }>(() => ({ items: [] }));
let nextId = 1;

function show(message: string, tone: Tone, ms = 3500) {
  const id = nextId++;
  useToasts.setState((s) => ({ items: [...s.items, { id, tone, message }] }));
  setTimeout(() => useToasts.setState((s) => ({ items: s.items.filter((t) => t.id !== id) })), ms);
}

/** Short feedback messages. Callable from anywhere (components, module setup, event handlers). */
export const toast = {
  info: (message: string) => show(message, 'info'),
  success: (message: string) => show(message, 'success'),
  error: (message: string) => show(message, 'error', 5000),
};

export function Toaster() {
  const items = useToasts((s) => s.items);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col items-center gap-2 px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
      {items.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            'pointer-events-auto max-w-md rounded-xl px-4 py-2.5 text-sm shadow-lg',
            t.tone === 'error' ? 'bg-danger text-white' : t.tone === 'success' ? 'bg-success text-white' : 'bg-text text-bg',
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
