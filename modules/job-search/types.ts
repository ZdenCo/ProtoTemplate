export type RemoteType = 'onsite' | 'hybrid' | 'remote';

export interface Job {
  id: string;
  source: string;
  title: string;
  company: string;
  location: string;
  remote: RemoteType;
  salaryMin?: number;
  salaryMax?: number;
  salaryText?: string;
  tags: string[];
  description: string;
  url: string;
  postedAt: string;
}

export interface MergedJob extends Job {
  sources: string[];
  sourceUrls: Record<string, string>;
  score?: number;
  matchReasons?: string[];
}

export interface SearchQuery {
  role: string;
  synonyms: string[];
  keywords: string[];
}

export interface JobSource {
  id: string;
  name: string;
  search(query: SearchQuery): Promise<Job[]>;
}

export interface ProfileData {
  name: string;
  desiredRole: string;
  extraKeywords: string[];
  skills: string[];
  languages: string[];
  preferredLocations: string[];
  remotePreference: 'onsite' | 'hybrid' | 'remote' | 'any';
  minSalary?: number;
}
