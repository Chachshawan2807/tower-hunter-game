import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const SRC = join(ROOT, "src");

let failed = 0;

function fail(message: string) {
  failed++;
  console.error(`  ✗ ${message}`);
}

function pass(message: string) {
  console.log(`  ✓ ${message}`);
}

function collectTsFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];

  for (const entry of entries) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      files.push(...collectTsFiles(full));
    } else if (entry.endsWith(".ts") || entry.endsWith(".tsx")) {
      files.push(full);
    }
  }

  return files;
}

function relativePath(file: string): string {
  return relative(ROOT, file).replace(/\\/g, "/");
}

function checkImportPatterns(
  label: string,
  files: string[],
  patterns: RegExp[],
  message: string
) {
  console.log(`\n=== Architecture: ${label} ===`);
  let violations = 0;

  for (const file of files) {
    const content = readFileSync(file, "utf8");
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        fail(`${relativePath(file)} — ${message}`);
        violations++;
        break;
      }
    }
  }

  if (violations === 0) {
    pass(`no violations in ${files.length} file(s)`);
  }
}

const engineFiles = collectTsFiles(join(SRC, "engine"));
const componentFiles = collectTsFiles(join(SRC, "components"));
const hookFiles = collectTsFiles(join(SRC, "hooks"));
const clientFiles = [...componentFiles, ...hookFiles];

checkImportPatterns(
  "Engine purity (no UI/framework)",
  engineFiles,
  [
    /from\s+['"]react['"]/,
    /from\s+['"]react-dom/,
    /\bdocument\./,
    /\bwindow\./,
    /from\s+['"][^'"]*\/components\//,
    /from\s+['"][^'"]*\/server\//,
    /from\s+['"][^'"]*\/hooks\//,
  ],
  "engine must not import React, DOM, server, hooks, or components"
);

checkImportPatterns(
  "Client must not import server internals",
  clientFiles,
  [/from\s+['"][^'"]*\/server\//],
  "use src/utils/api.ts instead of importing server code"
);

checkImportPatterns(
  "Engine must not import client API layer",
  engineFiles,
  [/from\s+['"][^'"]*\/utils\/api/],
  "engine must stay framework-agnostic"
);

console.log(`\n=== Architecture results: ${failed} violation(s) ===`);
process.exit(failed > 0 ? 1 : 0);
