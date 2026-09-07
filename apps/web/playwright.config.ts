import { defineConfig, devices } from '@playwright/test'

const baseURL = 'http://127.0.0.1:4173'
const isCI = Boolean(process.env.CI)

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL, trace: 'on-first-retry', screenshot: 'only-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'pnpm --filter api... build && pnpm --filter api start',
      env: { HOST: '127.0.0.1', PORT: '3002' },
      url: 'http://127.0.0.1:3002/api/health',
      reuseExistingServer: !isCI,
      timeout: 120_000,
    },
    {
      command: 'pnpm exec vite --host 127.0.0.1 --port 4173 --strictPort',
      env: { API_PROXY_TARGET: 'http://127.0.0.1:3002' },
      url: baseURL,
      reuseExistingServer: !isCI,
      timeout: 120_000,
    },
  ],
})
