import { useState } from 'react';

import { toast, useConnector, useEvent, useStoredState } from '@core';
import { AsyncButton, Button, Card, Field, Input, List, ListItem, Select } from '@core/ui';

interface Reminder {
  id: number;
  text: string;
  at: number;
}

const DELAYS = [
  { value: '1', label: 'in 1 minute' },
  { value: '15', label: 'in 15 minutes' },
  { value: '60', label: 'in 1 hour' },
];

export default function Reminders() {
  const notifications = useConnector('notifications');
  const [reminders, setReminders] = useStoredState<Reminder[]>('reminders', []);
  const [text, setText] = useState('');
  const [minutes, setMinutes] = useState('15');
  const [now, setNow] = useState(Date.now);

  // Cross-module event: prefill with the last scanned code (emitted by example-scan, if enabled).
  useEvent('example-scan:scanned', ({ text: scanned }) => setText(`Check ${scanned}`));

  const upcoming = reminders.filter((r) => r.at > now);

  return (
    <Card icon="⏰" title="Reminders">
      <Field label="Remind me to">{(id) => <Input id={id} value={text} onChange={(e) => setText(e.target.value)} />}</Field>
      <Field label="When">{(id) => <Select id={id} value={minutes} options={DELAYS} onChange={(e) => setMinutes(e.target.value)} />}</Field>
      <AsyncButton
        disabled={!text.trim()}
        onClick={async () => {
          const at = Date.now() + Number(minutes) * 60_000;
          const id = await notifications.notify({ title: text, at: new Date(at) });
          setReminders((list) => [...list.filter((r) => r.at > Date.now()), { id, text, at }]);
          setText('');
          setNow(Date.now());
          toast.success('Reminder set');
        }}
      >
        Add reminder
      </AsyncButton>
      {upcoming.length > 0 && (
        <List>
          {upcoming.map((r) => (
            <ListItem
              key={r.id}
              title={r.text}
              subtitle={new Date(r.at).toLocaleTimeString()}
              trailing={
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    void notifications.cancel(r.id);
                    setReminders((list) => list.filter((x) => x.id !== r.id));
                  }}
                >
                  Cancel
                </Button>
              }
            />
          ))}
        </List>
      )}
    </Card>
  );
}
