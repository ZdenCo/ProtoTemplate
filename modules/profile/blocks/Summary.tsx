import { useNav, useStoredState } from '@core';
import { Badge, Button, Card, Row, Text } from '@core/ui';
import { DEFAULT_PROFILE } from '../types';
import type { UserProfile } from '../types';

export default function ProfileSummary() {
  const [profile] = useStoredState<UserProfile>('profile', DEFAULT_PROFILE);
  const nav = useNav();

  return (
    <Card
      icon="👤"
      title={profile.desiredRole ? `Hledaná role: ${profile.desiredRole}` : 'Profil není nastaven'}
      subtitle={profile.name ? `Uživatel: ${profile.name}` : undefined}
      actions={
        <Button size="sm" variant="secondary" onClick={() => nav.toPage('profile')}>
          Upravit
        </Button>
      }
    >
      <Row className="gap-1.5">
        {profile.remotePreference && (
          <Badge tone="accent">
            {profile.remotePreference === 'any'
              ? 'Kdekoliv'
              : profile.remotePreference === 'remote'
                ? 'Remote'
                : profile.remotePreference === 'hybrid'
                  ? 'Hybrid'
                  : 'Onsite'}
          </Badge>
        )}
        {profile.minSalary && (
          <Badge tone="neutral">Od {profile.minSalary.toLocaleString('cs-CZ')} Kč</Badge>
        )}
        {profile.preferredLocations.slice(0, 3).map((loc) => (
          <span
            key={loc}
            className="inline-flex items-center rounded-full bg-secondary text-on-secondary px-2 py-0.5 text-xs font-medium"
          >
            {loc}
          </span>
        ))}
      </Row>
      {profile.skills.length > 0 && (
        <Text small muted className="truncate">
          Dovednosti: {profile.skills.slice(0, 5).join(', ')}
          {profile.skills.length > 5 ? ` +${profile.skills.length - 5}` : ''}
        </Text>
      )}
    </Card>
  );
}
