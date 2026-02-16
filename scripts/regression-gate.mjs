import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

function runCommand(command, args) {
  const startedAt = Date.now();
  const result = spawnSync(command, args, {
    shell: true,
    encoding: "utf8",
    env: process.env,
  });
  const durationMs = Date.now() - startedAt;

  return {
    command: `${command} ${args.join(" ")}`.trim(),
    durationMs,
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function getGitShortHash() {
  const result = spawnSync("git", ["rev-parse", "--short", "HEAD"], {
    shell: true,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    return "unknown";
  }
  return (result.stdout ?? "").trim() || "unknown";
}

function createReport(results) {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:]/g, "-");
  const commit = getGitShortHash();
  const reportsDir = join(process.cwd(), "reports", "pass-evidence");
  mkdirSync(reportsDir, { recursive: true });

  const reportPath = join(reportsDir, `${timestamp}.md`);
  const overallPassed = results.every((item) => item.status === 0);
  const lines = [];

  lines.push("# PASS Evidence Report");
  lines.push("");
  lines.push(`- GeneratedAt: ${now.toISOString()}`);
  lines.push(`- Commit: ${commit}`);
  lines.push(`- Overall: ${overallPassed ? "PASS" : "FAIL"}`);
  lines.push("");
  lines.push("## Steps");
  lines.push("");

  for (const [index, item] of results.entries()) {
    lines.push(
      `${index + 1}. ${item.status === 0 ? "PASS" : "FAIL"} | \`${item.command}\` | ${item.durationMs}ms`,
    );
  }

  lines.push("");
  lines.push("## Logs");
  lines.push("");

  for (const item of results) {
    lines.push(
      `### ${item.status === 0 ? "PASS" : "FAIL"} \`${item.command}\``,
    );
    lines.push("");
    lines.push("```text");
    const combined = `${item.stdout}${item.stderr}`.trim();
    lines.push(combined || "(no output)");
    lines.push("```");
    lines.push("");
  }

  writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");
  return { reportPath, overallPassed };
}

const commands = [
  ["npm", ["run", "audit:ui-lines"]],
  ["npm", ["run", "lint"]],
  ["npm", ["run", "test:all"]],
  ["npm", ["run", "build"]],
];

const results = [];
for (const [command, args] of commands) {
  const result = runCommand(command, args);
  results.push(result);
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);

  if (result.status !== 0) {
    break;
  }
}

const { reportPath, overallPassed } = createReport(results);
console.log(`\n[gate] report: ${reportPath}`);
process.exit(overallPassed ? 0 : 1);
