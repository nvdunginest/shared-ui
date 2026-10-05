#!/usr/bin/env node
// dist/module-contract.* and dist/dev-shell.* must import only external packages (contract 1, 9.4):
// no relative import, no shared chunk (tsup `splitting` would otherwise tie the entry to the barrel).
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ENTRIES = ["module-contract", "dev-shell"];
const ALLOWED = new Set(["react", "react/jsx-runtime", "react-dom", "antd", "styled-components"]);
const FORBIDDEN_EXTERNALS = ["@ptht365/", "ckeditor5", "@ckeditor", "@react-pdf-viewer", "axios", "jwt-decode", "react-router-dom"];
const problems = [];

for (const entry of ENTRIES) {
  for (const ext of ["js", "cjs"]) {
    const file = join(root, "dist", `${entry}.${ext}`);
    if (!existsSync(file)) {
      problems.push(`${entry}.${ext}: file missing (run npm run build)`);
      continue;
    }
    const text = readFileSync(file, "utf8");
    const specs = [
      ...text.matchAll(/(?:import|export)\s[^'"]*?from\s*["']([^"']+)["']/g),
      ...text.matchAll(/import\s*["']([^"']+)["']/g),
      ...text.matchAll(/require\(\s*["']([^"']+)["']\s*\)/g),
      ...text.matchAll(/import\(\s*["']([^"']+)["']\s*\)/g),
    ].map((m) => m[1]);
    for (const spec of new Set(specs)) {
      if (spec.startsWith(".") || spec.includes("chunk-")) problems.push(`${entry}.${ext}: relative/chunk import "${spec}"`);
      else if (FORBIDDEN_EXTERNALS.some((p) => spec.startsWith(p))) problems.push(`${entry}.${ext}: forbidden import "${spec}"`);
      else if (!ALLOWED.has(spec.split("/").slice(0, spec.startsWith("@") ? 2 : 1).join("/")) && !ALLOWED.has(spec)) {
        problems.push(`${entry}.${ext}: unexpected package "${spec}"`);
      }
    }
    console.log(`info  ${entry}.${ext}: imports ${[...new Set(specs)].join(", ") || "(none)"}`);
  }
}
if (problems.length) {
  problems.forEach((p) => console.error(`FAIL  ${p}`));
  process.exit(1);
}
console.log("check-entry-isolation: OK");
