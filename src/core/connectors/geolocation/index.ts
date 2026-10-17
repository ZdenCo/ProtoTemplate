import { defineConnector } from '../types';
import type { GeolocationApi } from './api';
import { mockGeolocation } from './mock';
import { realGeolocation } from './real';

export type * from './api';

declare module '../types' {
  interface ConnectorRegistry {
    geolocation: GeolocationApi;
  }
}

export default defineConnector<GeolocationApi>({ id: 'geolocation', real: realGeolocation, mock: mockGeolocation });
