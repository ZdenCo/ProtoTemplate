import type { SearchQuery } from '../types';

export function normalizeText(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export const ROLE_FAMILIES: Record<string, string[]> = {
  frontend: [
    'frontend developer',
    'frontend vyvojar',
    'front-end',
    'react developer',
    'javascript developer',
    'vue developer',
    'angular developer',
    'web developer',
    'ui developer',
  ],
  backend: [
    'backend developer',
    'backend vyvojar',
    'back-end',
    'node.js developer',
    'python developer',
    'java developer',
    'c# developer',
    '.net developer',
    'php developer',
  ],
  fullstack: [
    'fullstack developer',
    'full stack developer',
    'fullstack vyvojar',
    'software engineer',
    'softwarovy inzenyr',
    'programator',
  ],
  devops: [
    'devops engineer',
    'devops specialista',
    'cloud engineer',
    'sysadmin',
    'spravce systemu',
    'site reliability engineer',
    'sre',
    'linux admin',
  ],
  data: [
    'data analyst',
    'datovy analytik',
    'data scientist',
    'data engineer',
    'bi analytik',
    'business intelligence',
    'ai engineer',
  ],
  qa: [
    'qa engineer',
    'tester',
    'qa tester',
    'tester softwaru',
    'test automation engineer',
    'software tester',
  ],
  product: [
    'product manager',
    'produktovy manazer',
    'project manager',
    'projektovy manazer',
    'scrum master',
    'product owner',
  ],
  design: [
    'ux designer',
    'ui designer',
    'product designer',
    'grafik',
    'web designer',
    'navrhar rozhrani',
    'designer',
  ],
  accounting: [
    'ucetni',
    'hlavni ucetni',
    'mzdova ucetni',
    'accountant',
    'senior accountant',
    'finance specialist',
    'financni ucetni',
  ],
  warehouse: [
    'skladnik',
    'pracovnik skladu',
    'skladnice',
    'warehouse worker',
    'ridic vzv',
    'logistik',
    'manipulant',
    'skladovy operator',
  ],
  sales: [
    'obchodni zastupce',
    'sales representative',
    'obchodnik',
    'account manager',
    'business development',
    'prodejce',
    'sales manager',
  ],
  support: [
    'zakaznicka podpora',
    'customer service',
    'customer support',
    'helpdesk',
    'specialista podpory',
    'klientsky servis',
  ],
  admin: [
    'asistentka',
    'asistent',
    'administrativni pracovnik',
    'office manager',
    'recepcni',
    'administrative assistant',
    'referent',
  ],
  hr: [
    'hr specialist',
    'personalista',
    'recruiter',
    'hr manazer',
    'naborar',
    'human resources',
    'talent acquisition',
  ],
  driver: [
    'ridic',
    'kuryr',
    'driver',
    'ridic sk b',
    'ridic dodavky',
    'rozvozce',
    'ridic c',
  ],
};

export function generateSearchQuery(desiredRole: string, extraKeywords: string[] = []): SearchQuery {
  const normRole = normalizeText(desiredRole);
  if (!normRole) {
    return { role: '', synonyms: [], keywords: extraKeywords };
  }

  const roleTokens = normRole.split(' ').filter(Boolean);
  const foundSynonyms = new Set<string>();

  for (const familySynonyms of Object.values(ROLE_FAMILIES)) {
    const familyMatches = familySynonyms.some((syn) => {
      const normSyn = normalizeText(syn);
      if (normSyn === normRole || normSyn.includes(normRole) || normRole.includes(normSyn)) {
        return true;
      }
      const synTokens = normSyn.split(' ');
      return roleTokens.some((tok) => tok.length > 2 && synTokens.includes(tok));
    });

    if (familyMatches) {
      for (const s of familySynonyms) {
        foundSynonyms.add(s);
      }
    }
  }

  return {
    role: desiredRole,
    synonyms: Array.from(foundSynonyms),
    keywords: extraKeywords,
  };
}
