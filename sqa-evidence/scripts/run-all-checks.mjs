import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const outDir = path.resolve(root, "sqa-evidence/data");
const isWin = process.platform === "win32";
const nodeCommand = isWin ? "node.exe" : "node";
const passthroughFlags = process.argv.slice(2);

await mkdir(outDir, { recursive: true });

function runStep(step) {
  return new Promise((resolve) => {
    console.log("");
    console.log(`######## ${step.name} ########`);
    console.log(`$ ${nodeCommand} ${step.args.join(" ")}`);

    const startedAt = new Date();
    const child = spawn(nodeCommand, step.args, {
      cwd: root,
      shell: isWin,
      env: { ...process.env, FORCE_COLOR: "0" },
    });

    child.stdout.on("data", (chunk) => process.stdout.write(chunk.toString()));
    child.stderr.on("data", (chunk) => process.stderr.write(chunk.toString()));
    child.on("close", (code) => {
      const finishedAt = new Date();
      resolve({
        name: step.name,
        command: `${nodeCommand} ${step.args.join(" ")}`,
        status: code === 0 ? "PASS" : "FAIL",
        exitCode: code,
        durationMs: finishedAt.getTime() - startedAt.getTime(),
        startedAt: startedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
      });
    });
  });
}

async function readJson(relativePath) {
  try {
    return JSON.parse(await readFile(path.join(root, relativePath), "utf8"));
  } catch {
    return null;
  }
}

const startedAt = new Date();
const steps = [
  {
    name: "Frontend static/build checks",
    args: ["sqa-evidence\\scripts\\run-frontend-checks.mjs"],
  },
  {
    name: "Playwright UI checks",
    args: ["sqa-evidence\\scripts\\run-playwright-ui.mjs", ...passthroughFlags],
  },
];

const results = [];
for (const step of steps) {
  results.push(await runStep(step));
}

const frontendSummary = await readJson("sqa-evidence/data/frontend-check-summary.json");
const playwrightSummary = await readJson("sqa-evidence/data/playwright-ui-summary.json");
const failed = results.filter((item) => item.status !== "PASS").length;
const finishedAt = new Date();

const summary = {
  title: "LingoSwap Full SQA Run Summary",
  status: failed === 0 ? "PASS" : "FAIL",
  startedAt: startedAt.toISOString(),
  finishedAt: finishedAt.toISOString(),
  totalSteps: results.length,
  passedSteps: results.length - failed,
  failedSteps: failed,
  results,
  frontend: frontendSummary ? {
    status: frontendSummary.status,
    total: frontendSummary.total,
    passed: frontendSummary.passed,
    failed: frontendSummary.failed,
  } : null,
  playwright: playwrightSummary ? {
    status: playwrightSummary.status,
    total: playwrightSummary.total,
    passed: playwrightSummary.passed,
    failed: playwrightSummary.failed,
    skipped: playwrightSummary.skipped,
  } : null,
};

await writeFile(path.join(outDir, "full-run-summary.json"), JSON.stringify(summary, null, 2), "utf8");

console.log("");
console.log("######## Full SQA Run Summary ########");
console.log(`Status: ${summary.status}`);
console.log(`Steps: ${summary.passedSteps}/${summary.totalSteps} passed`);
if (summary.frontend) {
  console.log(`Frontend checks: ${summary.frontend.status} (${summary.frontend.passed}/${summary.frontend.total} passed, ${summary.frontend.failed} failed)`);
}
if (summary.playwright) {
  console.log(`Playwright UI: ${summary.playwright.status} (${summary.playwright.passed}/${summary.playwright.total} passed, ${summary.playwright.failed} failed, ${summary.playwright.skipped} skipped)`);
}
console.log("Summary: sqa-evidence\\data\\full-run-summary.json");

process.exit(summary.status === "PASS" ? 0 : 1);
