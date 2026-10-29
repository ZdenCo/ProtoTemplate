import { defineComposition } from '@core/define';

export default defineComposition({
  pages: {
    jobs: { path: '/', title: 'Jobs', page: () => import('./pages/JobsPage'), tab: { label: 'Jobs', icon: '💼' } },
    profile: { path: '/profile', title: 'Profile', page: () => import('./pages/ProfilePage'), tab: { label: 'Profile', icon: '👤' } },
    saved: { path: '/saved', title: 'Saved', page: () => import('./pages/SavedPage'), tab: { label: 'Saved', icon: '⭐' } },
    settings: { path: '/settings', title: 'Settings', page: () => import('./pages/SettingsPage'), tab: { label: 'Settings', icon: '⚙️' } },
  },

  flags: {
    jobSearch: { default: true, description: 'Job aggregator and matching' },
    profile: { default: true, description: 'User work profile' },
  },

  modules: {
    'job-search': { flag: 'jobSearch' },
    'profile': { flag: 'profile' },
    'app-info': {},
  },

  placements: [
    { zone: 'jobs.main', module: 'profile', block: 'summary', order: 10 },
    { zone: 'jobs.main', module: 'job-search', block: 'results', order: 20 },
    { zone: 'profile.main', module: 'profile', block: 'editor', order: 10 },
    { zone: 'saved.main', module: 'job-search', block: 'saved', order: 10 },
    { zone: 'settings.main', module: 'app-info', block: 'card', order: 10 },
  ],
});
