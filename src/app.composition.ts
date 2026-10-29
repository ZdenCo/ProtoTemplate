import { defineComposition } from '@core/define';

// The only place that decides what the app shows: pages (zones-only layouts), which module
// blocks go into which zone, and the flags that switch modules on and off.
export default defineComposition({
  pages: {
    home: { path: '/', title: 'Home', page: () => import('./pages/HomePage'), tab: { label: 'Home', icon: '🏠' } },
    tools: { path: '/tools', title: 'Tools', page: () => import('./pages/ToolsPage'), tab: { label: 'Tools', icon: '🧰' } },
    about: { path: '/about', title: 'About', page: () => import('./pages/AboutPage'), tab: { label: 'About', icon: 'ℹ️' } },
    settings: { path: '/settings', title: 'Settings', page: () => import('./pages/SettingsPage'), tab: { label: 'Settings', icon: '⚙️' } },
  },

  flags: {
    exampleScan: { default: true, description: 'Example: QR scanner with history' },
    examplePhotoQa: { default: true, description: 'Example: photo Q&A with the vision model' },
    exampleAssistant: { default: true, description: 'Example: text/voice assistant on the OS LLM' },
    exampleSensors: { default: true, description: 'Example: compass and walk tracker' },
    exampleReminders: { default: true, description: 'Example: local notification reminders' },
    about: { default: true, description: 'About page module' },
  },

  modules: {
    'example-scan': { flag: 'exampleScan' },
    'example-photo-qa': { flag: 'examplePhotoQa' },
    'example-assistant': { flag: 'exampleAssistant' },
    'example-sensors': { flag: 'exampleSensors' },
    'example-reminders': { flag: 'exampleReminders' },
    about: { flag: 'about' },
  },

  placements: [
    { zone: 'home.main', module: 'example-scan', block: 'card', order: 10 },
    { zone: 'home.main', module: 'example-photo-qa', block: 'teaser', order: 20 },
    { zone: 'home.main', module: 'example-assistant', block: 'chat', order: 30 },
    { zone: 'tools.main', module: 'example-sensors', block: 'compass', order: 10 },
    { zone: 'tools.main', module: 'example-sensors', block: 'walk', order: 20 },
    { zone: 'tools.main', module: 'example-reminders', block: 'card', order: 30 },
    { zone: 'about.main', module: 'about', block: 'card' },
    { zone: 'settings.main', module: 'app-info', block: 'card' },
  ],
});
