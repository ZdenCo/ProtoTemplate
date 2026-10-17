import { haptics } from '@protoshell/sdk';

import type { HapticsApi } from './api';

const impactStyles = { light: haptics.ImpactStyle.Light, medium: haptics.ImpactStyle.Medium, heavy: haptics.ImpactStyle.Heavy };
const notificationTypes = {
  success: haptics.NotificationType.Success,
  warning: haptics.NotificationType.Warning,
  error: haptics.NotificationType.Error,
};

export const realHaptics: HapticsApi = {
  impact: (style = 'medium') => haptics.impact(impactStyles[style]),
  notify: (type = 'success') => haptics.notify(notificationTypes[type]),
  selection: () => haptics.selection(),
  vibrate: (durationMs) => haptics.vibrate(durationMs),
};
