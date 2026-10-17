import { defineConnector } from '../types';
import type { NeuralTtsApi } from './api';
import { mockNeuralTts } from './mock';
import { realNeuralTts } from './real';

export type * from './api';

declare module '../types' {
  interface ConnectorRegistry {
    neuralTts: NeuralTtsApi;
  }
}

export default defineConnector<NeuralTtsApi>({ id: 'neuralTts', real: realNeuralTts, mock: mockNeuralTts });
