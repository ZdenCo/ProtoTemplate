import { useState } from 'react';

import { useModuleSettings } from '@core';
import { useAiChat, useAiStatus } from '@core/recipes/ai';
import { useVoice } from '@core/recipes/voice';
import { AsyncButton, Card, EmptyState, ErrorState, Input, Row, Spinner, Text, cn } from '@core/ui';

export default function Chat() {
  const [settings] = useModuleSettings();
  const status = useAiStatus();
  const chat = useAiChat({ instructions: 'You are a helpful assistant. Answer in at most three sentences.' });
  const voice = useVoice({ language: String(settings.language) });
  const [draft, setDraft] = useState('');

  const send = async (text: string) => {
    if (!text.trim()) return;
    setDraft('');
    const answer = await chat.send(text);
    if (settings.speakAnswers) await voice.speak(answer);
  };

  if (status === 'checking') return <Spinner />;
  if (status === 'unavailable') return <EmptyState icon="🤖" title="No on-device AI" message="This device has no Apple Intelligence / Gemini Nano." />;

  return (
    <Card icon="💬" title="Assistant">
      {chat.messages.length === 0 && <Text muted>Ask anything. Tap 🎤 to talk.</Text>}
      <div className="flex flex-col gap-2">
        {chat.messages.map((m, i) => (
          <p
            key={i}
            className={cn('max-w-[85%] rounded-2xl px-3 py-2', m.role === 'user' ? 'self-end bg-accent text-on-accent' : 'self-start bg-surface-2')}
          >
            {m.text}
          </p>
        ))}
        {chat.busy && <Spinner />}
      </div>
      {chat.error && <ErrorState message={chat.error} />}
      {voice.listening && <Text muted>🎤 {voice.transcript || 'Listening…'}</Text>}
      <Row className="flex-nowrap">
        <Input
          className="flex-1"
          value={draft}
          placeholder="Message"
          aria-label="Message"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && void send(draft)}
        />
        <AsyncButton aria-label="Send" disabled={chat.busy || !draft.trim()} onClick={() => send(draft)}>
          ➤
        </AsyncButton>
        <AsyncButton aria-label="Talk" variant="secondary" disabled={chat.busy} onClick={async () => send(await voice.listen())}>
          🎤
        </AsyncButton>
      </Row>
    </Card>
  );
}
