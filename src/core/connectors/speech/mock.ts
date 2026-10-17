import { delay, fixture, maybeFail } from '../mock-utils';
import type { SpeechApi } from './api';

// Fixtures: window.__mocks.speech = { transcript: '…', fail }. "Hears" the transcript word by word.
let stopped = false;

export const mockSpeech: SpeechApi = {
  ensurePermission: async () => true,
  isAvailable: async () => true,
  async listen(_options, onPartial) {
    maybeFail('speech');
    stopped = false;
    const words = fixture('speech', 'transcript', 'What can you see in this picture').split(' ');
    let heard = '';
    for (const word of words) {
      if (stopped) break;
      await delay(180);
      heard = heard ? `${heard} ${word}` : word;
      onPartial?.(heard);
    }
    return heard;
  },
  async stop() {
    stopped = true;
  },
  languages: async () => ['en-US', 'en-GB', 'cs-CZ', 'de-DE'],
};
