import { geolocation } from '@protoshell/sdk';

import type { GeoPosition, GeolocationApi, PositionOptions } from './api';

const toPosition = ({ coords, timestamp }: geolocation.Position): GeoPosition => ({
  latitude: coords.latitude,
  longitude: coords.longitude,
  accuracy: coords.accuracy,
  altitude: coords.altitude ?? null,
  speed: coords.speed ?? null,
  heading: coords.heading ?? null,
  timestamp,
});

const options = ({ highAccuracy = true, timeoutMs = 15000 }: PositionOptions = {}) => ({ enableHighAccuracy: highAccuracy, timeout: timeoutMs });

export const realGeolocation: GeolocationApi = {
  getPosition: async (opts) => toPosition(await geolocation.getPosition(options(opts))),
  watchPosition: async (onPosition, onError, opts) => {
    const watch = await geolocation.watchPosition((p) => onPosition(toPosition(p)), onError, options(opts));
    return () => void watch.stop();
  },
  distance: (a, b) => geolocation.distance(a, b),
};
