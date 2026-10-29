import { defineAppConfig } from '@core/define';

export default defineAppConfig({
  // Prefixes every storage key. Set once per app; changing it later orphans saved data.
  id: 'job-radar',
  name: 'Job Radar',
  version: '0.1.0',
  themeColor: '#c8b6ff',
});
