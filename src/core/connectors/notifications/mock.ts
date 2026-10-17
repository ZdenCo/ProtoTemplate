import { delay } from '../mock-utils';
import type { NotificationsApi, NotificationTap } from './api';

// Mock "shows" a notification by logging it; tests can read window.__mocks.notifications.sent.
const listeners = new Set<(tap: NotificationTap) => void>();
const timers = new Map<number, ReturnType<typeof setTimeout>>();

function record(entry: unknown) {
  const mocks = (window.__mocks ??= {});
  const scope = (mocks.notifications ??= {}) as { sent?: unknown[] };
  (scope.sent ??= []).push(entry);
}

export const mockNotifications: NotificationsApi = {
  ensurePermission: async () => true,
  async notify({ title, body, at, id = Math.floor(Math.random() * 0x7fffffff), extra }) {
    await delay(100);
    const show = () => {
      console.info(`[mock notification #${id}] ${title}${body ? ` — ${body}` : ''}`);
      record({ id, title, body, extra });
    };
    const wait = at ? at.getTime() - Date.now() : 0;
    if (wait > 0) timers.set(id, setTimeout(show, wait));
    else show();
    return id;
  },
  async cancel(...ids) {
    for (const id of ids) {
      clearTimeout(timers.get(id));
      timers.delete(id);
    }
  },
  async onTap(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },
};
