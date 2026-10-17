import { defineModule } from '@core';

export default defineModule({
  id: 'example-assistant',
  title: 'Assistant',
  description: 'Talk to the on-device LLM by text or voice; it answers out loud.',
  icon: '💬',
  requires: { capabilities: ['llm', 'speech', 'tts'] },
  optional: { capabilities: ['neuralTts'] },
  blocks: {
    chat: () => import('./blocks/Chat'),
  },
  settings: {
    speakAnswers: { type: 'boolean', label: 'Speak answers', default: true },
    language: {
      type: 'select',
      label: 'Language',
      default: 'en-US',
      options: [
        { value: 'en-US', label: 'English' },
        { value: 'cs-CZ', label: 'Czech (system voice)' },
      ],
    },
  },
});
