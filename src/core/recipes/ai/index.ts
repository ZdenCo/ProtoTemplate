import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getConnector } from '../../connectors/registry';
import type { LlmAvailability } from '../../connectors/llm';
import { errorMessage } from '../../errors';

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

/** Availability of the OS LLM; 'checking' until known. */
export function useAiStatus(): LlmAvailability | 'checking' {
  const [status, setStatus] = useState<LlmAvailability | 'checking'>('checking');
  useEffect(() => {
    let active = true;
    getConnector('llm')
      .availability()
      .then((s) => active && setStatus(s))
      .catch(() => active && setStatus('unavailable'));
    return () => {
      active = false;
    };
  }, []);
  return status;
}

export interface AiChat {
  messages: ChatMessage[];
  busy: boolean;
  error?: string;
  /** Sends a user message; resolves with the answer. */
  send(text: string): Promise<string>;
  /** Clears history and starts a new model session. */
  reset(): void;
}

/**
 * Multi-turn chat with the on-device OS model (Apple Intelligence / Gemini Nano).
 * Prepares the model on the first message. Answers arrive whole (no streaming).
 */
export function useAiChat({ instructions, maxTokens, temperature }: { instructions?: string; maxTokens?: number; temperature?: number } = {}): AiChat {
  const llm = getConnector('llm');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const session = useRef(crypto.randomUUID());
  const ready = useRef(false);

  useEffect(() => () => void llm.endSession(session.current).catch(() => undefined), [llm]);

  const send = useCallback(
    async (text: string) => {
      setBusy(true);
      setError(undefined);
      setMessages((m) => [...m, { role: 'user', text }]);
      try {
        if (!ready.current) {
          await llm.ensureReady();
          ready.current = true;
        }
        const answer = await llm.ask(text, { sessionId: session.current, instructions, maxTokens, temperature });
        setMessages((m) => [...m, { role: 'assistant', text: answer }]);
        return answer;
      } catch (e) {
        setError(errorMessage(e));
        throw e;
      } finally {
        setBusy(false);
      }
    },
    [llm, instructions, maxTokens, temperature],
  );

  const reset = useCallback(() => {
    void llm.endSession(session.current).catch(() => undefined);
    session.current = crypto.randomUUID();
    setMessages([]);
    setError(undefined);
  }, [llm]);

  return useMemo(() => ({ messages, busy, error, send, reset }), [messages, busy, error, send, reset]);
}
