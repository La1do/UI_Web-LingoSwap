import { defineConfig, devices } from "@playwright/test";

const recordMode = process.env.SQA_PLAYWRIGHT_RECORD !== "0";
const headedMode = process.env.SQA_PLAYWRIGHT_HEADED === "1";
const slowMo = Number(process.env.SQA_PLAYWRIGHT_SLOWMO ?? 0);

export default defineConfig({
  testDir: "./tests",
  outputDir: "./data/playwright-results",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: false,
  reporter: [
    ["html", { outputFolder: "./data/playwright-report", open: "never" }],
    ["json", { outputFile: "./data/playwright-summary.json" }],
    ["list"],
  ],
  use: {
    baseURL: "http://127.0.0.1:5173",
    headless: !headedMode,
    trace: recordMode ? "on" : "retain-on-failure",
    video: recordMode ? "on" : "retain-on-failure",
    screenshot: recordMode ? "on" : "only-on-failure",
    launchOptions: {
      slowMo,
    },
  },
  webServer: {
    command: "npm.cmd run dev -- --host 127.0.0.1",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
