// Dedicated Playwright config for the SSR e2e suite (tests/ssr).
//
// Separate from playwright.config.ts on purpose: these tests need the Next
// server to do real server-side data fetching against a controlled backend,
// so we boot a mock API and point the Next server's API_URL at it. The main
// e2e config (browser-mocked, no backend) is left untouched.
//
// Runs on its own ports (web 3100, mock 8788) so it can coexist with the
// dev stack and the main e2e server.

import { defineConfig, devices } from "@playwright/test";
import { PUBLIC_ID } from "./tests/ssr/fixtures.mjs";

const WEB_PORT = 3100;
const MOCK_PORT = 8788;
const MOCK_URL = `http://localhost:${MOCK_PORT}`;

export default defineConfig({
  testDir: "tests/ssr",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "node tests/ssr/mock-api.mjs",
      // The mock answers the public entry with 200 once it is ready.
      url: `${MOCK_URL}/v1/entries/${PUBLIC_ID}`,
      env: { MOCK_API_PORT: String(MOCK_PORT) },
      reuseExistingServer: !process.env.CI,
      timeout: 15_000,
    },
    {
      command: "npm run dev",
      url: `http://localhost:${WEB_PORT}`,
      env: {
        PORT: String(WEB_PORT),
        API_URL_INTERNAL: MOCK_URL,
        NEXT_PUBLIC_API_URL: MOCK_URL,
        NEXT_PUBLIC_SITE_URL: `http://localhost:${WEB_PORT}`,
      },
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
  ],
});
