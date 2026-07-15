#!/usr/bin/env node
/**
 * Thin stdout proxy: advertises manage_adr (+ other tools omitted from tools/list
 * in codebase-memory-mcp 0.9.0). Stdin is raw-passthrough so Cursor handshake
 * is not delayed by re-framing.
 */
import { spawn } from "node:child_process";

const EXE =
  process.env.CODEBASE_MEMORY_MCP_EXE ||
  "C:/Users/chach/.local/bin/codebase-memory-mcp.exe";

const EXTRA_TOOLS = [
  {
    name: "manage_adr",
    title: "Manage ADR",
    description:
      "CRUD for Architecture Decision Records. Modes: get/store/update/delete. Sections: PURPOSE, STACK, ARCHITECTURE, PATTERNS, TRADEOFFS, PHILOSOPHY.",
    inputSchema: {
      type: "object",
      properties: {
        project: { type: "string" },
        mode: {
          type: "string",
          enum: ["get", "store", "update", "delete"],
        },
        content: { type: "string" },
        sections: {
          type: "object",
          additionalProperties: { type: "string" },
        },
      },
      required: ["project"],
    },
  },
  {
    name: "list_projects",
    title: "List projects",
    description: "List indexed knowledge-graph projects.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "delete_project",
    title: "Delete project",
    description: "Delete an indexed project from the knowledge graph.",
    inputSchema: {
      type: "object",
      properties: { project: { type: "string" } },
      required: ["project"],
    },
  },
  {
    name: "index_status",
    title: "Index status",
    description: "Show indexing status for a project.",
    inputSchema: {
      type: "object",
      properties: { project: { type: "string" } },
      required: ["project"],
    },
  },
  {
    name: "detect_changes",
    title: "Detect changes",
    description:
      "Map git diff to affected symbols with blast radius / risk classification.",
    inputSchema: {
      type: "object",
      properties: {
        project: { type: "string" },
        risk_labels: { type: "boolean" },
      },
      required: ["project"],
    },
  },
  {
    name: "ingest_traces",
    title: "Ingest traces",
    description: "Ingest runtime traces to validate HTTP_CALLS edges.",
    inputSchema: {
      type: "object",
      properties: {
        project: { type: "string" },
        traces: { type: "array", items: { type: "object" } },
      },
      required: ["project"],
    },
  },
];

const child = spawn(EXE, ["--ui=false"], {
  stdio: ["pipe", "pipe", "pipe"],
  windowsHide: true,
  env: {
    ...process.env,
    // Prefer a smaller RAM budget when supported (ignored if unsupported).
    CBM_MEM_BUDGET_MB: process.env.CBM_MEM_BUDGET_MB || "512",
  },
});

child.stderr.on("data", (chunk) => {
  process.stderr.write(chunk);
});

// Cursor → child: never re-frame (avoids handshake stalls on Windows).
process.stdin.on("data", (chunk) => {
  if (!child.stdin.destroyed) child.stdin.write(chunk);
});
process.stdin.on("end", () => {
  try {
    child.stdin.end();
  } catch {
    /* ignore */
  }
});

let outBuf = Buffer.alloc(0);

function headerEndIndex(buf) {
  // Accept \n\n, \r\n\r\n, and Windows-doubled \r\r\n\r\r\n
  const patterns = ["\r\r\n\r\r\n", "\r\n\r\n", "\n\n"];
  let best = -1;
  let bestLen = 0;
  for (const p of patterns) {
    const i = buf.indexOf(p);
    if (i !== -1 && (best === -1 || i < best)) {
      best = i;
      bestLen = p.length;
    }
  }
  return best === -1 ? null : { index: best, sepLen: bestLen };
}

function encode(obj) {
  const json = JSON.stringify(obj);
  return Buffer.from(
    `Content-Length: ${Buffer.byteLength(json)}\r\n\r\n${json}`,
    "utf8"
  );
}

function injectTools(msg) {
  const tools = msg?.result?.tools;
  if (msg?.id == null || !Array.isArray(tools)) return msg;
  const have = new Set(tools.map((t) => t.name));
  const extras = EXTRA_TOOLS.filter((t) => !have.has(t.name));
  if (extras.length === 0) return msg;
  return {
    ...msg,
    result: { ...msg.result, tools: [...tools, ...extras] },
  };
}

function flushOut() {
  while (outBuf.length > 0) {
    const ascii = outBuf.toString("binary");
    const m = /^Content-Length:\s*(\d+)/i.exec(ascii);
    if (!m) {
      // Wait for a full header; if garbage accumulates, pass through a small chunk.
      if (outBuf.length > 64 && !ascii.includes("Content-Length:")) {
        process.stdout.write(outBuf.subarray(0, outBuf.length));
        outBuf = Buffer.alloc(0);
      }
      return;
    }
    const bodyLen = Number(m[1]);
    const sep = headerEndIndex(outBuf);
    if (!sep) return;
    const bodyStart = sep.index + sep.sepLen;
    if (outBuf.length < bodyStart + bodyLen) return;

    const header = outBuf.subarray(0, bodyStart);
    const body = outBuf.subarray(bodyStart, bodyStart + bodyLen);
    outBuf = outBuf.subarray(bodyStart + bodyLen);

    let msg;
    try {
      msg = JSON.parse(body.toString("utf8"));
    } catch {
      process.stdout.write(Buffer.concat([header, body]));
      continue;
    }

    if (Array.isArray(msg?.result?.tools)) {
      process.stdout.write(encode(injectTools(msg)));
    } else {
      process.stdout.write(Buffer.concat([header, body]));
    }
  }
}

child.stdout.on("data", (chunk) => {
  outBuf = Buffer.concat([outBuf, chunk]);
  flushOut();
});

function shutdown(code = 0) {
  try {
    child.kill();
  } catch {
    /* ignore */
  }
  process.exit(code);
}

child.on("exit", (code, signal) => {
  if (signal) shutdown(1);
  shutdown(code ?? 0);
});
process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
