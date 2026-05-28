#!/usr/bin/env node

// 002-agent-loop 入口：和 001-cli-entry 一样的 wrapper 模式，
// 只是这次直接运行 agent loop 而不是 spawn 子进程。
// 这个 wrapper 保持和 001 一致的边界，后续如果要分离 wrapper/runtime 时容易对照。

import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runtimePath = path.join(__dirname, "..", "src", "agent-loop.js");
if (!existsSync(runtimePath)) {
  throw new Error(`缺少 agent loop runtime: ${runtimePath}`);
}

// wrapper 不处理业务命令，直接执行 runtime。
import { spawn } from "node:child_process";

const child = spawn(process.execPath, [runtimePath, ...process.argv.slice(2)], {
  stdio: "inherit",
  env: {
    ...process.env,
    MINI_CODEX_PROTOTYPE: "002-agent-loop",
  },
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});

for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(signal, () => {
    if (!child.killed) child.kill(signal);
  });
}

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
