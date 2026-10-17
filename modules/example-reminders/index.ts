import { defineModule } from '@core';

export default defineModule({
  id: 'example-reminders',
  title: 'Reminders',
  description: 'Schedule local notifications; saved list survives restarts.',
  icon: '⏰',
  requires: { capabilities: ['notifications'] },
  blocks: {
    card: () => import('./blocks/Reminders'),
  },
});
