import { delay, fixture, maybeFail, streamText } from '../mock-utils';
import type { DownloadableModel, VlmApi, VlmModelId } from './api';

// Fixtures: window.__mocks.vlm = { reply, downloaded: true, fail }
// Downloads take ~2 s in the browser; state lives in memory (reload = not downloaded) unless `downloaded`.
const MODELS: DownloadableModel[] = [
  { id: 'qwen3-vl-2b', name: 'Qwen3-VL 2B Instruct', description: 'Fast, ~1.6 GB. Good for OCR, captions, simple visual Q&A.', sizeBytes: 1_552_000_000 },
  { id: 'qwen3-vl-4b', name: 'Qwen3-VL 4B Instruct', description: 'Better reasoning, ~3 GB. Needs a device with 8 GB+ RAM.', sizeBytes: 2_950_000_000 },
];

const downloaded = new Set<string>();
let loaded: string | null = null;
let cancelled = false;

async function generate(prompt: string, imageCount: number, onToken?: (piece: string) => void) {
  await delay(500);
  maybeFail('vlm');
  cancelled = false;
  const about = imageCount ? `I see ${imageCount} image(s): a mock photo with a coloured background and a label.` : '';
  const text = fixture('vlm', 'reply', `${about} Mock vision answer to "${prompt.slice(0, 60)}".`.trim());
  let out = '';
  await streamText(text, (piece) => {
    if (cancelled) return;
    out += piece;
    onToken?.(piece);
  });
  if (!onToken) out = text;
  return { text: out, tokensPerSecond: 18.5, cancelled, truncated: false };
}

export const mockVlm: VlmApi = {
  models: () => MODELS,
  isDownloaded: async (id) => fixture('vlm', 'downloaded', false) || downloaded.has(id),
  async download(id: VlmModelId, onProgress) {
    maybeFail('vlm');
    for (let step = 1; step <= 10; step++) {
      await delay(200);
      onProgress?.(step / 10);
    }
    downloaded.add(id);
  },
  async deleteModel(id) {
    downloaded.delete(id);
    if (loaded === id) loaded = null;
  },
  loadedModel: async () => loaded,
  async load(id) {
    await delay(700);
    loaded = id;
  },
  async unload() {
    loaded = null;
  },
  ask: (prompt, { images } = {}, onToken) => generate(prompt, images?.length ?? 0, onToken),
  chat: (messages, _options, onToken) => {
    const last = messages.filter((m) => m.role === 'user').at(-1);
    return generate(last?.content ?? '', last?.images?.length ?? 0, onToken);
  },
  async cancel() {
    cancelled = true;
  },
};
