import { appConfig, usePlatform } from '@core';
import { Badge, Card, Text } from '@core/ui';

export default function AppInfo() {
  const mode = usePlatform((s) => s.mode);
  const shell = usePlatform((s) => s.info?.shell);
  return (
    <Card icon="ℹ️" title={appConfig.name} subtitle={`Version ${appConfig.version}`}>
      <Text muted small>
        {mode === 'shell' ? `Running in ProtoShell ${shell?.version} on ${shell?.platform}` : 'Running in a browser with mock device features'}
      </Text>
      <div>
        <Badge tone={mode === 'shell' ? 'success' : 'warning'}>{mode}</Badge>
      </div>
      <Text muted small>
        Long-press any page title for developer tools.
      </Text>
    </Card>
  );
}
