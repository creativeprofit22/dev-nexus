import { defineConfig, devices } from "@playwright/test";
import path from "path";

const PORT = process.env.PORT || 3000;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: path.join(__dirname, "e2e"),
  timeout: 30 * 1000,
  retries: process.env.CI ? 2 : 0,
  outputDir: "test-results/",
  reporter: process.env.CI ? "github" : "list",

  webServer: {
    command: "npm run dev",
    url: baseURL,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },

  use: {
    baseURL,
    trace: "retry-with-trace",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
