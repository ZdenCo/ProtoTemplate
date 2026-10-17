import { delay, fixture, maybeFail } from '../mock-utils';
import type { LlmApi, LlmAvailability } from './api';

// Fixtures: window.__mocks.llm = { reply: 'fixed answer', availability: 'available', fail }
const turns = new Map<string, number>();

export const mockLlm: LlmApi = {
  availability: async () => fixture<LlmAvailability>('llm', 'availability', 'available'),
  async ensureReady() {
    await delay(200);
    maybeFail('llm');
  },
  async ask(prompt, { sessionId } = {}) {
    await delay(800);
    maybeFail('llm');
    const turn = sessionId ? (turns.get(sessionId) ?? 0) + 1 : 1;
    if (sessionId) turns.set(sessionId, turn);
    const preview = prompt.length > 80 ? `${prompt.slice(0, 80)}…` : prompt;
    return fixture('llm', 'reply', `Mock answer (turn ${turn}) to: "${preview}". The on-device model replies here inside ProtoShell.`);
  },
  async endSession(sessionId) {
    turns.delete(sessionId);
  },
};
