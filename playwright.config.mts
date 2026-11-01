import { defineConfig } from "@playwright/test"

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:4175"

export default defineConfig({
  testDir: "./tests/geofileviewer/e2e",
  testMatch: "**/*.spec.mts",
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL,
    browserName: "chromium",
    channel: process.env.PLAYWRIGHT_CHANNEL,
    trace: "retain-on-failure"
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command:
          "node node_modules/vitepress/bin/vitepress.js preview --host 127.0.0.1 --port 4175",
        url: baseURL,
        reuseExistingServer: !process.env.CI
      }
})
