import { networkInterfaces } from 'node:os';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { renderUnicodeCompact } from 'uqr';
import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';

const dir = (path: string) => fileURLToPath(new URL(path, import.meta.url));

/** Prints a QR code with the ProtoShell deep link for the LAN dev URL (scan it in the shell launcher). */
function protoshellQr(): Plugin {
  return {
    name: 'protoshell-qr',
    configureServer(server) {
      server.httpServer?.once('listening', () => {
        const address = server.httpServer?.address();
        const port = typeof address === 'object' && address ? address.port : server.config.server.port;
        const lan = Object.values(networkInterfaces())
          .flat()
          .find((i) => i && i.family === 'IPv4' && !i.internal)?.address;
        if (!lan) return;
        const url = `http://${lan}:${port}/`;
        const deepLink = `protoshell://open?url=${encodeURIComponent(url)}`;
        server.config.logger.info(`\n  Scan in ProtoShell (or with the system camera):\n\n${renderUnicodeCompact(deepLink)}\n  ${url}\n`);
      });
    },
  };
}

export default defineConfig({
  // Relative base + hash router: dist/ works from any folder on any static host (FTP upload).
  base: './',
  plugins: [react(), tailwindcss(), protoshellQr()],
  resolve: {
    alias: {
      '@core': dir('./src/core'),
      '@modules': dir('./modules'),
      '@app': dir('./src'),
    },
  },
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
  build: { target: 'es2022', sourcemap: true, chunkSizeWarningLimit: 1000 },
  test: {
    // The ProtoShell packages ship extensionless ESM imports: let Vite transform them.
    server: { deps: { inline: [/@protoshell\//] } },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          setupFiles: ['./src/core/testing/setup.ts'],
          include: ['src/**/*.test.{ts,tsx}', 'modules/**/*.test.{ts,tsx}'],
          exclude: ['src/core/validate/**', 'modules/_*/**', 'node_modules/**'],
        },
      },
      {
        extends: true,
        test: {
          name: 'validate',
          environment: 'jsdom',
          include: ['src/core/validate/**/*.test.ts'],
        },
      },
    ],
  },
});
