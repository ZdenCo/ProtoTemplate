import { notifications } from '@protoshell/sdk';

import type { NotificationsApi } from './api';

export const realNotifications: NotificationsApi = {
  ensurePermission: () => notifications.ensurePermission(),
  notify: (options) => notifications.notify(options),
  cancel: (...ids) => notifications.cancel(...ids),
  onTap: async (callback) => {
    const handle = await notifications.onTap(({ notification }) => callback({ id: notification.id, extra: notification.extra }));
    return () => void handle.remove();
  },
};
