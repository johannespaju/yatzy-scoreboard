import { defineConfig, devices } from "@playwright/test";

// E2E tests run against a dedicated dev server on a phone-sized viewport,
// since the app is mobile-first. Set E2E_PORT to reuse a dev server that is
// already running (Next allows only one per project directory).
const PORT = Number(process.env.E2E_PORT ?? 3100);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Pixel 7"], browserName: "chromium" } }],
  webServer: {
    command: `npm run dev -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    env: { PLAYWRIGHT: "1" },
    reuseExistingServer: !process.env.CI,
  },
});
