import { useEffect, useState } from 'react';
import { useEmit, useStoredState } from '@core';
import { Badge, Button, Card, Divider, Field, Input, Row, Select, Spinner, Stack, Text, TextArea, toast } from '@core/ui';
import { DEFAULT_PROFILE } from '../types';
import type { Position, RemotePreference, UserProfile } from '../types';

const POPULAR_LOCATIONS = ['Praha', 'Brno', 'Ostrava', 'Plzeň', 'Liberec', 'Olomouc'];
const POPULAR_SKILLS = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'Docker', 'Git'];

export default function ProfileEditor() {
  const [profile, setProfile, { loaded }] = useStoredState<UserProfile>('profile', DEFAULT_PROFILE);
  const [draft, setDraft] = useState<UserProfile>(profile);
  const [initialized, setInitialized] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newLang, setNewLang] = useState('');
  const [newLoc, setNewLoc] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [showJson, setShowJson] = useState(false);
  const emit = useEmit();

  useEffect(() => {
    if (loaded && !initialized) {
      setDraft(profile);
      setInitialized(true);
    }
  }, [loaded, initialized, profile]);

  if (!loaded || !initialized) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  const handleSave = () => {
    setProfile(draft);
    emit('profile:changed', draft);
    toast.success('Profil byl úspěšně uložen');
  };

  const addPosition = () => {
    const newPos: Position = {
      id: `pos-${Date.now()}`,
      title: '',
      company: '',
      years: 1,
      description: '',
    };
    setDraft((prev) => ({ ...prev, positions: [...prev.positions, newPos] }));
  };

  const updatePosition = (id: string, patch: Partial<Position>) => {
    setDraft((prev) => ({
      ...prev,
      positions: prev.positions.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  };

  const removePosition = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      positions: prev.positions.filter((p) => p.id !== id),
    }));
  };

  const addTag = (field: 'skills' | 'extraKeywords' | 'languages' | 'preferredLocations', val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    if (!draft[field].includes(trimmed)) {
      setDraft((prev) => ({ ...prev, [field]: [...prev[field], trimmed] }));
    }
  };

  const removeTag = (field: 'skills' | 'extraKeywords' | 'languages' | 'preferredLocations', val: string) => {
    setDraft((prev) => ({ ...prev, [field]: prev[field].filter((x) => x !== val) }));
  };

  const handleExportJson = () => {
    setJsonText(JSON.stringify(draft, null, 2));
    setShowJson(true);
    toast.info('JSON vygenerován');
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(jsonText) as UserProfile;
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Neplatný formát');
      }
      const sanitized: UserProfile = {
        name: String(parsed.name || ''),
        desiredRole: String(parsed.desiredRole || ''),
        extraKeywords: Array.isArray(parsed.extraKeywords) ? parsed.extraKeywords.map(String) : [],
        positions: Array.isArray(parsed.positions) ? parsed.positions : [],
        skills: Array.isArray(parsed.skills) ? parsed.skills.map(String) : [],
        languages: Array.isArray(parsed.languages) ? parsed.languages.map(String) : [],
        preferredLocations: Array.isArray(parsed.preferredLocations) ? parsed.preferredLocations.map(String) : [],
        remotePreference: (['onsite', 'hybrid', 'remote', 'any'].includes(parsed.remotePreference)
          ? parsed.remotePreference
          : 'any') as RemotePreference,
        minSalary: parsed.minSalary ? Number(parsed.minSalary) : undefined,
      };
      setDraft(sanitized);
      toast.success('Profil načten z JSON');
    } catch {
      toast.error('Neplatný JSON formát');
    }
  };

  return (
    <Stack className="gap-4">
      <Card icon="👤" title="Základní údaje" subtitle="Nastavte si preferovanou roli a lokalitu">
        <Field label="Jméno a příjmení">
          {(id) => (
            <Input
              id={id}
              value={draft.name}
              onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
              placeholder="Jan Novák"
            />
          )}
        </Field>

        <Field label="Hledaná pracovní pozice" hint="Např. frontend developer, účetní, skladník...">
          {(id) => (
            <Input
              id={id}
              value={draft.desiredRole}
              onChange={(e) => setDraft((p) => ({ ...p, desiredRole: e.target.value }))}
              placeholder="frontend developer"
            />
          )}
        </Field>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Klíčová slova k roli</label>
          <div className="flex gap-2">
            <Input
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag('extraKeywords', newKeyword);
                  setNewKeyword('');
                }
              }}
              placeholder="Přidat klíčové slovo..."
            />
            <Button
              size="md"
              variant="secondary"
              onClick={() => {
                addTag('extraKeywords', newKeyword);
                setNewKeyword('');
              }}
            >
              Přidat
            </Button>
          </div>
          <Row className="mt-1">
            {draft.extraKeywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-text"
              >
                {kw}
                <button
                  type="button"
                  aria-label={`Odebrat ${kw}`}
                  className="text-muted hover:text-danger"
                  onClick={() => removeTag('extraKeywords', kw)}
                >
                  ✕
                </button>
              </span>
            ))}
          </Row>
        </div>

        <Field label="Minimální měsíční mzda (v CZK)" hint="Volitelné — pro hodnocení nabídek">
          {(id) => (
            <Input
              id={id}
              type="number"
              value={draft.minSalary ?? ''}
              onChange={(e) =>
                setDraft((p) => ({
                  ...p,
                  minSalary: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              placeholder="Např. 60000"
            />
          )}
        </Field>

        <Field label="Režim práce (Remote preference)">
          {(id) => (
            <Select
              id={id}
              value={draft.remotePreference}
              onChange={(e) => setDraft((p) => ({ ...p, remotePreference: e.target.value as RemotePreference }))}
              options={[
                { value: 'any', label: 'Cokoli (Nezáleží)' },
                { value: 'hybrid', label: 'Hybridní (kombinace)' },
                { value: 'remote', label: 'Remote / Práce na dálku' },
                { value: 'onsite', label: 'Pouze prezenčně (Onsite)' },
              ]}
            />
          )}
        </Field>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Preferované lokality</label>
          <div className="flex gap-2">
            <Input
              value={newLoc}
              onChange={(e) => setNewLoc(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag('preferredLocations', newLoc);
                  setNewLoc('');
                }
              }}
              placeholder="Zadejte město..."
            />
            <Button
              size="md"
              variant="secondary"
              onClick={() => {
                addTag('preferredLocations', newLoc);
                setNewLoc('');
              }}
            >
              Přidat
            </Button>
          </div>
          <Row className="mt-1">
            {draft.preferredLocations.map((loc) => (
              <span
                key={loc}
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary text-on-secondary px-3 py-1 text-xs font-medium"
              >
                {loc}
                <button
                  type="button"
                  aria-label={`Odebrat ${loc}`}
                  className="opacity-70 hover:opacity-100"
                  onClick={() => removeTag('preferredLocations', loc)}
                >
                  ✕
                </button>
              </span>
            ))}
          </Row>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Text small muted>Rychlý výběr:</Text>
            {POPULAR_LOCATIONS.map((loc) => (
              <button
                key={loc}
                type="button"
                className="rounded-lg border border-line bg-surface-2 px-2 py-0.5 text-xs text-muted hover:border-accent hover:text-text"
                onClick={() => addTag('preferredLocations', loc)}
              >
                + {loc}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card icon="💡" title="Dovednosti a jazyky" subtitle="Zvyšte přesnost shody s nabídkami práce">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Dovednosti (Skills)</label>
          <div className="flex gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag('skills', newSkill);
                  setNewSkill('');
                }
              }}
              placeholder="Přidat dovednost (např. React)..."
            />
            <Button
              size="md"
              variant="secondary"
              onClick={() => {
                addTag('skills', newSkill);
                setNewSkill('');
              }}
            >
              Přidat
            </Button>
          </div>
          <Row className="mt-1">
            {draft.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-text"
              >
                {skill}
                <button
                  type="button"
                  aria-label={`Odebrat ${skill}`}
                  className="text-muted hover:text-danger"
                  onClick={() => removeTag('skills', skill)}
                >
                  ✕
                </button>
              </span>
            ))}
          </Row>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Text small muted>Populární:</Text>
            {POPULAR_SKILLS.map((sk) => (
              <button
                key={sk}
                type="button"
                className="rounded-lg border border-line bg-surface-2 px-2 py-0.5 text-xs text-muted hover:border-accent hover:text-text"
                onClick={() => addTag('skills', sk)}
              >
                + {sk}
              </button>
            ))}
          </div>
        </div>

        <Divider />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Jazyky</label>
          <div className="flex gap-2">
            <Input
              value={newLang}
              onChange={(e) => setNewLang(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag('languages', newLang);
                  setNewLang('');
                }
              }}
              placeholder="Např. Čeština, Angličtina, Němčina..."
            />
            <Button
              size="md"
              variant="secondary"
              onClick={() => {
                addTag('languages', newLang);
                setNewLang('');
              }}
            >
              Přidat
            </Button>
          </div>
          <Row className="mt-1">
            {draft.languages.map((lang) => (
              <span
                key={lang}
                className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-text"
              >
                {lang}
                <button
                  type="button"
                  aria-label={`Odebrat ${lang}`}
                  className="text-muted hover:text-danger"
                  onClick={() => removeTag('languages', lang)}
                >
                  ✕
                </button>
              </span>
            ))}
          </Row>
        </div>
      </Card>

      <Card
        icon="💼"
        title="Pracovní zkušenosti"
        subtitle="Předchozí pozice a délka praxe"
        actions={
          <Button size="sm" variant="secondary" onClick={addPosition}>
            + Přidat pozici
          </Button>
        }
      >
        {draft.positions.length === 0 ? (
          <Text small muted>Zatím žádné zadané pozice.</Text>
        ) : (
          <Stack className="gap-3">
            {draft.positions.map((pos, idx) => (
              <div key={pos.id} className="rounded-xl border border-line bg-surface-2/40 p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Badge tone="accent">Pozice #{idx + 1}</Badge>
                  <Button size="sm" variant="ghost" className="text-danger hover:underline text-xs h-7 px-2" onClick={() => removePosition(pos.id)}>
                    Smazat
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Field label="Název pozice">
                    {(id) => (
                      <Input
                        id={id}
                        value={pos.title}
                        onChange={(e) => updatePosition(pos.id, { title: e.target.value })}
                        placeholder="Např. Web Developer"
                      />
                    )}
                  </Field>
                  <Field label="Společnost">
                    {(id) => (
                      <Input
                        id={id}
                        value={pos.company}
                        onChange={(e) => updatePosition(pos.id, { company: e.target.value })}
                        placeholder="Firma s.r.o."
                      />
                    )}
                  </Field>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <Field label="Praxe v letech">
                    {(id) => (
                      <Input
                        id={id}
                        type="number"
                        min="0"
                        value={pos.years}
                        onChange={(e) => updatePosition(pos.id, { years: Number(e.target.value) || 0 })}
                      />
                    )}
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Stručný popis náplně">
                      {(id) => (
                        <Input
                          id={id}
                          value={pos.description}
                          onChange={(e) => updatePosition(pos.id, { description: e.target.value })}
                          placeholder="Co jste na pozici dělali..."
                        />
                      )}
                    </Field>
                  </div>
                </div>
              </div>
            ))}
          </Stack>
        )}
      </Card>

      <Button size="lg" block variant="primary" onClick={handleSave}>
        Uložit profil
      </Button>

      <Card
        icon="⚙️"
        title="Import / Export profilu"
        subtitle="Záloha nebo nahrání profilu ve formátu JSON"
      >
        <Row>
          <Button size="sm" variant="secondary" onClick={handleExportJson}>
            Exportovat do JSON
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setShowJson((v) => !v)}>
            {showJson ? 'Skrýt JSON editor' : 'Otevřít JSON editor'}
          </Button>
        </Row>
        {showJson && (
          <Stack className="mt-2 gap-2">
            <TextArea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="Vložte nebo upravte JSON profilu..."
              className="font-mono text-xs"
            />
            <Button size="sm" variant="secondary" onClick={handleImportJson}>
              Načíst profil z textu výše
            </Button>
          </Stack>
        )}
      </Card>
    </Stack>
  );
}
