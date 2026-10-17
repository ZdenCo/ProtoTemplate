import { defineModule } from '@core';

export default defineModule({
  id: 'example-photo-qa',
  title: 'Photo Q&A',
  description: 'Take a photo and ask the on-device vision model about it.',
  icon: '🖼️',
  requires: { capabilities: ['camera', 'vlm'] },
  blocks: {
    teaser: () => import('./blocks/Teaser'),
    screen: () => import('./blocks/PhotoQa'),
  },
  routes: [{ path: 'ask', block: 'screen', title: 'Photo Q&A' }],
});
