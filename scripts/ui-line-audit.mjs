import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const ROOTS = [
  path.join(process.cwd(), "src", "app"),
  path.join(process.cwd(), "src", "components"),
];

const TARGET_EXT = new Set([".tsx", ".ts"]);
const LIMIT = 200;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walk(full)));
      continue;
    }

    const ext = path.extname(entry.name);
    if (!TARGET_EXT.has(ext)) continue;

    const fileStat = await stat(full);
    if (!fileStat.isFile()) continue;

    const content = await readFile(full, "utf8");
    const lines = content.split(/\r?\n/).length;
    if (lines > LIMIT) {
      results.push({
        file: full.replace(`${process.cwd()}${path.sep}`, ""),
        lines,
      });
    }
  }

  return results;
}

const all = [];
for (const root of ROOTS) {
  all.push(...(await walk(root)));
}

all.sort((a, b) => b.lines - a.lines);

if (all.length === 0) {
  console.log(`No UI files over ${LIMIT} lines.`);
  process.exit(0);
}

console.log(`UI files over ${LIMIT} lines:`);
for (const item of all) {
  console.log(`- ${item.file}: ${item.lines}`);
}
