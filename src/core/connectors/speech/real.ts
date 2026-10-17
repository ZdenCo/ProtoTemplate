import { speech } from '@protoshell/sdk';

import type { SpeechApi } from './api';

export const realSpeech: SpeechApi = {
  ensurePermission: () => speech.ensurePermission(),
  isAvailable: () => speech.isAvailable(),
  listen: (options, onPartial) => speech.listen(options, onPartial),
  stop: () => speech.stop(),
  languages: () => speech.languages(),
};
