import { motion } from '@protoshell/sdk';

import type { MotionApi } from './api';

export const realMotion: MotionApi = {
  watchAcceleration: async (onEvent) => {
    const handle = await motion.watchAcceleration((e) => onEvent(e));
    return () => void handle.remove();
  },
  watchOrientation: async (onEvent) => {
    const handle = await motion.watchOrientation((e) =>
      onEvent({ alpha: e.alpha, beta: e.beta, gamma: e.gamma, heading: motion.compassHeading(e) }),
    );
    return () => void handle.remove();
  },
};
