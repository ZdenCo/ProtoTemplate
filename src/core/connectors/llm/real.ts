import { llm } from '@protoshell/sdk';

import { DeviceUnsupportedError } from '../../errors';
import type { LlmApi } from './api';

export const realLlm: LlmApi = {
  availability: () => llm.availability(),
  ensureReady: async (timeoutMs) => {
    try {
      await llm.ensureReady(timeoutMs);
    } catch (error) {
      if (/not supported|unavailable/i.test(String(error))) throw new DeviceUnsupportedError(String(error), error);
      throw error;
    }
  },
  ask: (prompt, options) => llm.ask(prompt, options),
  endSession: (sessionId) => llm.endSession(sessionId),
};
