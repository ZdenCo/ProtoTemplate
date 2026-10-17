import type { MotionApi } from './api';

// Synthetic, slowly swaying device lying almost flat. 20 Hz to stay light in the browser.
export const mockMotion: MotionApi = {
  async watchAcceleration(onEvent) {
    const started = Date.now();
    const timer = setInterval(() => {
      const t = (Date.now() - started) / 1000;
      const sway = Math.sin(t * 2);
      onEvent({
        acceleration: { x: sway * 0.3, y: Math.cos(t * 2) * 0.2, z: 0 },
        accelerationIncludingGravity: { x: sway * 0.3, y: Math.cos(t * 2) * 0.2, z: 9.81 },
        rotationRate: { alpha: sway * 5, beta: 0, gamma: 0 },
        interval: 50,
      });
    }, 50);
    return () => clearInterval(timer);
  },
  async watchOrientation(onEvent) {
    const started = Date.now();
    const timer = setInterval(() => {
      const t = (Date.now() - started) / 1000;
      const alpha = (360 - ((t * 10) % 360)) % 360;
      onEvent({ alpha, beta: Math.sin(t) * 10, gamma: Math.cos(t) * 10, heading: (360 - alpha) % 360 });
    }, 50);
    return () => clearInterval(timer);
  },
};
