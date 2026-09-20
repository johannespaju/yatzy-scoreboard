import { defineConfig, devices } from "@playwright/test";

// E2E tests run against a dedicated dev server on a phone-sized viewport,
// since the app is mobile-first.
const PORT = 3100;

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
  },
});
