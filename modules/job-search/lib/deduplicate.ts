import type { Job, MergedJob } from '../types';
import { normalizeText } from './synonyms';

export function normalizeCompany(name: string): string {
  return normalizeText(name)
    .replace(/\b(s r o|spol s r o|a s|gmbh|inc|corp|technologies|czech republic|software)\b/g, '')
    .trim();
}

export function extractCity(location: string): string {
  const norm = normalizeText(location);
  return norm.split(' ')[0] || '';
}

export function computeJobKey(job: Job): string {
  const normTitle = normalizeText(job.title)
    .replace(/\b(senior|junior|medior|lead)\b/g, '')
    .trim();
  const normComp = normalizeCompany(job.company);
  const city = extractCity(job.location);
  return `${normTitle}|${normComp}|${city}`;
}

export function deduplicateJobs(jobs: Job[]): MergedJob[] {
  const map = new Map<string, MergedJob>();

  for (const job of jobs) {
    const key = computeJobKey(job);
    const existing = map.get(key);

    if (!existing) {
      map.set(key, {
        ...job,
        sources: [job.source],
        sourceUrls: { [job.source]: job.url },
      });
    } else {
      if (!existing.sources.includes(job.source)) {
        existing.sources.push(job.source);
      }
      existing.sourceUrls[job.source] = job.url;

      const allTags = new Set([...existing.tags, ...job.tags]);
      existing.tags = Array.from(allTags);

      if (!existing.salaryMin && job.salaryMin) {
        existing.salaryMin = job.salaryMin;
        existing.salaryMax = job.salaryMax;
        existing.salaryText = job.salaryText;
      }
      if (job.description.length > existing.description.length) {
        existing.description = job.description;
      }
    }
  }

  return Array.from(map.values());
}
