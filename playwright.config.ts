import { defineConfig, devices } from '@playwright/test';

const extraLib = '/home/node/chrome-deps/root/usr/lib/x86_64-linux-gnu:/home/node/chrome-deps/root/lib/x86_64-linux-gnu';
process.env.LD_LIBRARY_PATH = process.env.LD_LIBRARY_PATH
  ? `${extraLib}:${process.env.LD_LIBRARY_PATH}`
  : extraLib;
process.env.FONTCONFIG_PATH = '/home/node/chrome-deps/root/etc/fonts';

// Runs against the production build (vite preview) with mock connectors, at phone viewports.
// Both projects use Chromium so only one browser needs installing: npx playwright install chromium
export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  fullyParallel: true,
  reporter: process.env.CI ? 'line' : 'list',
  use: {
    baseURL: 'http://localhost:4173/',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'iphone', use: { ...devices['iPhone 15'], browserName: 'chromium' } },
    { name: 'pixel', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173/',
    reuseExistingServer: !process.env.CI,
  },
});
