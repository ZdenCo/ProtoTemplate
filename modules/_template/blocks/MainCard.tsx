import { useStoredState } from '@core';
import { Button, Card, Text } from '@core/ui';

export default function MainCard() {
  const [count, setCount] = useStoredState('count', 0);
  return (
    <Card icon="🧩" title="__MODULE_TITLE__" subtitle="Replace this block.">
      <Text muted>Tapped {count} times (persisted).</Text>
      <Button onClick={() => setCount((c) => c + 1)}>Tap</Button>
    </Card>
  );
}
