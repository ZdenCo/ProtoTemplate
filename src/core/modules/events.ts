import { useEffect, useRef } from 'react';

/**
 * Typed events between modules. Modules never import each other; they emit and listen here.
 * Declare your events in the module's index.ts:
 *
 *   declare module '@core/modules/events' {
 *     interface AppEvents { 'scan:scanned': { text: string; format: string } }
 *   }
 *
 * Name events '<moduleId>:<what-happened>'.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AppEvents {}

export type EventName = keyof AppEvents & string;
type Handler<E extends EventName> = (payload: AppEvents[E]) => void;

const handlers = new Map<string, Set<(payload: unknown) => void>>();

export function emit<E extends EventName>(name: E, payload: AppEvents[E]): void {
  for (const handler of handlers.get(name) ?? []) {
    try {
      handler(payload);
    } catch (error) {
      console.error(`[events] handler for "${name}" failed`, error);
    }
  }
}

export function on<E extends EventName>(name: E, handler: Handler<E>): () => void {
  const set = handlers.get(name) ?? new Set();
  set.add(handler as (payload: unknown) => void);
  handlers.set(name, set);
  return () => set.delete(handler as (payload: unknown) => void);
}

export function useEmit(): typeof emit {
  return emit;
}

/** Subscribes while mounted; the latest handler is always called. */
export function useEvent<E extends EventName>(name: E, handler: Handler<E>): void {
  const latest = useRef(handler);
  useEffect(() => {
    latest.current = handler;
  });
  useEffect(() => on(name, (payload) => latest.current(payload)), [name]);
}
