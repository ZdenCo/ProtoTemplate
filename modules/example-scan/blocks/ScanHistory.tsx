import { useScanner } from '@core/recipes/scan';
import { Button, EmptyState, List, ListItem } from '@core/ui';

export default function ScanHistory() {
  const { history, clearHistory } = useScanner();
  if (!history.length) return <EmptyState icon="🔳" title="No scans yet" />;
  return (
    <>
      <List>
        {history.map((entry) => (
          <ListItem key={entry.at} leading="🔳" title={entry.text} subtitle={`${entry.format} · ${new Date(entry.at).toLocaleString()}`} />
        ))}
      </List>
      <Button variant="danger" onClick={clearHistory}>
        Clear history
      </Button>
    </>
  );
}
