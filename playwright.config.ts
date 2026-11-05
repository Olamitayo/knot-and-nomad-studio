import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  use: { baseURL: "http://127.0.0.1:4175", channel: "chrome" },
  projects: [
    { name: "desktop", use: { viewport: { width: 1280, height: 900 } } },
    { name: "mobile", use: { viewport: { width: 375, height: 812 } } },
  ],
  webServer: {
    command: "node_modules/.bin/vite --config tests/vite.config.ts",
    url: "http://127.0.0.1:4175/tests/fixtures/index.html",
    reuseExistingServer: false,
  },
});
