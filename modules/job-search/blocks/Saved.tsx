import { useEffect, useMemo, useState } from 'react';
import { useNav, useStoredState } from '@core';
import { Badge, Button, Card, EmptyState, Row, Sheet, Stack, Text } from '@core/ui';
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

export default function SavedJobs() {
  const [savedJobIds, setSavedJobIds] = useStoredState<string[]>('savedJobIds', []);
  const [profile] = useStoredState<ProfileData>('cachedProfile', INITIAL_PROFILE);
  const [allJobs, setAllJobs] = useState<MergedJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<MergedJob | null>(null);
  const nav = useNav();

  useEffect(() => {
    let active = true;
    async function fetchAll() {
      const sources = createMockSources();
      const query = generateSearchQuery(profile.desiredRole || '', profile.extraKeywords);
      // Fetch all to ensure saved jobs are present
      const emptyQuery = { role: '', synonyms: [], keywords: [] };
      const results = await Promise.all(sources.map((s) => s.search(query.role ? query : emptyQuery)));
      if (!active) return;
      const deduplicated = deduplicateJobs(results.flat());
      const scored = deduplicated.map((job) => {
        const { score, matchReasons } = scoreJob(job, profile);
        return { ...job, score, matchReasons };
      });
      setAllJobs(scored);
    }
    void fetchAll();
    return () => {
      active = false;
    };
  }, [profile]);

  const savedJobs = useMemo(() => {
    return allJobs.filter((job) => savedJobIds.includes(job.id));
  }, [allJobs, savedJobIds]);

  const removeSaved = (id: string) => {
    setSavedJobIds((prev) => prev.filter((item) => item !== id));
    if (selectedJob?.id === id) setSelectedJob(null);
  };

  if (savedJobIds.length === 0) {
    return (
      <EmptyState
        icon="⭐"
        title="Žádné uložené nabídky"
        message="Označte si zajímavé nabídky hvězdičkou na záložce Nabídky a najdete je zde."
        action={
          <Button variant="primary" onClick={() => nav.toPage('jobs')}>
            Procházet nabídky
          </Button>
        }
      />
    );
  }

  return (
    <Stack className="gap-3">
      <div className="flex items-center justify-between">
        <Text small muted>
          Uloženo {savedJobs.length} {savedJobs.length === 1 ? 'nabídka' : savedJobs.length < 5 ? 'nabídky' : 'nabídek'}
        </Text>
      </div>

      {savedJobs.map((job) => (
        <Card
          key={job.id}
          onPress={() => setSelectedJob(job)}
          title={
            <div className="flex items-start justify-between gap-2">
              <span className="text-base font-semibold leading-snug">{job.title}</span>
              <span className="shrink-0 inline-flex items-center rounded-full bg-accent text-on-accent px-2 py-0.5 text-xs font-bold">
                {job.score ?? 50}% shoda
              </span>
            </div>
          }
          subtitle={`${job.company} • ${job.location}`}
          actions={
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-muted hover:text-danger h-8 px-2"
              onClick={(e) => {
                e.stopPropagation();
                removeSaved(job.id);
              }}
            >
              Odebrat
            </Button>
          }
        >
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

            <Badge tone="neutral">
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
            </Row>
          )}
        </Card>
      ))}

      {/* Detail Sheet */}
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

            <div>
              <p className="mb-1 text-xs font-semibold text-text">Popis pozice:</p>
              <p className="text-sm text-muted whitespace-pre-wrap leading-relaxed">
                {selectedJob.description}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-text">Odkazy na portály:</p>
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

            <Button
              variant="danger"
              block
              onClick={() => removeSaved(selectedJob.id)}
            >
              Odebrat z uložených
            </Button>
          </Stack>
        )}
      </Sheet>
    </Stack>
  );
}
