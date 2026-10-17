import { browserSpeak, browserStopSpeaking } from '../mock-utils';
import type { TtsApi } from './api';

// Speaks through the browser's speechSynthesis when present.
export const mockTts: TtsApi = {
  speak: (text, { lang, rate, pitch } = {}) => browserSpeak(text, { lang, rate, pitch }),
  async stop() {
    browserStopSpeaking();
  },
  async voices() {
    const list = 'speechSynthesis' in window ? window.speechSynthesis.getVoices() : [];
    if (!list.length) return [{ index: 0, name: 'Mock voice', lang: 'en-US', offline: true }];
    return list.map((v, index) => ({ index, name: v.name, lang: v.lang, offline: v.localService }));
  },
};
