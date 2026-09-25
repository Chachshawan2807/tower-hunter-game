import fs from "node:fs";

const path = new URL("../package.json", import.meta.url);
const raw = fs.readFileSync(path);

if (raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf) {
  console.error("package.json must be UTF-8 without a BOM");
  process.exit(1);
}

const text = raw.toString("utf8");
try {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("root must be an object");
  }
  if (!parsed.scripts || typeof parsed.scripts !== "object" || Array.isArray(parsed.scripts)) {
    throw new Error("scripts must be an object");
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`package.json is not strict JSON: ${message}`);
  process.exit(1);
}
