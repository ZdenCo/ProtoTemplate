import { defineModule } from '@core';

export default defineModule({
  id: 'app-info',
  title: 'App info',
  description: 'App name, version, runtime mode.',
  icon: 'ℹ️',
  blocks: {
    card: () => import('./blocks/AppInfo'),
  },
});
