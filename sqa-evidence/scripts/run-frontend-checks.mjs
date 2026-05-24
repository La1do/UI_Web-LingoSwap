import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const outDir = path.resolve(root, "sqa-evidence/data");
const isWin = process.platform === "win32";

const checks = [
  {
    id: "tsc",
    tool: "TypeScript",
    command: isWin ? "npx.cmd" : "npx",
    args: ["tsc", "--noEmit"],
    output: "tsc-output.txt",
  },
  {
    id: "eslint",
    tool: "ESLint",
    command: isWin ? "npx.cmd" : "npx",
    args: ["eslint", "src"],
    output: "eslint-output.txt",
  },
  {
    id: "build",
    tool: "Vite Build",
    command: isWin ? "npm.cmd" : "npm",
    args: ["run", "build"],
    output: "build-output.txt",
  },
];

function runCheck(check) {
  return new Promise((resolve) => {
    const startedAt = new Date();
    console.log("");
    console.log(`=== Running ${check.tool} ===`);
    console.log(`$ ${check.command} ${check.args.join(" ")}`);

    const child = spawn(check.command, check.args, {
      cwd: root,
      shell: isWin,
      env: { ...process.env, FORCE_COLOR: "0" },
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
      const status = code === 0 ? "PASS" : "FAIL";
      const durationMs = finishedAt.getTime() - startedAt.getTime();
      const output = [
        `$ ${check.command} ${check.args.join(" ")}`,
        `Started: ${startedAt.toISOString()}`,
        `Finished: ${finishedAt.toISOString()}`,
        `Duration: ${durationMs}ms`,
        `Exit code: ${code}`,
        "",
        "STDOUT:",
        stdout || "(empty)",
        "",
        "STDERR:",
        stderr || "(empty)",
      ].join("\n");

      await writeFile(path.join(outDir, check.output), output, "utf8");
      resolve({
        id: check.id,
        tool: check.tool,
        command: `${check.command} ${check.args.join(" ")}`,
        status,
        exitCode: code,
        durationMs,
        output: `data/${check.output}`,
        startedAt: startedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
      });
    });
  });
}

await mkdir(outDir, { recursive: true });

const startedAt = new Date();
const results = [];
for (const check of checks) {
  results.push(await runCheck(check));
}
const finishedAt = new Date();
const passed = results.filter((r) => r.status === "PASS").length;
const failed = results.length - passed;

const summary = {
  title: "LingoSwap Frontend Check Summary",
  startedAt: startedAt.toISOString(),
  finishedAt: finishedAt.toISOString(),
  total: results.length,
  passed,
  failed,
  status: failed === 0 ? "PASS" : "FAIL",
  results,
};

await writeFile(
  path.join(outDir, "frontend-check-summary.json"),
  JSON.stringify(summary, null, 2),
  "utf8",
);

console.log("");
console.log("=== Frontend Checks Summary ===");
console.log(`Status: ${summary.status}`);
console.log(`Total: ${summary.total}`);
console.log(`Passed: ${summary.passed}`);
console.log(`Failed: ${summary.failed}`);
console.log("");
console.log("Executed checks:");
for (const item of results) {
  const duration = item.durationMs ? `${(item.durationMs / 1000).toFixed(1)}s` : "-";
  console.log(`- [${item.status}] ${item.tool} :: ${item.command} (${duration})`);
  console.log(`  output: ${item.output}`);
}
console.log("");
console.log(`Summary: ${path.relative(root, path.join(outDir, "frontend-check-summary.json"))}`);
process.exit(failed === 0 ? 0 : 1);
