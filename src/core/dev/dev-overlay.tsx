import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { composition, config, storagePrefix } from '../app/config';
import { getConnector } from '../connectors/registry';
import { useFlags, setFlagOverride } from '../modules/flags';
import { allModules } from '../modules/registry';
import { moduleStatus } from '../modules/status';
import { usePlatform, shell } from '../platform/platform';
import { hasParam } from '../platform/url';
import { Badge } from '../ui/components/card';
import { Button } from '../ui/components/button';
import { cn } from '../ui/cn';
import { toast } from '../ui/toast';
import { closeDevOverlay, useDevOverlay, useLogs } from './store';
import CORE_VERSION from '../VERSION?raw';

type Tab = 'info' | 'modules' | 'flags' | 'storage' | 'logs';
const TABS: Tab[] = ['info', 'modules', 'flags', 'storage', 'logs'];

function InfoTab() {
  const { mode, info, capabilities } = usePlatform();
  return (
    <div className="flex flex-col gap-3 text-sm">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        <dt className="text-muted">App</dt>
        <dd>{config.name} {config.version} ({config.id})</dd>
        <dt className="text-muted">Core</dt>
        <dd>{CORE_VERSION.trim()}</dd>
        <dt className="text-muted">Mode</dt>
        <dd>{mode === 'shell' ? `ProtoShell ${info?.shell.version} (${info?.shell.platform})` : 'mock (browser)'}</dd>
        <dt className="text-muted">URL</dt>
        <dd className="break-all">{location.href}</dd>
      </dl>
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(capabilities).map(([id, ok]) => (
          <Badge key={id} tone={ok ? 'success' : 'danger'}>{id}</Badge>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={() => void shell.reload()}>Reload</Button>
        {mode === 'shell' && <Button size="sm" variant="secondary" onClick={() => void shell.home()}>Shell launcher</Button>}
        {mode === 'shell' && <Button size="sm" variant="secondary" onClick={() => void shell.showMenu()}>Shell menu</Button>}
      </div>
    </div>
  );
}

function ModulesTab() {
  const flags = useFlags((s) => s.values);
  const capabilities = usePlatform((s) => s.capabilities);
  return (
    <ul className="flex flex-col gap-2 text-sm">
      {allModules().map((m) => {
        const status = moduleStatus(m.id, flags, capabilities);
        return (
          <li key={m.id} className="flex items-center gap-2 rounded-xl bg-surface-2 p-2">
            <span>{m.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="font-medium">{m.title} <span className="font-mono text-xs text-muted">{m.id}</span></div>
              {!status.enabled && <div className="text-xs text-danger">{status.reason}</div>}
            </div>
            <a className="text-accent" href={`#/__sandbox/${m.id}`} onClick={closeDevOverlay}>sandbox</a>
          </li>
        );
      })}
    </ul>
  );
}

function FlagsTab() {
  const { values, overrides } = useFlags();
  const names = Object.keys({ ...composition.flags, ...values });
  if (!names.length) return <p className="text-sm text-muted">No flags in app.composition.ts.</p>;
  return (
    <ul className="flex flex-col gap-2 text-sm">
      {names.map((name) => (
        <li key={name} className="flex items-center gap-2 rounded-xl bg-surface-2 p-2">
          <div className="min-w-0 flex-1">
            <div className="font-mono">{name}</div>
            <div className="text-xs text-muted">{composition.flags?.[name]?.description}</div>
          </div>
          <Button size="sm" variant={values[name] ? 'primary' : 'secondary'} onClick={() => void setFlagOverride(name, !values[name])}>
            {values[name] ? 'on' : 'off'}
          </Button>
          {name in overrides && (
            <Button size="sm" variant="ghost" onClick={() => void setFlagOverride(name, null)}>reset</Button>
          )}
        </li>
      ))}
    </ul>
  );
}

function StorageTab() {
  const prefix = `${config.id}.`;
  const [entries, setEntries] = useState<[string, string | null][]>([]);
  const load = async () => {
    const storage = getConnector('storage');
    const keys = await storage.keys(prefix);
    return Promise.all(keys.map(async (k) => [k, await storage.get(k)] as [string, string | null]));
  };
  const refresh = async () => setEntries(await load());
  useEffect(() => {
    let active = true;
    void load().then((e) => active && setEntries(e));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exportAll = async () => {
    const json = JSON.stringify(Object.fromEntries(entries), null, 2);
    await navigator.clipboard?.writeText(json).catch(() => undefined);
    console.info(json);
    toast.success('Copied to clipboard (and logged)');
  };
  const importAll = async () => {
    const raw = window.prompt('Paste exported JSON');
    if (!raw) return;
    const data = JSON.parse(raw) as Record<string, string>;
    for (const [k, v] of Object.entries(data)) if (k.startsWith(prefix)) await getConnector('storage').set(k, v);
    await refresh();
  };
  const clearAll = async () => {
    if (!window.confirm(`Delete all ${entries.length} keys of ${config.id}?`)) return;
    for (const [k] of entries) await getConnector('storage').remove(k);
    await refresh();
  };

  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={() => void exportAll()}>Export</Button>
        <Button size="sm" variant="secondary" onClick={() => void importAll()}>Import</Button>
        <Button size="sm" variant="danger" onClick={() => void clearAll()}>Clear app data</Button>
      </div>
      <p className="text-xs text-muted">Prefix {prefix} · core keys under {storagePrefix()}</p>
      <ul className="flex flex-col gap-1">
        {entries.map(([k, v]) => (
          <li key={k} className="rounded-lg bg-surface-2 p-2">
            <div className="font-mono text-xs">{k.slice(prefix.length)}</div>
            <div className="truncate text-xs text-muted">{v}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LogsTab() {
  const entries = useLogs((s) => s.entries);
  return (
    <ul className="flex flex-col gap-1 font-mono text-xs">
      {entries.length === 0 && <li className="text-muted">No logs yet.</li>}
      {[...entries].reverse().map((e, i) => (
        <li key={i} className={cn('break-words', e.level === 'error' ? 'text-danger' : e.level === 'warn' ? 'text-warning' : 'text-muted')}>
          {new Date(e.at).toLocaleTimeString()} {e.text}
        </li>
      ))}
    </ul>
  );
}

/** Debug panel: long-press any page title, or open the app with ?debug. */
export function DevOverlay() {
  const open = useDevOverlay((s) => s.open);
  const [tab, setTab] = useState<Tab>('info');

  useEffect(() => {
    if (hasParam('debug')) useDevOverlay.setState({ open: true });
  }, []);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col bg-bg" role="dialog" aria-label="Developer tools">
      <div className="pt-safe border-b border-line">
        <div className="px-safe flex h-12 items-center gap-2">
          <h2 className="flex-1 font-semibold">Developer tools</h2>
          <Button size="sm" variant="ghost" onClick={closeDevOverlay}>Close</Button>
        </div>
        <div className="px-safe flex gap-1 overflow-x-auto pb-2">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn('rounded-full px-3 py-1 text-sm capitalize', tab === t ? 'bg-accent text-on-accent' : 'bg-surface-2')}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="px-safe pb-safe flex-1 overflow-y-auto py-3">
        {tab === 'info' && <InfoTab />}
        {tab === 'modules' && <ModulesTab />}
        {tab === 'flags' && <FlagsTab />}
        {tab === 'storage' && <StorageTab />}
        {tab === 'logs' && <LogsTab />}
      </div>
    </div>,
    document.body,
  );
}
