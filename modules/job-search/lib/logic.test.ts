import { describe, expect, it } from 'vitest';
import { generateSearchQuery } from './synonyms';
import { createMockSources } from './mock-sources';
import { deduplicateJobs } from './deduplicate';
import { scoreJob } from './scoring';
import type { Job, MergedJob, ProfileData } from '../types';

describe('job-search pure logic', () => {
  it('generates synonyms for IT and non-IT roles', () => {
    const q1 = generateSearchQuery('Frontend developer');
    expect(q1.role).toBe('Frontend developer');
    expect(q1.synonyms).toContain('react developer');
    expect(q1.synonyms).toContain('javascript developer');

    const q2 = generateSearchQuery('účetní');
    expect(q2.synonyms).toContain('hlavni ucetni');
    expect(q2.synonyms).toContain('accountant');

    const q3 = generateSearchQuery('skladník');
    expect(q3.synonyms).toContain('pracovnik skladu');
    expect(q3.synonyms).toContain('warehouse worker');
  });

  it('filters mock sources diacritics-insensitively', async () => {
    const sources = createMockSources();
    const jobsCz = sources.find((s) => s.id === 'jobs.cz')!;
    const q = generateSearchQuery('frontend vyvojar');
    const results = await jobsCz.search(q);

    expect(results.length).toBeGreaterThan(0);
    expect(results.some((j) => j.title.includes('React') || j.title.includes('Frontend'))).toBe(true);
  });

  it('deduplicates across sources by normalized title, company, city', () => {
    const jobA: Job = {
      id: '1',
      source: 'jobs.cz',
      title: 'Senior React Developer',
      company: 'Avast Software s.r.o.',
      location: 'Praha 4',
      remote: 'hybrid',
      salaryMin: 90000,
      tags: ['React'],
      description: 'Short',
      url: 'https://jobs.cz/1',
      postedAt: '2026-10-25T08:30:00Z',
    };
    const jobB: Job = {
      id: '2',
      source: 'startupjobs.cz',
      title: 'Senior React Developer',
      company: 'Avast Software',
      location: 'Praha',
      remote: 'hybrid',
      salaryMin: 90000,
      tags: ['TypeScript'],
      description: 'Longer description with more detail',
      url: 'https://startupjobs.cz/2',
      postedAt: '2026-10-25T08:30:00Z',
    };

    const merged = deduplicateJobs([jobA, jobB]);
    expect(merged.length).toBe(1);
    expect(merged[0]!.sources).toEqual(['jobs.cz', 'startupjobs.cz']);
    expect(merged[0]!.tags).toEqual(['React', 'TypeScript']);
    expect(merged[0]!.description).toBe('Longer description with more detail');
  });

  it('computes 0–100 score and returns match reasons', () => {
    const job: MergedJob = {
      id: 'test-1',
      source: 'jobs.cz',
      sources: ['jobs.cz'],
      sourceUrls: { 'jobs.cz': 'https://jobs.cz/test-1' },
      title: 'Frontend Vývojář (React/TS)',
      company: 'Tech s.r.o.',
      location: 'Praha',
      remote: 'hybrid',
      salaryMin: 80000,
      salaryMax: 95000,
      tags: ['React', 'TypeScript'],
      description: 'Vývoj v React a TypeScript',
      url: 'https://jobs.cz/test-1',
      postedAt: '2026-10-25T08:30:00Z',
    };

    const profile: ProfileData = {
      name: 'Jan',
      desiredRole: 'Frontend Developer',
      extraKeywords: ['React'],
      skills: ['React', 'TypeScript'],
      languages: ['Čeština'],
      preferredLocations: ['Praha'],
      remotePreference: 'hybrid',
      minSalary: 70000,
    };

    const scored = scoreJob(job, profile);
    expect(scored.score).toBeGreaterThanOrEqual(80);
    expect(scored.matchReasons.some((r) => r.includes('odpovídá'))).toBe(true);
    expect(scored.matchReasons.some((r) => r.includes('Praha'))).toBe(true);
    expect(scored.matchReasons.some((r) => r.includes('splňuje'))).toBe(true);
  });

  it('handles a failing source gracefully without failing other sources', async () => {
    const sources = createMockSources('startupjobs.cz');
    const results = await Promise.allSettled(sources.map((s) => s.search(generateSearchQuery('React'))));

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    expect(fulfilled.length).toBe(2);
    expect(rejected.length).toBe(1);
    if (rejected[0]!.status === 'rejected') {
      expect(rejected[0]!.reason.message).toContain('startupjobs.cz');
    }
  });
});
