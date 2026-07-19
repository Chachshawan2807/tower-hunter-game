import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(root, "package.json"));

function resolveBin(packageName) {
  const pkgDir = path.dirname(require.resolve(`${packageName}/package.json`));
  const { bin } = require(`${packageName}/package.json`);
  const entry = typeof bin === "string" ? bin : bin[packageName];
  return path.join(pkgDir, entry);
}

function runNodeScript(scriptPath, args = []) {
  return spawn(process.execPath, [scriptPath, ...args], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
    windowsHide: true,
  });
}

const api = runNodeScript(resolveBin("tsx"), ["watch", "src/server/index.ts"]);
const web = runNodeScript(resolveBin("vite"));

let exiting = false;

function shutdown(code = 0) {
  if (exiting) return;
  exiting = true;
  api.kill("SIGTERM");
  web.kill("SIGTERM");
  process.exit(code);
}

api.on("exit", (code) => {
  if (code && code !== 0) shutdown(code);
});
web.on("exit", (code) => {
  if (code && code !== 0) shutdown(code);
});

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
