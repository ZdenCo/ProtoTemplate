import { useCallback, useMemo, useRef, useState } from 'react';

import { useCapability } from '../../connectors/hooks';
import { getConnector } from '../../connectors/registry';
import type { NeuralVoiceLanguage, SpeechStream } from '../../connectors/neuralTts';
import { errorMessage } from '../../errors';
import { useModelDownload } from '../models';
import type { ModelDownload } from '../models';

const NEURAL_LANGUAGES: Record<string, NeuralVoiceLanguage> = {
  'en-US': 'en-US', en: 'en-US', 'en-GB': 'en-GB', es: 'es', 'es-ES': 'es', fr: 'fr', 'fr-FR': 'fr',
  hi: 'hi', 'hi-IN': 'hi', it: 'it', 'it-IT': 'it', 'pt-BR': 'pt-BR', zh: 'zh', 'zh-CN': 'zh',
};

export interface Voice {
  /** Kokoro download state (only relevant when `natural` and the language is supported). */
  neuralModel: ModelDownload;
  /** True when speech goes through the natural Kokoro voice. */
  usesNeural: boolean;
  listening: boolean;
  /** Live transcript of the current/last listen(). */
  transcript: string;
  listen(): Promise<string>;
  stopListening(): Promise<void>;
  speaking: boolean;
  speak(text: string): Promise<void>;
  /** Speak streamed text (LLM tokens) sentence by sentence; falls back to speaking at end(). */
  speechStream(): SpeechStream;
  stopSpeaking(): Promise<void>;
  error?: string;
}

/**
 * Listen (speech to text) and speak. Speaks with the natural Kokoro voice when `natural` is set,
 * the language is supported and the model is downloaded; otherwise with the system voice.
 */
export function useVoice({ language = 'en-US', natural = true, voice }: { language?: string; natural?: boolean; voice?: string } = {}): Voice {
  const speech = getConnector('speech');
  const neural = getConnector('neuralTts');
  const tts = getConnector('tts');
  // neuralTts is optional: without it (or for unsupported languages) the system voice speaks.
  const hasNeural = useCapability('neuralTts');
  const model = hasNeural ? neural.model() : { name: 'Natural voice', sizeBytes: 0 };
  const neuralModel = useModelDownload({
    name: model.name,
    sizeBytes: model.sizeBytes,
    isDownloaded: async () => hasNeural && neural.isDownloaded(),
    download: (onProgress) => neural.download(onProgress),
    deleteModel: () => neural.deleteModel(),
  });
  const neuralLanguage = NEURAL_LANGUAGES[language];
  const usesNeural = hasNeural && natural && !!neuralLanguage && neuralModel.state === 'ready';
  const neuralVoice = voice ?? (hasNeural && neuralLanguage ? neural.voices(neuralLanguage)[0]?.id : undefined);

  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string>();
  const prepared = useRef(false);

  const listen = useCallback(async () => {
    setListening(true);
    setTranscript('');
    setError(undefined);
    try {
      const text = await speech.listen({ language }, setTranscript);
      setTranscript(text);
      return text;
    } catch (e) {
      setError(errorMessage(e));
      throw e;
    } finally {
      setListening(false);
    }
  }, [speech, language]);

  const stopListening = useCallback(() => speech.stop(), [speech]);

  const speak = useCallback(
    async (text: string) => {
      setSpeaking(true);
      try {
        if (usesNeural) {
          if (!prepared.current) {
            await neural.prepare();
            prepared.current = true;
          }
          await neural.speak(text, { voice: neuralVoice });
        } else {
          await tts.speak(text, { lang: language });
        }
      } finally {
        setSpeaking(false);
      }
    },
    [usesNeural, neural, neuralVoice, tts, language],
  );

  const speechStream = useCallback((): SpeechStream => {
    if (usesNeural) {
      setSpeaking(true);
      let stream: SpeechStream | null = null;
      const pending: string[] = [];
      const ready = (prepared.current ? Promise.resolve() : neural.prepare()).then(() => {
        prepared.current = true;
        stream = neural.createSpeechStream({ voice: neuralVoice });
        for (const piece of pending.splice(0)) stream.push(piece);
      });
      return {
        push: (piece) => (stream ? stream.push(piece) : pending.push(piece)),
        end: async () => {
          await ready;
          await stream!.end().finally(() => setSpeaking(false));
        },
        cancel: async () => {
          await ready;
          await stream!.cancel().finally(() => setSpeaking(false));
        },
      };
    }
    let buffer = '';
    return {
      push: (piece) => void (buffer += piece),
      end: () => speak(buffer),
      cancel: () => tts.stop(),
    };
  }, [usesNeural, neural, neuralVoice, speak, tts]);

  const stopSpeaking = useCallback(async () => {
    await Promise.allSettled([hasNeural ? neural.stop() : null, tts.stop()]);
    setSpeaking(false);
  }, [hasNeural, neural, tts]);

  return useMemo(
    () => ({ neuralModel, usesNeural, listening, transcript, listen, stopListening, speaking, speak, speechStream, stopSpeaking, error }),
    [neuralModel, usesNeural, listening, transcript, listen, stopListening, speaking, speak, speechStream, stopSpeaking, error],
  );
}
