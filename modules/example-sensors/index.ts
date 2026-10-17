import { defineModule } from '@core';

export default defineModule({
  id: 'example-sensors',
  title: 'Sensors',
  description: 'Compass heading, tilt and GPS distance walked.',
  icon: '🧭',
  requires: { capabilities: ['motion', 'geolocation'] },
  blocks: {
    compass: () => import('./blocks/Compass'),
    walk: () => import('./blocks/Walk'),
  },
});
