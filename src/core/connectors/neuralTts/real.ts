import { neuralTts } from '@protoshell/sdk';

import type { NeuralTtsApi } from './api';

const preset = neuralTts.TTS_MODELS[neuralTts.DEFAULT_MODEL];

export const realNeuralTts: NeuralTtsApi = {
  model: () => ({ id: preset.id, name: preset.name, description: preset.description, sizeBytes: preset.sizeBytes }),
  isDownloaded: () => neuralTts.isDownloaded(),
  download: (onProgress) => neuralTts.download(undefined, onProgress && (({ fraction }) => onProgress(fraction))),
  deleteModel: () => neuralTts.NeuralTTS.deleteModel({ modelId: preset.id }),
  prepare: (onProgress) => neuralTts.prepare(undefined, onProgress && (({ fraction }) => onProgress(fraction))),
  voices: (language) => neuralTts.voices(language).map(({ id, language: lang, gender }) => ({ id, language: lang, gender })),
  speak: async (text, options) => void (await neuralTts.speak(text, options)),
  synthesize: async (text, options) => {
    const { audio, durationMs } = await neuralTts.synthesize(text, options);
    return { audio, durationMs };
  },
  stop: () => neuralTts.stop(),
  createSpeechStream: (options) => neuralTts.createSpeechStream(options),
};
