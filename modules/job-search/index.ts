import { defineModule } from '@core';

export default defineModule({
  id: 'job-search',
  title: 'Nabídky práce',
  description: 'Agregátor a vyhodnocování pracovních nabídek z českých portálů.',
  icon: '💼',
  blocks: {
    results: () => import('./blocks/Results'),
    saved: () => import('./blocks/Saved'),
  },
  settings: {
    failSource: {
      type: 'select',
      label: 'Simulovat výpadek portálu',
      default: 'none',
      options: [
        { value: 'none', label: 'Žádný (vše funguje)' },
        { value: 'jobs.cz', label: 'jobs.cz' },
        { value: 'prace.cz', label: 'prace.cz' },
        { value: 'startupjobs.cz', label: 'startupjobs.cz' },
      ],
    },
  },
});
