#!/usr/bin/env node
// Verifies the public surface of the EXISTING entries did not change (contract 9.4):
//  - every export name of dist/{index,platform,shared-users}.d.ts equals scripts/exports-baseline.txt
//    (a name may be a value or a type; changing one into the other counts as a change)
//  - the source files that define existing behaviour (src/index.ts, src/layout/*) are byte-identical
// Entries added later (module-contract, dev-shell) are only listed. Run `--update` to rewrite the baseline.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const baselineFile = join(root, "scripts", "exports-baseline.txt");
const BASELINE_ENTRIES = ["index", "platform", "shared-users"];
const HASHED_SOURCES = ["src/index.ts", ...readdirSync(join(root, "src/layout"), { recursive: true })
  .filter((f) => /\.(ts|tsx)$/.test(String(f))).map((f) => `src/layout/${f}`).sort()];

function exportsOf(entry) {
  const text = readFileSync(join(root, "dist", `${entry}.d.ts`), "utf8");
  const out = new Set();
  for (const m of text.matchAll(/^export\s*\{([^}]*)\}(?:\s*from\s*['"][^'"]+['"])?;?$/gms)) {
    for (const raw of m[1].split(",")) {
      const item = raw.trim();
      if (!item) continue;
      const isType = /^type\s+/.test(item);
      const name = item.replace(/^type\s+/, "").split(/\s+as\s+/).pop().trim();
      out.add(`${entry} ${isType ? "type" : "value"} ${name}`);
    }
  }
  if (/^export default /m.test(text)) out.add(`${entry} value default`);
  return out;
}

const sha = (file) => createHash("sha256").update(readFileSync(join(root, file))).digest("hex");
const current = [
  ...BASELINE_ENTRIES.flatMap((e) => [...exportsOf(e)]),
  ...HASHED_SOURCES.map((f) => `sha256 ${f} ${sha(f)}`),
].sort();

if (process.argv.includes("--update")) {
  writeFileSync(baselineFile, current.join("\n") + "\n");
  console.log(`check-exports: baseline written (${current.length} lines)`);
  process.exit(0);
}

if (!existsSync(baselineFile)) {
  console.error("check-exports: scripts/exports-baseline.txt is missing");
  process.exit(1);
}
const baseline = readFileSync(baselineFile, "utf8").split("\n").filter(Boolean).sort();
const removed = baseline.filter((l) => !current.includes(l));
const added = current.filter((l) => !baseline.includes(l));
const extra = ["module-contract", "dev-shell"].filter((e) => existsSync(join(root, "dist", `${e}.d.ts`)))
  .map((e) => `${e}: ${exportsOf(e).size} exports (not part of the baseline)`);
extra.forEach((l) => console.log(`info  ${l}`));
if (removed.length || added.length) {
  removed.forEach((l) => console.error(`REMOVED/CHANGED  ${l}`));
  added.forEach((l) => console.error(`ADDED/CHANGED    ${l}`));
  console.error("check-exports: FAILED. Existing entries must only be extended through new entries.");
  process.exit(1);
}
console.log(`check-exports: OK (${baseline.length} baseline lines unchanged: ${baseline.filter((l) => !l.startsWith("sha256")).length} exports + ${HASHED_SOURCES.length} source hashes)`);
