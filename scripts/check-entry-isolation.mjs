#!/usr/bin/env node
// Entry policy (docs/consolidation-plan.md, section 3). Reads dist/ after `npm run build`.
//
//  strict  entries (module-contract, dev-shell): import only a short list of external packages and nothing relative
//          (contract 1, 9.4): no relative import, no shared chunk (tsup `splitting` would tie the entry to the barrel).
//  light   entries (ui, theme, mdms): may share chunks with each other, but everything reachable from the entry
//          (following relative imports) must stay free of the heavy packages (CKEditor, PDF viewer...).
//  heavy   entries (editor, file-viewer, document-kit): no restriction here; they are shared through the shell.
//
// An entry listed below that is not built yet is only reported (planned entries are checked as soon as they exist).
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

const STRICT_ALLOWED = new Set(["react", "react/jsx-runtime", "react-dom", "antd", "styled-components"]);
const STRICT_FORBIDDEN = ["@ptht365/", "ckeditor5", "@ckeditor", "@react-pdf-viewer", "axios", "jwt-decode", "react-router-dom"];
// axios is allowed: every app already bundles it (it is not what makes an entry heavy).
const LIGHT_FORBIDDEN = ["ckeditor5", "@ckeditor", "@react-pdf-viewer", "pdfjs-dist"];
// A light entry reaches the shared singletons by package name (the app's bundler resolves them); nothing else of this package.
const LIGHT_ALLOWED_SELF = new Set(["@ptht365/shared-ui/platform", "@ptht365/shared-ui/module-contract", "@ptht365/shared-ui/shared-users"]);

const POLICY = [
  { entry: "module-contract", mode: "strict" },
  { entry: "dev-shell", mode: "strict" },
  { entry: "ui", mode: "light" },
  { entry: "platform-kit", mode: "light" },
  { entry: "signalr", mode: "light" },
  { entry: "theme", mode: "light" },
  { entry: "utils", mode: "light" },
  { entry: "mdms", mode: "light" },
  { entry: "editor", mode: "heavy" },
  { entry: "file-viewer", mode: "heavy" },
  { entry: "document-kit", mode: "heavy" },
];

const problems = [];
const pkgOf = (spec) => spec.split("/").slice(0, spec.startsWith("@") ? 2 : 1).join("/");

function specsOf(file) {
  const text = readFileSync(file, "utf8");
  return [
    ...new Set(
      [
        ...text.matchAll(/(?:import|export)\s[^'"]*?from\s*["']([^"']+)["']/g),
        ...text.matchAll(/import\s*["']([^"']+)["']/g),
        ...text.matchAll(/require\(\s*["']([^"']+)["']\s*\)/g),
        ...text.matchAll(/import\(\s*["']([^"']+)["']\s*\)/g),
      ].map((m) => m[1]),
    ),
  ];
}

/** External packages reachable from `file`, following relative imports (chunks). */
function reachableExternals(file, seen = new Set()) {
  if (seen.has(file)) return new Set();
  seen.add(file);
  const out = new Set();
  for (const spec of specsOf(file)) {
    if (spec.startsWith(".")) {
      const next = resolve(dirname(file), spec);
      if (existsSync(next)) reachableExternals(next, seen).forEach((x) => out.add(x));
    } else out.add(spec);
  }
  return out;
}

for (const { entry, mode } of POLICY) {
  for (const ext of ["js", "cjs"]) {
    const file = join(dist, `${entry}.${ext}`);
    if (!existsSync(file)) {
      if (mode === "strict") problems.push(`${entry}.${ext}: file missing (run npm run build)`);
      else if (ext === "js") console.log(`info  ${entry}: not built yet (${mode})`);
      continue;
    }
    if (mode === "heavy") {
      console.log(`info  ${entry}.${ext}: heavy entry, no restriction`);
      continue;
    }
    if (mode === "strict") {
      const specs = specsOf(file);
      for (const spec of specs) {
        if (spec.startsWith(".") || spec.includes("chunk-")) problems.push(`${entry}.${ext}: relative/chunk import "${spec}"`);
        else if (STRICT_FORBIDDEN.some((p) => spec.startsWith(p))) problems.push(`${entry}.${ext}: forbidden import "${spec}"`);
        else if (!STRICT_ALLOWED.has(pkgOf(spec)) && !STRICT_ALLOWED.has(spec)) problems.push(`${entry}.${ext}: unexpected package "${spec}"`);
      }
      console.log(`info  ${entry}.${ext}: imports ${specs.join(", ") || "(none)"}`);
    } else {
      const externals = [...reachableExternals(file)];
      for (const spec of externals) {
        if (LIGHT_FORBIDDEN.some((p) => spec.startsWith(p))) problems.push(`${entry}.${ext}: reaches heavy package "${spec}"`);
        else if (spec.startsWith("@ptht365/") && !LIGHT_ALLOWED_SELF.has(spec)) problems.push(`${entry}.${ext}: imports "${spec}" (allowed: ${[...LIGHT_ALLOWED_SELF].join(", ")})`);
      }
      console.log(`info  ${entry}.${ext}: reaches ${externals.join(", ") || "(none)"}`);
    }
  }
}

if (problems.length) {
  problems.forEach((p) => console.error(`FAIL  ${p}`));
  process.exit(1);
}
console.log("check-entry-isolation: OK");
