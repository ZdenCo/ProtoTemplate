import { useNav } from '@core';
import { Card } from '@core/ui';

export default function Teaser() {
  const nav = useNav();
  return <Card icon="🖼️" title="Ask about a photo" subtitle="Runs fully on the device" onPress={() => nav.toRoute('ask')} />;
}
