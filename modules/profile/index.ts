import { defineModule } from '@core';
import type { UserProfile } from './types';

declare module '@core/modules/events' {
  interface AppEvents {
    'profile:changed': UserProfile;
  }
}

export default defineModule({
  id: 'profile',
  title: 'Pracovní profil',
  description: 'Nastavení profesního profilu, dovedností a preferencí pro hledání práce.',
  icon: '👤',
  blocks: {
    editor: () => import('./blocks/Editor'),
    summary: () => import('./blocks/Summary'),
  },
});
