export type RemotePreference = 'onsite' | 'hybrid' | 'remote' | 'any';

export interface Position {
  id: string;
  title: string;
  company: string;
  years: number;
  description: string;
}

export interface UserProfile {
  name: string;
  desiredRole: string;
  extraKeywords: string[];
  positions: Position[];
  skills: string[];
  languages: string[];
  preferredLocations: string[];
  remotePreference: RemotePreference;
  minSalary?: number;
}

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Jan Novák',
  desiredRole: 'Frontend Developer',
  extraKeywords: ['React', 'TypeScript'],
  positions: [
    {
      id: 'pos-1',
      title: 'Frontend Developer',
      company: 'Digital Solutions s.r.o.',
      years: 3,
      description: 'Vývoj klientských webových aplikací v Reactu a moderním TypeScriptu.',
    },
  ],
  skills: ['React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Next.js', 'Git'],
  languages: ['Čeština', 'Angličtina'],
  preferredLocations: ['Praha', 'Brno'],
  remotePreference: 'hybrid',
  minSalary: 70000,
};
