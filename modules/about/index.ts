import { defineModule } from '@core';

export default defineModule({
  id: 'about',
  title: 'About',
  description: 'App version and description.',
  icon: 'ℹ️',
  requires: { capabilities: [] },
  blocks: {
    card: () => import('./blocks/AboutCard'),
  },
});
