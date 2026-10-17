import { useCallback, useMemo } from 'react';

import { getConnector } from '../../connectors/registry';
import type { ScanResult } from '../../connectors/qr';
import { useStoredState } from '../../modules/hooks';

export interface ScanEntry extends ScanResult {
  at: number;
}

export interface Scanner {
  /** Opens the scanner; haptic tick on success; adds to history. Rejects with UserCancelledError on close. */
  scan(): Promise<ScanEntry>;
  last: ScanEntry | null;
  /** Newest first, persisted per module. */
  history: ScanEntry[];
  clearHistory(): void;
}

/** QR / barcode scanning with haptic feedback and a persisted history. */
export function useScanner({ anyFormat = false, instructions, historySize = 50 }: { anyFormat?: boolean; instructions?: string; historySize?: number } = {}): Scanner {
  const qr = getConnector('qr');
  const haptics = getConnector('haptics');
  const [history, setHistory] = useStoredState<ScanEntry[]>('scanHistory', []);

  const scan = useCallback(async () => {
    const result = await qr.scan({ anyFormat, instructions });
    void haptics.notify('success').catch(() => undefined);
    const entry = { ...result, at: Date.now() };
    setHistory((h) => [entry, ...h].slice(0, historySize));
    return entry;
  }, [qr, haptics, anyFormat, instructions, historySize, setHistory]);

  const clearHistory = useCallback(() => setHistory([]), [setHistory]);

  return useMemo(() => ({ scan, last: history[0] ?? null, history, clearHistory }), [scan, history, clearHistory]);
}
