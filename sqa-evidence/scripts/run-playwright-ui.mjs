import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const outDir = path.resolve(root, "sqa-evidence/data");
const isWin = process.platform === "win32";
const playwrightInstalled = existsSync(path.join(root, "node_modules/@playwright/test"));
const cliFlags = new Set(process.argv.slice(2));
const headedMode = cliFlags.has("--headed");
const recordMode = !cliFlags.has("--no-record");
const slowMode = cliFlags.has("--slow");
const slowMo = slowMode ? "1500" : "0";
const runMode = headedMode || slowMode ? "visual" : recordMode ? "headless-recorded" : "headless";

await mkdir(outDir, { recursive: true });

if (!playwrightInstalled) {
  const evidence = {
    title: "LingoSwap Playwright Evidence Artifacts",
    generatedAt: new Date().toISOString(),
    command: "npx.cmd playwright test --config sqa-evidence/playwright.config.ts",
    record: false,
    root: "sqa-evidence/data",
    summary: {
      videos: 0,
      traces: 0,
      screenshots: 0,
      total: 0,
    },
    artifacts: [],
  };
  const summary = {
    title: "LingoSwap Playwright UI Summary",
    status: "SKIPPED",
    reason: "@playwright/test is not installed",
    command: "npx.cmd playwright test --config sqa-evidence/playwright.config.ts",
    installHint: "npm.cmd install -D @playwright/test && npx.cmd playwright install chromium",
    mode: runMode,
    appUnderTest: "http://127.0.0.1:5173",
    evidenceDashboard: "http://localhost:8088",
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 1,
    evidence: {
      manifest: "data/playwright-evidence.json",
      videos: 0,
      traces: 0,
      screenshots: 0,
    },
    finishedAt: new Date().toISOString(),
  };
  await writeFile(path.join(outDir, "playwright-evidence.json"), JSON.stringify(evidence, null, 2), "utf8");
  await writeFile(path.join(outDir, "playwright-ui-summary.json"), JSON.stringify(summary, null, 2), "utf8");
  await writeFile(path.join(outDir, "playwright-output.txt"), `${summary.status}: ${summary.reason}\n${summary.installHint}\n`, "utf8");
  console.log("Playwright UI checks skipped: @playwright/test is not installed");
  process.exit(0);
}

const command = isWin ? "npx.cmd" : "npx";
const args = ["playwright", "test", "--config", "sqa-evidence/playwright.config.ts"];
const startedAt = new Date();
const env = {
  ...process.env,
  FORCE_COLOR: "0",
  SQA_PLAYWRIGHT_HEADED: headedMode ? "1" : "0",
  SQA_PLAYWRIGHT_RECORD: recordMode ? "1" : "0",
  SQA_PLAYWRIGHT_SLOWMO: slowMo,
};

const result = await new Promise((resolve) => {
  const child = spawn(command, args, {
    cwd: root,
    shell: isWin,
    env,
  });

  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => {
    const text = chunk.toString();
    stdout += text;
    process.stdout.write(text);
  });
  child.stderr.on("data", (chunk) => {
    const text = chunk.toString();
    stderr += text;
    process.stderr.write(text);
  });
  child.on("close", async (code) => {
    const finishedAt = new Date();
    await writeFile(path.join(outDir, "playwright-output.txt"), [
      `$ ${command} ${args.join(" ")}`,
      `Started: ${startedAt.toISOString()}`,
      `Finished: ${finishedAt.toISOString()}`,
      `Mode: ${runMode}`,
      `Headed: ${headedMode}`,
      `Record: ${recordMode}`,
      `SlowMo: ${slowMo}ms`,
      `App under test: http://127.0.0.1:5173`,
      `Evidence dashboard: http://localhost:8088`,
      `Exit code: ${code}`,
      "",
      "STDOUT:",
      stdout || "(empty)",
      "",
      "STDERR:",
      stderr || "(empty)",
    ].join("\n"), "utf8");
    resolve({
      title: "LingoSwap Playwright UI Summary",
      status: code === 0 ? "PASS" : "FAIL",
      command: `${command} ${args.join(" ")}`,
      runnerCommand: `node sqa-evidence\\scripts\\run-playwright-ui.mjs${headedMode ? " --headed" : ""}${recordMode ? "" : " --no-record"}${slowMode ? " --slow" : ""}`,
      mode: runMode,
      headed: headedMode,
      record: recordMode,
      slowMo: Number(slowMo),
      appUnderTest: "http://127.0.0.1:5173",
      evidenceDashboard: "http://localhost:8088",
      exitCode: code,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      report: "data/playwright-report/index.html",
      output: "data/playwright-output.txt",
    });
  });
});

function collectSpecs(suites, bucket = []) {
  for (const suite of suites ?? []) {
    for (const spec of suite.specs ?? []) {
      const firstTest = spec.tests?.[0];
      const firstResult = firstTest?.results?.[0];
      bucket.push({
        file: spec.file,
        title: spec.title,
        status: firstResult?.status ?? firstTest?.status ?? "unknown",
        expectedStatus: firstTest?.expectedStatus ?? "passed",
        ok: spec.ok === true,
        durationMs: firstResult?.duration ?? 0,
        startedAt: firstResult?.startTime ?? null,
        retry: firstResult?.retry ?? 0,
        attachments: (firstResult?.attachments ?? []).map((item) => ({
          name: item.name,
          contentType: item.contentType,
          path: item.path ? path.relative(outDir, item.path).replaceAll("\\", "/") : null,
        })),
      });
    }
    collectSpecs(suite.suites, bucket);
  }
  return bucket;
}

async function collectEvidenceFiles(directory, bucket = []) {
  if (!existsSync(directory)) return bucket;

  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await collectEvidenceFiles(absolutePath, bucket);
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();
    const type = extension === ".webm"
      ? "video"
      : extension === ".zip"
        ? "trace"
        : extension === ".png"
          ? "screenshot"
          : null;

    if (!type) continue;
    bucket.push({
      type,
      name: entry.name,
      path: path.relative(outDir, absolutePath).replaceAll("\\", "/"),
    });
  }

  return bucket;
}

try {
  const rawReport = await readFile(path.join(outDir, "playwright-summary.json"), "utf8");
  const report = JSON.parse(rawReport);
  const stats = report.stats ?? {};
  const tests = collectSpecs(report.suites);
  const evidenceFiles = await collectEvidenceFiles(path.join(outDir, "playwright-results"));
  const evidence = {
    title: "LingoSwap Playwright Evidence Artifacts",
    generatedAt: new Date().toISOString(),
    command: result.runnerCommand,
    record: result.record,
    root: "sqa-evidence/data",
    summary: {
      videos: evidenceFiles.filter((item) => item.type === "video").length,
      traces: evidenceFiles.filter((item) => item.type === "trace").length,
      screenshots: evidenceFiles.filter((item) => item.type === "screenshot").length,
      total: evidenceFiles.length,
    },
    artifacts: evidenceFiles,
  };
  result.total = (stats.expected ?? 0) + (stats.unexpected ?? 0) + (stats.flaky ?? 0) + (stats.skipped ?? 0);
  result.passed = stats.expected ?? 0;
  result.failed = stats.unexpected ?? 0;
  result.flaky = stats.flaky ?? 0;
  result.skipped = stats.skipped ?? 0;
  result.durationMs = stats.duration ?? null;
  result.tests = tests;
  result.evidence = {
    manifest: "data/playwright-evidence.json",
    videos: evidence.summary.videos,
    traces: evidence.summary.traces,
    screenshots: evidence.summary.screenshots,
  };
  await writeFile(path.join(outDir, "playwright-evidence.json"), JSON.stringify(evidence, null, 2), "utf8");
  await writeFile(path.join(outDir, "playwright-tests.json"), JSON.stringify({
    title: "LingoSwap Playwright Test Results",
    generatedAt: new Date().toISOString(),
    command: result.runnerCommand,
    appUnderTest: result.appUnderTest,
    summary: {
      total: result.total,
      passed: result.passed,
      failed: result.failed,
      flaky: result.flaky,
      skipped: result.skipped,
      durationMs: result.durationMs,
    },
    tests,
  }, null, 2), "utf8");
} catch {
  const evidence = {
    title: "LingoSwap Playwright Evidence Artifacts",
    generatedAt: new Date().toISOString(),
    command: result.runnerCommand,
    record: result.record,
    root: "sqa-evidence/data",
    summary: {
      videos: 0,
      traces: 0,
      screenshots: 0,
      total: 0,
    },
    artifacts: [],
  };
  result.total = null;
  result.passed = null;
  result.failed = null;
  result.flaky = null;
  result.skipped = null;
  result.durationMs = null;
  result.tests = [];
  result.evidence = {
    manifest: "data/playwright-evidence.json",
    videos: 0,
    traces: 0,
    screenshots: 0,
  };
  await writeFile(path.join(outDir, "playwright-evidence.json"), JSON.stringify(evidence, null, 2), "utf8");
}

await writeFile(path.join(outDir, "playwright-ui-summary.json"), JSON.stringify(result, null, 2), "utf8");

console.log("");
console.log("=== Playwright UI Summary ===");
console.log(`Status: ${result.status}`);
console.log(`Mode: ${result.mode}`);
console.log(`App under test: ${result.appUnderTest}`);
console.log(`Total: ${result.total ?? 0}`);
console.log(`Passed: ${result.passed ?? 0}`);
console.log(`Failed: ${result.failed ?? 0}`);
console.log(`Skipped: ${result.skipped ?? 0}`);
console.log(`Duration: ${result.durationMs ? `${(result.durationMs / 1000).toFixed(1)}s` : "-"}`);
console.log(`Videos: ${result.evidence?.videos ?? 0}`);
console.log(`Traces: ${result.evidence?.traces ?? 0}`);
console.log(`Screenshots: ${result.evidence?.screenshots ?? 0}`);

if (Array.isArray(result.tests) && result.tests.length > 0) {
  console.log("");
  console.log("Executed tests:");
  for (const item of result.tests) {
    const icon = item.status === "passed" ? "PASS" : item.status === "failed" ? "FAIL" : String(item.status).toUpperCase();
    const duration = item.durationMs ? `${(item.durationMs / 1000).toFixed(1)}s` : "-";
    console.log(`- [${icon}] ${item.file} :: ${item.title} (${duration})`);
  }
}

console.log("");
console.log(`HTML report: sqa-evidence\\data\\playwright-report\\index.html`);
console.log(`Evidence manifest: sqa-evidence\\data\\playwright-evidence.json`);
console.log(`JSON summary: sqa-evidence\\data\\playwright-ui-summary.json`);
process.exit(result.status === "PASS" ? 0 : 1);
