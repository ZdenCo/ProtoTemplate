import { useRef, useState } from 'react';

import { useConnector, useSubscription } from '@core';
import type { GeoPosition } from '@core/connectors/geolocation';
import { Button, Card, Text } from '@core/ui';

export default function Walk() {
  const geo = useConnector('geolocation');
  const [tracking, setTracking] = useState(false);
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [distance, setDistance] = useState(0);
  const previous = useRef<GeoPosition | null>(null);

  useSubscription(
    () =>
      geo.watchPosition((p) => {
        if (previous.current) setDistance((d) => d + geo.distance(previous.current!, p));
        previous.current = p;
        setPosition(p);
      }),
    [geo],
    { enabled: tracking },
  );

  return (
    <Card icon="🚶" title="Walk tracker">
      <Text className="text-2xl font-semibold tabular-nums">{distance.toFixed(1)} m</Text>
      {position && (
        <Text muted small className="tabular-nums">
          {position.latitude.toFixed(5)}, {position.longitude.toFixed(5)} ± {Math.round(position.accuracy)} m
        </Text>
      )}
      <Button
        variant={tracking ? 'secondary' : 'primary'}
        onClick={() => {
          if (!tracking) {
            setDistance(0);
            previous.current = null;
          }
          setTracking(!tracking);
        }}
      >
        {tracking ? 'Stop' : 'Start'}
      </Button>
    </Card>
  );
}
