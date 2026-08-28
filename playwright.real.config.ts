import { defineConfig, devices } from "@playwright/test";

/**
 * Real integration profile. Credentials are read only by the test process from
 * environment variables; this profile never enables fixtures and never reuses
 * an existing dev server.
 */
export default defineConfig({
  testDir: "./tests/e2e-real",
  fullyParallel: false,
  workers: 1,
  use: { baseURL: "http://127.0.0.1:4174", trace: "retain-on-failure" },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4174",
    url: "http://127.0.0.1:4174",
    env: { VITE_PORTAL_USE_FIXTURES: "false" },
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [{ name: "real-desktop", use: { ...devices["Desktop Chrome"] } }],
});
