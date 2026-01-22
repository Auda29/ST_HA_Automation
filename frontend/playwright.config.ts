import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E tests
 * 
 * These tests verify the complete workflow from ST code through deployment
 * and execution in a real Home Assistant Docker environment.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Run tests sequentially to avoid HA state conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to avoid HA connection conflicts
  reporter: 'html',
  timeout: 60 * 1000, // 60 seconds per test
  
  use: {
    baseURL: process.env.HA_URL || 'http://localhost:8123',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Global setup: Start HA container if needed
  globalSetup: './e2e/setup.ts',
  
  // Global teardown: Cleanup if needed
  globalTeardown: './e2e/teardown.ts',
});
