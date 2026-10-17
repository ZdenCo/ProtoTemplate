import { tts } from '@protoshell/sdk';

import type { TtsApi } from './api';

export const realTts: TtsApi = {
  speak: (text, options) => tts.speak(text, options),
  stop: () => tts.stop(),
  voices: async () =>
    ((await tts.voices()) as tts.DeviceVoice[]).map((voice, index) => ({
      index,
      name: voice.name,
      lang: voice.lang,
      offline: voice.localService && voice.installed !== false,
    })),
};
