import { spawn } from "node:child_process";

const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";

function run(script) {
  return spawn(npmCmd, ["run", script], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
}

const api = run("dev:api");
const web = run("dev:web");

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
