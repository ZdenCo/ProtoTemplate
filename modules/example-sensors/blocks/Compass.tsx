import { useRef, useState } from 'react';

import { useConnector, useSubscription } from '@core';
import { Card, Text } from '@core/ui';

export default function Compass() {
  const motion = useConnector('motion');
  const [reading, setReading] = useState({ heading: null as number | null, beta: 0, gamma: 0 });
  const last = useRef(0);

  // Sensors fire ~60 Hz: throttle state updates to ~10 Hz.
  useSubscription(
    () =>
      motion.watchOrientation((o) => {
        const now = performance.now();
        if (now - last.current < 100) return;
        last.current = now;
        setReading({ heading: o.heading, beta: o.beta, gamma: o.gamma });
      }),
    [motion],
  );

  return (
    <Card icon="🧭" title="Compass">
      <div className="flex items-center gap-4">
        <div
          className="flex size-20 items-center justify-center rounded-full border-2 border-line text-2xl transition-transform"
          style={{ transform: `rotate(${-(reading.heading ?? 0)}deg)` }}
          aria-hidden
        >
          ⬆️
        </div>
        <div>
          <Text className="text-2xl font-semibold tabular-nums">{reading.heading === null ? '—' : `${Math.round(reading.heading)}°`}</Text>
          <Text muted small className="tabular-nums">
            tilt {Math.round(reading.beta)}° / {Math.round(reading.gamma)}°
          </Text>
        </div>
      </div>
    </Card>
  );
}
