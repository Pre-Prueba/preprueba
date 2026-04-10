import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';

const projectDir = fileURLToPath(new URL('.', import.meta.url));
const env = loadEnv('test', projectDir, '');
Object.assign(process.env, env);

process.env.E2E_TEST_MODE = process.env.E2E_TEST_MODE ?? '1';
process.env.VITE_API_URL = process.env.VITE_API_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: process.env.CI ? 2 : 1,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'npm --prefix ../api run dev',
      url: 'http://localhost:3000/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'npm run dev -- --host localhost --mode test',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
