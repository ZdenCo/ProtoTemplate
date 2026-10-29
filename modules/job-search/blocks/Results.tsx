import { useCallback, useEffect, useMemo, useState } from 'react';
import { useEvent, useModuleSettings, useNav, useStoredState } from '@core';
import { Badge, Button, Card, EmptyState, Input, Row, Select, Sheet, Spinner, Stack, Text } from '@core/ui';
import { deduplicateJobs } from '../lib/deduplicate';
import { createMockSources } from '../lib/mock-sources';
import { scoreJob } from '../lib/scoring';
import { generateSearchQuery } from '../lib/synonyms';
import type { MergedJob, ProfileData } from '../types';

const INITIAL_PROFILE: ProfileData = {
  name: 'Jan Novák',
  desiredRole: 'Frontend Developer',
  extraKeywords: ['React', 'TypeScript'],
  skills: ['React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Next.js'],
  languages: ['Čeština', 'Angličtina'],
  preferredLocations: ['Praha', 'Brno'],
  remotePreference: 'hybrid',
  minSalary: 70000,
};

interface SourceStatus {
  id: string;
  name: string;
  loading: boolean;
  error?: string;
  count?: number;
}

export default function JobResults() {
  const [profile, setProfile] = useStoredState<ProfileData>('cachedProfile', INITIAL_PROFILE);
  const [savedJobIds, setSavedJobIds] = useStoredState<string[]>('savedJobIds', []);
  const [hiddenJobIds, setHiddenJobIds] = useStoredState<string[]>('hiddenJobIds', []);
  const [settings] = useModuleSettings<{ failSource: { type: 'select'; default: string; options: { value: string; label: string }[] } }>();

  const [rawJobs, setRawJobs] = useState<MergedJob[]>([]);
  const [sourceStatuses, setSourceStatuses] = useState<SourceStatus[]>([
    { id: 'jobs.cz', name: 'jobs.cz', loading: true },
    { id: 'prace.cz', name: 'prace.cz', loading: true },
    { id: 'startupjobs.cz', name: 'startupjobs.cz', loading: true },
  ]);

  const [selectedJob, setSelectedJob] = useState<MergedJob | null>(null);

  // Filters & Sorting state
  const [sourceFilter, setSourceFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [remoteFilter, setRemoteFilter] = useState('all');
  const [minScoreFilter, setMinScoreFilter] = useState(0);
  const [sortBy, setSortBy] = useState<'score' | 'salary' | 'newest'>('score');
  const [showFilters, setShowFilters] = useState(false);

  const nav = useNav();

  useEvent('profile:changed', (newProfile) => {
    setProfile(newProfile);
  });

  const runSearch = useCallback(async () => {
    if (!profile || !profile.desiredRole?.trim()) {
      setRawJobs([]);
      setSourceStatuses((prev) => prev.map((s) => ({ ...s, loading: false, count: 0 })));
      return;
    }

    const query = generateSearchQuery(profile.desiredRole, profile.extraKeywords);
    const sources = createMockSources(settings.failSource);

    setSourceStatuses(
      sources.map((s) => ({
        id: s.id,
        name: s.name,
        loading: true,
        error: undefined,
      })),
    );

    const promises = sources.map(async (source) => {
      try {
        const jobs = await source.search(query);
        setSourceStatuses((prev) =>
          prev.map((s) => (s.id === source.id ? { ...s, loading: false, count: jobs.length } : s)),
        );
        return jobs;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Chyba připojení';
        setSourceStatuses((prev) =>
          prev.map((s) => (s.id === source.id ? { ...s, loading: false, error: message } : s)),
        );
        return [];
      }
    });

    const results = await Promise.all(promises);
    const flattened = results.flat();
    const deduplicated = deduplicateJobs(flattened);

    const scored = deduplicated.map((job) => {
      const { score, matchReasons } = scoreJob(job, profile);
      return { ...job, score, matchReasons };
    });

    setRawJobs(scored);
  }, [profile, settings.failSource]);

  useEffect(() => {
    void runSearch();
  }, [runSearch]);

  const toggleSave = (jobId: string) => {
    setSavedJobIds((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId],
    );
  };

  const hideJob = (jobId: string) => {
    setHiddenJobIds((prev) => [...prev, jobId]);
    if (selectedJob?.id === jobId) setSelectedJob(null);
  };

  const locationsList = useMemo(() => {
    const set = new Set<string>();
    for (const j of rawJobs) {
      const city = j.location.split(' ')[0] || j.location;
      set.add(city);
    }
    return Array.from(set).sort();
  }, [rawJobs]);

  const filteredAndSortedJobs = useMemo(() => {
    const list = rawJobs.filter((job) => {
      if (hiddenJobIds.includes(job.id)) return false;
      if (sourceFilter !== 'all' && !job.sources.includes(sourceFilter)) return false;
      if (locationFilter !== 'all' && !job.location.includes(locationFilter)) return false;
      if (remoteFilter !== 'all' && job.remote !== remoteFilter) return false;
      if (job.score !== undefined && job.score < minScoreFilter) return false;
      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === 'score') {
        return (b.score ?? 0) - (a.score ?? 0);
      }
      if (sortBy === 'salary') {
        const salA = a.salaryMax || a.salaryMin || 0;
        const salB = b.salaryMax || b.salaryMin || 0;
        return salB - salA;
      }
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    });
  }, [rawJobs, hiddenJobIds, sourceFilter, locationFilter, remoteFilter, minScoreFilter, sortBy]);

  if (!profile.desiredRole?.trim()) {
    return (
      <EmptyState
        icon="👤"
        title="Zatím nemáte nastavený profil"
        message="Vyplňte hledanou roli a dovednosti na záložce Profil pro zobrazení vhodných nabídek."
        action={
          <Button variant="primary" onClick={() => nav.toPage('profile')}>
            Přejít do Profilu
          </Button>
        }
      />
    );
  }

  const anyLoading = sourceStatuses.some((s) => s.loading);

  return (
    <Stack className="gap-4">
      {/* Sources status bar */}
      <div className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-3">
        <div className="flex items-center justify-between">
          <Text small className="font-semibold">Zdroje nabídek</Text>
          <Button size="sm" variant="ghost" onClick={() => void runSearch()} loading={anyLoading}>
            Obnovit
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {sourceStatuses.map((st) => (
            <div
              key={st.id}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-2/60 px-2.5 py-1 text-xs"
            >
              <span className="font-medium text-text">{st.name}</span>
              {st.loading ? (
                <Spinner className="size-3 text-muted" />
              ) : st.error ? (
                <Badge tone="danger">Chyba</Badge>
              ) : (
                <span className="inline-flex items-center rounded-full bg-secondary text-on-secondary px-1.5 py-0.2 text-[10px] font-semibold">
                  {st.count ?? 0}
                </span>
              )}
            </div>
          ))}
        </div>
        {sourceStatuses.some((s) => s.error) && (
          <div role="alert" className="mt-1 rounded-lg border border-danger/30 bg-danger/10 p-2 text-xs text-danger">
            {sourceStatuses.find((s) => s.error)?.error} (ostatní zdroje fungují normálně)
          </div>
        )}
      </div>

      {/* Controls: Filter toggle and Sort */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Row className="gap-2">
          <Button
            size="sm"
            variant={showFilters ? 'primary' : 'secondary'}
            onClick={() => setShowFilters((v) => !v)}
          >
            Filtry {showFilters ? '▲' : '▼'}
          </Button>
          <Text small muted>
            Nalezeno {filteredAndSortedJobs.length} nabídek
          </Text>
        </Row>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted">Řadit:</span>
          <Select
            className="w-auto h-9 text-xs px-2 py-1 rounded-lg"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'score' | 'salary' | 'newest')}
            options={[
              { value: 'score', label: 'Nejlepší shoda' },
              { value: 'salary', label: 'Nejvyšší plat' },
              { value: 'newest', label: 'Nejnovější' },
            ]}
          />
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <Card className="p-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted">Portál</label>
              <Select
                className="text-xs h-9 py-1 px-2"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Všechny portály' },
                  { value: 'jobs.cz', label: 'jobs.cz' },
                  { value: 'prace.cz', label: 'prace.cz' },
                  { value: 'startupjobs.cz', label: 'startupjobs.cz' },
                ]}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted">Město</label>
              <Select
                className="text-xs h-9 py-1 px-2"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Všechna města' },
                  ...locationsList.map((loc) => ({ value: loc, label: loc })),
                ]}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted">Režim práce</label>
              <Select
                className="text-xs h-9 py-1 px-2"
                value={remoteFilter}
                onChange={(e) => setRemoteFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Jakýkoliv' },
                  { value: 'remote', label: 'Pouze remote' },
                  { value: 'hybrid', label: 'Pouze hybrid' },
                  { value: 'onsite', label: 'Pouze onsite' },
                ]}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted">Minimální shoda: {minScoreFilter}%</label>
              <Input
                type="range"
                min="0"
                max="90"
                step="10"
                value={minScoreFilter}
                onChange={(e) => setMinScoreFilter(Number(e.target.value))}
                className="accent-accent"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Results list */}
      {filteredAndSortedJobs.length === 0 ? (
        anyLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Spinner className="size-6 text-accent" />
            <Text muted small>Vyhledávám a porovnávám nabídky...</Text>
          </div>
        ) : (
          <EmptyState
            icon="🔍"
            title="Nenalezeny žádné nabídky"
            message="Zkuste uvolnit filtry nebo upravit hledanou roli v Profilu."
          />
        )
      ) : (
        <Stack className="gap-3">
          {filteredAndSortedJobs.map((job) => {
            const isSaved = savedJobIds.includes(job.id);
            const scoreVal = job.score ?? 50;

            return (
              <Card
                key={job.id}
                onPress={() => setSelectedJob(job)}
                className="transition active:scale-[0.99]"
                title={
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-base font-semibold leading-snug">{job.title}</span>
                    <span className="shrink-0 inline-flex items-center rounded-full bg-accent text-on-accent px-2.5 py-0.5 text-xs font-bold">
                      {scoreVal}% shoda
                    </span>
                  </div>
                }
                subtitle={`${job.company} • ${job.location}`}
                actions={
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      aria-label={isSaved ? 'Odebrat z uložených' : 'Uložit nabídku'}
                      className="p-1.5 text-base hover:opacity-80 transition"
                      onClick={() => toggleSave(job.id)}
                    >
                      {isSaved ? '⭐' : '☆'}
                    </button>
                    <button
                      type="button"
                      aria-label="Skrýt nabídku"
                      className="p-1.5 text-xs text-muted hover:text-danger transition"
                      onClick={() => hideJob(job.id)}
                    >
                      ✕
                    </button>
                  </div>
                }
              >
                {/* Salary & remote & sources */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {job.salaryText ? (
                    <Badge tone="success">{job.salaryText}</Badge>
                  ) : job.salaryMin ? (
                    <Badge tone="success">
                      {job.salaryMin.toLocaleString('cs-CZ')}
                      {job.salaryMax ? ` – ${job.salaryMax.toLocaleString('cs-CZ')}` : ''} Kč
                    </Badge>
                  ) : (
                    <Badge tone="neutral">Plat neuveden</Badge>
                  )}

                  <Badge tone={job.remote === 'remote' ? 'accent' : 'neutral'}>
                    {job.remote === 'remote' ? 'Remote' : job.remote === 'hybrid' ? 'Hybrid' : 'Onsite'}
                  </Badge>

                  {job.sources.map((src) => (
                    <span
                      key={src}
                      className="inline-flex items-center rounded-full bg-secondary text-on-secondary px-2 py-0.5 text-[11px] font-medium"
                    >
                      {src}
                    </span>
                  ))}
                </div>

                {/* Tags up to 3 */}
                {job.tags.length > 0 && (
                  <Row className="gap-1">
                    {job.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-line bg-surface-2 px-2 py-0.5 text-xs text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                    {job.tags.length > 3 && (
                      <span className="text-xs text-muted">+{job.tags.length - 3}</span>
                    )}
                  </Row>
                )}

                {/* Match reasons */}
                {job.matchReasons && job.matchReasons.length > 0 && (
                  <div className="rounded-lg bg-surface-2/60 p-2 text-xs text-muted flex flex-col gap-1">
                    <span className="font-medium text-text text-[11px]">Proč odpovídá:</span>
                    <ul className="list-inside list-disc space-y-0.5">
                      {job.matchReasons.slice(0, 3).map((reason, i) => (
                        <li key={i} className="truncate">
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Detail Bottom Sheet */}
      <Sheet
        open={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        title={selectedJob?.title}
      >
        {selectedJob && (
          <Stack className="gap-4">
            <div>
              <p className="text-base font-semibold text-text">{selectedJob.company}</p>
              <p className="text-sm text-muted">{selectedJob.location}</p>
            </div>

            <Row className="gap-1.5">
              <span className="inline-flex items-center rounded-full bg-accent text-on-accent px-2.5 py-0.5 text-xs font-bold">
                {selectedJob.score ?? 50}% shoda
              </span>
              <Badge tone="neutral">
                {selectedJob.remote === 'remote' ? 'Remote' : selectedJob.remote === 'hybrid' ? 'Hybrid' : 'Onsite'}
              </Badge>
              {selectedJob.salaryText ? (
                <Badge tone="success">{selectedJob.salaryText}</Badge>
              ) : selectedJob.salaryMin ? (
                <Badge tone="success">{selectedJob.salaryMin.toLocaleString('cs-CZ')} Kč+</Badge>
              ) : null}
            </Row>

            {selectedJob.matchReasons && selectedJob.matchReasons.length > 0 && (
              <div className="rounded-xl border border-line bg-surface-2/40 p-3">
                <p className="mb-1 text-xs font-semibold text-text">Důvody shody s vaším profilem:</p>
                <ul className="list-inside list-disc space-y-1 text-xs text-muted">
                  {selectedJob.matchReasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <p className="mb-1 text-xs font-semibold text-text">Popis pozice:</p>
              <p className="text-sm text-muted whitespace-pre-wrap leading-relaxed">
                {selectedJob.description}
              </p>
            </div>

            {selectedJob.tags.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-semibold text-text">Technologie a požadavky:</p>
                <Row className="gap-1.5">
                  {selectedJob.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-xs text-text"
                    >
                      {t}
                    </span>
                  ))}
                </Row>
              </div>
            )}

            <div>
              <p className="mb-2 text-xs font-semibold text-text">Otevřít nabídku na portálu:</p>
              <div className="flex flex-col gap-2">
                {selectedJob.sources.map((src) => {
                  const url = selectedJob.sourceUrls[src] || selectedJob.url;
                  return (
                    <a
                      key={src}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm font-medium hover:border-accent transition"
                    >
                      <span>Zobrazit na <strong className="text-accent">{src}</strong></span>
                      <span>↗</span>
                    </a>
                  );
                })}
              </div>
            </div>

            <Row className="gap-2 pt-2">
              <Button
                variant={savedJobIds.includes(selectedJob.id) ? 'secondary' : 'primary'}
                block
                onClick={() => toggleSave(selectedJob.id)}
              >
                {savedJobIds.includes(selectedJob.id) ? '⭐ Uloženo (Odebrat)' : '☆ Uložit nabídku'}
              </Button>
              <Button variant="ghost" onClick={() => hideJob(selectedJob.id)}>
                Skrýt
              </Button>
            </Row>
          </Stack>
        )}
      </Sheet>
    </Stack>
  );
}
