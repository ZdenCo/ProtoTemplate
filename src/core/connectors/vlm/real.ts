import { vlm } from '@protoshell/sdk';

import type { VlmApi, VlmResult } from './api';

const result = (r: vlm.GenerateResult): VlmResult => ({
  text: r.text,
  tokensPerSecond: r.tokensPerSecond,
  cancelled: r.cancelled,
  truncated: r.truncated,
});

export const realVlm: VlmApi = {
  models: () => Object.values(vlm.VLM_MODELS).map(({ id, name, description, sizeBytes }) => ({ id, name, description, sizeBytes })),
  isDownloaded: (id) => vlm.isDownloaded(id),
  download: (id, onProgress) => vlm.download(id, onProgress && (({ fraction }) => onProgress(fraction))),
  deleteModel: (id) => vlm.LocalVLM.deleteModel({ modelId: id }),
  loadedModel: async () => (await vlm.LocalVLM.getStatus()).loadedModel?.modelId ?? null,
  load: async (id) => void (await vlm.load(id)),
  unload: () => vlm.unload(),
  ask: async (prompt, { images, system, ...options } = {}, onToken) => {
    const messages: vlm.ChatMessage[] = [];
    if (system) messages.push({ role: 'system', content: system });
    messages.push({ role: 'user', content: prompt, images });
    return result(await vlm.generate({ ...options, messages }, onToken));
  },
  chat: async (messages, options, onToken) => result(await vlm.generate({ ...options, messages }, onToken)),
  cancel: () => vlm.cancel(),
};
