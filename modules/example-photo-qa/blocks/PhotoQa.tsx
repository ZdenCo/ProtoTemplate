import { useState } from 'react';

import { ModelGate } from '@core/recipes/models';
import { useVision } from '@core/recipes/vision';
import { AsyncButton, Button, Card, Input, Row, StreamingText, Thumbnail } from '@core/ui';

const PRESETS = ['Describe this photo', 'Read all text', 'How many people are there?'];

export default function PhotoQa() {
  const vision = useVision();
  const [question, setQuestion] = useState(PRESETS[0]!);

  return (
    <ModelGate download={vision.model} name={vision.modelInfo.name} sizeBytes={vision.modelInfo.sizeBytes}>
      <Card title="Photo">
        {vision.photo && <Thumbnail src={vision.photo.webPath} alt="Selected photo" />}
        <Row>
          <AsyncButton icon="📷" onClick={vision.takePhoto}>
            Camera
          </AsyncButton>
          <AsyncButton variant="secondary" icon="🖼️" onClick={vision.pickPhoto}>
            Library
          </AsyncButton>
        </Row>
      </Card>
      <Card title="Question">
        <Row>
          {PRESETS.map((p) => (
            <Button key={p} size="sm" variant={p === question ? 'primary' : 'secondary'} onClick={() => setQuestion(p)}>
              {p}
            </Button>
          ))}
        </Row>
        <Input value={question} onChange={(e) => setQuestion(e.target.value)} aria-label="Question" />
        <Row>
          <AsyncButton disabled={!vision.photo || !question} onClick={() => vision.ask(question)}>
            Ask
          </AsyncButton>
          {vision.streaming && (
            <Button variant="ghost" onClick={() => void vision.cancel()}>
              Stop
            </Button>
          )}
        </Row>
        <StreamingText text={vision.answer} streaming={vision.streaming} placeholder="The answer appears here." />
      </Card>
    </ModelGate>
  );
}
