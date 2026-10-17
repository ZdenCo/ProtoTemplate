import { defineConnector } from '../types';
import type { NotificationsApi } from './api';
import { mockNotifications } from './mock';
import { realNotifications } from './real';

export type * from './api';

declare module '../types' {
  interface ConnectorRegistry {
    notifications: NotificationsApi;
  }
}

export default defineConnector<NotificationsApi>({ id: 'notifications', real: realNotifications, mock: mockNotifications });
