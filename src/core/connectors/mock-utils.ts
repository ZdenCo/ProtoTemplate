import { CoreError, UserCancelledError } from '../errors';

/** Reads a fixture from `window.__mocks[connector][key]`, falling back to `fallback`. */
export function fixture<T>(connector: string, key: string, fallback: T): T {
  const scope = window.__mocks?.[connector] as Record<string, unknown> | undefined;
  return scope && key in scope ? (scope[key] as T) : fallback;
}

/** Simulated latency so loading states are visible; 0 under Vitest. */
export function delay(ms = 300): Promise<void> {
  const wait = import.meta.env.MODE === 'test' ? 0 : ms;
  return new Promise((resolve) => setTimeout(resolve, wait));
}

/** Throws if the test set `window.__mocks[connector].fail` (string message or 'cancel'). */
export function maybeFail(connector: string): void {
  const fail = fixture<string | undefined>(connector, 'fail', undefined);
  if (!fail) return;
  if (fail === 'cancel') throw new UserCancelledError('Cancelled (mock)');
  throw new CoreError(fail);
}

/** Streams `text` word by word to `onToken`. */
export async function streamText(text: string, onToken?: (piece: string) => void, ms = 40): Promise<void> {
  if (!onToken) return;
  for (const piece of text.match(/\S+\s*/g) ?? []) {
    await delay(ms);
    onToken(piece);
  }
}

/** A small SVG placeholder image as a data URL (used for mock photos). */
export function placeholderImage(label = 'Mock photo', hue = 210): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="100%" height="100%" fill="hsl(${hue},45%,35%)"/><text x="50%" y="50%" fill="#fff" font-family="sans-serif" font-size="36" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** Speaks through the browser's speechSynthesis (not under tests); otherwise waits ~60 ms per word. */
export async function browserSpeak(text: string, { lang = 'en-US', rate = 1, pitch = 1 } = {}): Promise<void> {
  const synth = import.meta.env.MODE !== 'test' && 'speechSynthesis' in window ? window.speechSynthesis : null;
  if (!synth) return delay(Math.min(3000, text.split(/\s+/).length * 60));
  synth.cancel();
  await new Promise<void>((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    Object.assign(utterance, { lang, rate, pitch, onend: () => resolve(), onerror: () => resolve() });
    synth.speak(utterance);
  });
}

export function browserStopSpeaking(): void {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}
