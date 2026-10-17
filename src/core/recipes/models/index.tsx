import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { errorMessage } from '../../errors';
import { AsyncButton } from '../../ui/components/button';
import { Card } from '../../ui/components/card';
import { ErrorState, ProgressBar } from '../../ui/components/states';

export type ModelState = 'checking' | 'missing' | 'downloading' | 'ready' | 'error';

export interface ModelSource {
  name: string;
  sizeBytes: number;
  isDownloaded(): Promise<boolean>;
  download(onProgress: (fraction: number) => void): Promise<void>;
  deleteModel?(): Promise<void>;
}

export interface ModelDownload {
  state: ModelState;
  /** 0..1 while downloading. */
  progress: number;
  error?: string;
  download(): Promise<void>;
  remove(): Promise<void>;
  refresh(): Promise<void>;
}

/** Tracks whether an on-demand model is on the device and downloads it with progress. */
export function useModelDownload(source: ModelSource): ModelDownload {
  const [state, setState] = useState<ModelState>('checking');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>();

  const refresh = useCallback(async () => {
    try {
      setState((await source.isDownloaded()) ? 'ready' : 'missing');
    } catch (e) {
      setError(errorMessage(e));
      setState('error');
    }
    // `source` is usually an inline object; identity changes must not re-check.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source.name]);

  useEffect(() => {
    let active = true;
    source
      .isDownloaded()
      .then((downloaded) => active && setState(downloaded ? 'ready' : 'missing'))
      .catch((e: unknown) => {
        if (!active) return;
        setError(errorMessage(e));
        setState('error');
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source.name]);

  const download = useCallback(async () => {
    setState('downloading');
    setProgress(0);
    setError(undefined);
    try {
      await source.download(setProgress);
      setState('ready');
    } catch (e) {
      setError(errorMessage(e));
      setState('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source.name]);

  const remove = useCallback(async () => {
    await source.deleteModel?.();
    await refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source.name, refresh]);

  return { state, progress, error, download, remove, refresh };
}

export const formatBytes = (bytes: number) =>
  bytes >= 1e9 ? `${(bytes / 1e9).toFixed(1)} GB` : bytes >= 1e6 ? `${Math.round(bytes / 1e6)} MB` : `${Math.round(bytes / 1e3)} KB`;

/**
 * Asks before downloading a large model, shows progress, and renders `children` once ready.
 *
 *   <ModelGate download={vision.model} name="Qwen3-VL 2B" sizeBytes={1.6e9}>…feature UI…</ModelGate>
 */
export function ModelGate({ download, name, sizeBytes, children }: { download: ModelDownload; name: string; sizeBytes: number; children: ReactNode }) {
  if (download.state === 'ready') return <>{children}</>;
  return (
    <Card icon="📦" title={name} subtitle={`One-time download, ${formatBytes(sizeBytes)}. Works offline afterwards. Use Wi-Fi.`}>
      {download.state === 'downloading' && <ProgressBar value={download.progress} label="Downloading" />}
      {download.state === 'error' && <ErrorState title="Download failed" message={download.error} />}
      {(download.state === 'missing' || download.state === 'error') && (
        <AsyncButton block icon="⬇️" onClick={download.download}>
          Download
        </AsyncButton>
      )}
      {download.state === 'checking' && <ProgressBar label="Checking…" />}
    </Card>
  );
}
