import { appConfig } from '@core';
import { Card, Text } from '@core/ui';

export interface AboutCardProps {
  description?: string;
}

export default function AboutCard({ description = 'Modular mobile web application running inside ProtoShell.' }: AboutCardProps) {
  return (
    <Card icon="ℹ️" title={appConfig.name} subtitle={`Version ${appConfig.version}`}>
      <Text muted small>
        {description}
      </Text>
    </Card>
  );
}
