import { useEmit, useModuleSettings, useNav } from '@core';
import { useScanner } from '@core/recipes/scan';
import { AsyncButton, Badge, Button, Card, Row, Text } from '@core/ui';

export default function ScanCard({ title = 'Scan a code' }: { title?: string }) {
  const [settings] = useModuleSettings();
  const scanner = useScanner({ anyFormat: Boolean(settings.anyFormat), instructions: 'Point at a QR code or barcode' });
  const emit = useEmit();
  const nav = useNav();

  return (
    <Card icon="🔳" title={title} subtitle="QR codes and barcodes">
      {scanner.last && (
        <div className="rounded-xl bg-surface-2 p-3">
          <Row className="mb-1">
            <Badge tone="accent">{scanner.last.format}</Badge>
          </Row>
          <Text className="break-all">{scanner.last.text}</Text>
        </div>
      )}
      <Row>
        <AsyncButton
          icon="📷"
          onClick={async () => {
            const entry = await scanner.scan();
            emit('example-scan:scanned', { text: entry.text, format: entry.format });
          }}
        >
          Scan
        </AsyncButton>
        {scanner.history.length > 0 && (
          <Button variant="ghost" onClick={() => nav.toRoute('history')}>
            History ({scanner.history.length})
          </Button>
        )}
      </Row>
    </Card>
  );
}
