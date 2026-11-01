import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/geofileviewer/e2e",
  testMatch: "**/*.spec.mts",
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: "http://127.0.0.1:4175",
    browserName: "chromium",
    channel: process.env.PLAYWRIGHT_CHANNEL,
    trace: "retain-on-failure"
  },
  webServer: {
    command:
      "node node_modules/vitepress/bin/vitepress.js preview --host 127.0.0.1 --port 4175",
    url: "http://127.0.0.1:4175",
    reuseExistingServer: !process.env.CI
  }
})
