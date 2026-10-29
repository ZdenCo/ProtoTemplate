import type { MergedJob, ProfileData } from '../types';
import { normalizeText, ROLE_FAMILIES } from './synonyms';

export interface ScoreResult {
  score: number;
  matchReasons: string[];
}

export function scoreJob(job: MergedJob, profile: ProfileData): ScoreResult {
  let score = 0;
  const matchReasons: string[] = [];

  const titleNorm = normalizeText(job.title);
  const descNorm = normalizeText(job.description);
  const tagsNorm = job.tags.map(normalizeText);
  const fullText = `${titleNorm} ${tagsNorm.join(' ')} ${descNorm}`;

  // 1. Title & Role similarity (max 40)
  const roleNorm = normalizeText(profile.desiredRole);
  if (roleNorm) {
    const roleTokens = roleNorm.split(' ').filter((t) => t.length > 2);
    const titleTokens = titleNorm.split(' ').filter((t) => t.length > 2);

    let matchingTokens = 0;
    for (const tok of roleTokens) {
      if (titleTokens.includes(tok) || titleNorm.includes(tok)) {
        matchingTokens++;
      }
    }

    let titleScore = 0;
    if (roleTokens.length > 0) {
      titleScore = Math.min(40, Math.round((matchingTokens / roleTokens.length) * 35));
    }

    let synonymMatched = false;
    for (const synonyms of Object.values(ROLE_FAMILIES)) {
      const inFamily = synonyms.some((s) => normalizeText(s) === roleNorm || roleNorm.includes(normalizeText(s)));
      if (inFamily) {
        for (const syn of synonyms) {
          const normSyn = normalizeText(syn);
          if (normSyn !== roleNorm && (titleNorm.includes(normSyn) || normSyn.split(' ').every((t) => titleTokens.includes(t)))) {
            titleScore = Math.max(titleScore, 36);
            synonymMatched = true;
            break;
          }
        }
      }
    }

    if (profile.extraKeywords?.length) {
      for (const kw of profile.extraKeywords) {
        const normKw = normalizeText(kw);
        if (normKw && (titleNorm.includes(normKw) || tagsNorm.includes(normKw))) {
          titleScore = Math.min(40, titleScore + 5);
        }
      }
    }

    score += titleScore;
    if (titleScore >= 20) {
      matchReasons.push(
        synonymMatched
          ? `Název pozice blízce odpovídá roli "${profile.desiredRole}"`
          : `Název pozice odpovídá hledané roli "${profile.desiredRole}"`,
      );
    }
  }

  // 2. Skill hits (max 25)
  if (profile.skills && profile.skills.length > 0) {
    const matchedSkills: string[] = [];
    for (const skill of profile.skills) {
      const normSkill = normalizeText(skill);
      if (!normSkill) continue;
      if (titleNorm.includes(normSkill) || tagsNorm.some((t) => t.includes(normSkill)) || fullText.includes(normSkill)) {
        matchedSkills.push(skill);
      }
    }

    if (matchedSkills.length > 0) {
      const skillScore = Math.min(25, matchedSkills.length * 9);
      score += skillScore;
      matchReasons.push(`Shoda v dovednostech: ${matchedSkills.slice(0, 3).join(', ')}${matchedSkills.length > 3 ? ` (+${matchedSkills.length - 3})` : ''}`);
    }
  } else {
    score += 15;
  }

  // 3. Location match (max 15)
  const preferredLocs = profile.preferredLocations || [];
  if (preferredLocs.length === 0) {
    score += 15;
  } else {
    const locNorm = normalizeText(job.location);
    const matchedLoc = preferredLocs.find((loc) => {
      const normPref = normalizeText(loc);
      return normPref && (locNorm.includes(normPref) || normPref.includes(locNorm));
    });

    if (matchedLoc) {
      score += 15;
      matchReasons.push(`Lokalita "${matchedLoc}" odpovídá preferencím`);
    } else if (job.remote === 'remote' && profile.remotePreference !== 'onsite') {
      score += 12;
      matchReasons.push('Pozice je plně remote (nezávislá na lokalitě)');
    }
  }

  // 4. Remote preference match (max 10)
  const userRemote = profile.remotePreference || 'any';
  if (userRemote === 'any') {
    score += 10;
  } else if (userRemote === job.remote) {
    score += 10;
    const labels: Record<string, string> = { remote: 'remote', hybrid: 'hybridní', onsite: 'onsite' };
    matchReasons.push(`Režim práce (${labels[job.remote] || job.remote}) vyhovuje`);
  } else if (userRemote === 'hybrid' && job.remote === 'remote') {
    score += 10;
    matchReasons.push('Možnost práce na dálku vyhovuje hybridní preferenci');
  } else {
    score += 2;
  }

  // 5. Salary vs minimum (max 10)
  if (!profile.minSalary) {
    score += 8;
  } else if (!job.salaryMin && !job.salaryMax) {
    score += 7;
  } else {
    const maxVal = job.salaryMax || job.salaryMin || 0;
    if (maxVal >= profile.minSalary) {
      score += 10;
      matchReasons.push(`Mzda ${maxVal.toLocaleString('cs-CZ')} Kč splňuje požadované minimum`);
    } else {
      score += 0;
    }
  }

  const finalScore = Math.round(Math.min(100, Math.max(0, score)));
  return {
    score: finalScore,
    matchReasons: matchReasons.length > 0 ? matchReasons : ['Částečná shoda profilu'],
  };
}
