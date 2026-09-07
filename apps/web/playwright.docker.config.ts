import { defineConfig } from '@playwright/test'
import config from './playwright.config.js'

export default defineConfig({
  ...config,
  webServer: undefined,
  use: {
    ...config.use,
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:8080',
  },
  outputDir: 'test-results/docker',
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report/docker' }],
  ],
})
