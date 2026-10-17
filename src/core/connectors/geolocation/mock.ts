import { delay, fixture, maybeFail } from '../mock-utils';
import type { GeoPoint, GeoPosition, GeolocationApi } from './api';

// Fixtures: window.__mocks.geolocation = { latitude, longitude, fail }
// watchPosition walks north-east about 1.4 m per second.
const start = (): GeoPoint => ({
  latitude: fixture('geolocation', 'latitude', 50.0755),
  longitude: fixture('geolocation', 'longitude', 14.4378),
});

const position = (point: GeoPoint, moving = false): GeoPosition => ({
  ...point,
  accuracy: 8,
  altitude: 235,
  speed: moving ? 1.4 : null,
  heading: moving ? 45 : null,
  timestamp: Date.now(),
});

function distance(a: GeoPoint, b: GeoPoint): number {
  const rad = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * rad;
  const dLon = (b.longitude - a.longitude) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371008.8 * Math.asin(Math.sqrt(h));
}

export const mockGeolocation: GeolocationApi = {
  async getPosition() {
    await delay(400);
    maybeFail('geolocation');
    return position(start());
  },
  async watchPosition(onPosition) {
    maybeFail('geolocation');
    let point = start();
    onPosition(position(point));
    const timer = setInterval(() => {
      point = { latitude: point.latitude + 0.000009, longitude: point.longitude + 0.000014 };
      onPosition(position(point, true));
    }, 1000);
    return () => clearInterval(timer);
  },
  distance,
};
