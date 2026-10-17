import { browserSpeak, browserStopSpeaking, delay, fixture, maybeFail } from '../mock-utils';
import type { NeuralTtsApi, NeuralVoice, SpeechStream } from './api';

// Fixtures: window.__mocks.neuralTts = { downloaded: true, fail }. Speaks through the browser voice.
const VOICES: NeuralVoice[] = [
  { id: 'af_heart', language: 'en-US', gender: 'female' },
  { id: 'am_michael', language: 'en-US', gender: 'male' },
  { id: 'bf_emma', language: 'en-GB', gender: 'female' },
  { id: 'bm_george', language: 'en-GB', gender: 'male' },
  { id: 'ef_dora', language: 'es', gender: 'female' },
  { id: 'ff_siwis', language: 'fr', gender: 'female' },
  { id: 'if_sara', language: 'it', gender: 'female' },
  { id: 'pf_dora', language: 'pt-BR', gender: 'female' },
  { id: 'hf_alpha', language: 'hi', gender: 'female' },
  { id: 'zf_xiaobei', language: 'zh', gender: 'female' },
];

let downloaded = false;
const lang = (voice = 'af_heart') => VOICES.find((v) => v.id === voice)?.language ?? 'en-US';

export const mockNeuralTts: NeuralTtsApi = {
  model: () => ({ id: 'kokoro-v1', name: 'Kokoro 82M v1.0', description: 'Natural voices, ~370 MB.', sizeBytes: 371_280_977 }),
  isDownloaded: async () => fixture('neuralTts', 'downloaded', false) || downloaded,
  async download(onProgress) {
    maybeFail('neuralTts');
    for (let step = 1; step <= 5; step++) {
      await delay(200);
      onProgress?.(step / 5);
    }
    downloaded = true;
  },
  async deleteModel() {
    downloaded = false;
  },
  async prepare(onProgress) {
    if (!(await this.isDownloaded())) await this.download(onProgress);
  },
  voices: (language) => (language ? VOICES.filter((v) => v.language === language) : VOICES),
  speak: (text, { voice, speed } = {}) => browserSpeak(text, { lang: lang(voice), rate: speed }),
  async synthesize(text) {
    await delay(200);
    return { audio: 'data:audio/wav;base64,', durationMs: text.length * 60 };
  },
  stop: async () => browserStopSpeaking(),
  createSpeechStream({ voice, speed } = {}): SpeechStream {
    let buffer = '';
    let cancelled = false;
    return {
      push(piece) {
        if (!cancelled) buffer += piece;
      },
      async end() {
        if (!cancelled && buffer.trim()) await browserSpeak(buffer, { lang: lang(voice), rate: speed });
      },
      async cancel() {
        cancelled = true;
        browserStopSpeaking();
      },
    };
  },
};
