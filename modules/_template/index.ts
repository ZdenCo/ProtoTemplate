import { defineModule } from '@core';

// Copied by `npm run new:module <id>`: __MODULE_ID__ and __MODULE_TITLE__ get replaced.
export default defineModule({
  id: '__MODULE_ID__',
  title: '__MODULE_TITLE__',
  description: 'What this module does, in one sentence.',
  icon: '🧩',
  requires: {
    capabilities: [],
  },
  blocks: {
    card: () => import('./blocks/MainCard'),
  },
});
