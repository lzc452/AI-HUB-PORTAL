import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  workers: 2,
  expect: { timeout: 30_000 },
  use: { baseURL: "http://127.0.0.1:4173", trace: "retain-on-failure", navigationTimeout: 90_000 },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    env: { VITE_PORTAL_USE_FIXTURES: "true" },
    // Fixture E2E 必须启动带有显式 fixtures 环境变量的新服务器，避免复用手工启动的真实模式进程。
    reuseExistingServer: false,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true } },
  ],
});
