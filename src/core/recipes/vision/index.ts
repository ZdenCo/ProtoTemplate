import { useCallback, useMemo, useState } from 'react';

import type { Photo } from '../../connectors/camera';
import { getConnector } from '../../connectors/registry';
import type { VlmModelId } from '../../connectors/vlm';
import { errorMessage } from '../../errors';
import { useModelDownload } from '../models';
import type { ModelDownload } from '../models';

export interface Vision {
  /** Download state of the vision model; render <ModelGate download={vision.model} …> around the UI. */
  model: ModelDownload;
  modelInfo: { name: string; sizeBytes: number };
  photo: Photo | null;
  setPhoto(photo: Photo | null): void;
  takePhoto(): Promise<Photo>;
  pickPhoto(): Promise<Photo>;
  /** Asks about the current photo (or text only without one); streams into `answer`. */
  ask(prompt: string, options?: { maxTokens?: number; system?: string }): Promise<string>;
  answer: string;
  streaming: boolean;
  error?: string;
  cancel(): Promise<void>;
}

/** Photo + question + streamed answer with the on-device Qwen3-VL model. */
export function useVision({ model = 'qwen3-vl-2b', maxSize = 1280 }: { model?: VlmModelId; maxSize?: number } = {}): Vision {
  const vlm = getConnector('vlm');
  const camera = getConnector('camera');
  const info = useMemo(() => vlm.models().find((m) => m.id === model)!, [vlm, model]);
  const download = useModelDownload({
    name: info.name,
    sizeBytes: info.sizeBytes,
    isDownloaded: () => vlm.isDownloaded(model),
    download: (onProgress) => vlm.download(model, onProgress),
    deleteModel: () => vlm.deleteModel(model),
  });
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [answer, setAnswer] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string>();

  const takePhoto = useCallback(async () => {
    const p = await camera.takePhoto({ maxSize });
    setPhoto(p);
    setAnswer('');
    return p;
  }, [camera, maxSize]);

  const pickPhoto = useCallback(async () => {
    const [p] = await camera.pickPhotos({ maxSize });
    setPhoto(p!);
    setAnswer('');
    return p!;
  }, [camera, maxSize]);

  const ask = useCallback(
    async (prompt: string, { maxTokens = 256, system }: { maxTokens?: number; system?: string } = {}) => {
      setStreaming(true);
      setAnswer('');
      setError(undefined);
      try {
        if ((await vlm.loadedModel()) !== model) await vlm.load(model);
        const result = await vlm.ask(prompt, { images: photo ? [photo.uri] : undefined, system, maxTokens }, (piece) =>
          setAnswer((a) => a + piece),
        );
        setAnswer(result.text);
        return result.text;
      } catch (e) {
        setError(errorMessage(e));
        throw e;
      } finally {
        setStreaming(false);
      }
    },
    [vlm, model, photo],
  );

  const cancel = useCallback(() => vlm.cancel(), [vlm]);

  return useMemo(
    () => ({ model: download, modelInfo: info, photo, setPhoto, takePhoto, pickPhoto, ask, answer, streaming, error, cancel }),
    [download, info, photo, takePhoto, pickPhoto, ask, answer, streaming, error, cancel],
  );
}
