#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 模拟 Codex npm wrapper 的平台选择：不同系统架构会映射到不同 native runtime 包。
const PLATFORM_TARGETS = {
  linux: {
    x64: "x86_64-unknown-linux-musl",
    arm64: "aarch64-unknown-linux-musl",
  },
  darwin: {
    x64: "x86_64-apple-darwin",
    arm64: "aarch64-apple-darwin",
  },
  win32: {
    x64: "x86_64-pc-windows-msvc",
    arm64: "aarch64-pc-windows-msvc",
  },
};

function targetTriple(platform, arch) {
  return PLATFORM_TARGETS[platform]?.[arch] ?? null;
}

const target = targetTriple(process.platform, process.arch);
if (!target) {
  throw new Error(`Unsupported platform: ${process.platform} (${process.arch})`);
}

const runtimePath = path.join(__dirname, "..", "src", "runtime.js");
if (!existsSync(runtimePath)) {
  throw new Error(`Missing mini runtime: ${runtimePath}`);
}

// 这里模拟 Codex wrapper 注入的运行时环境变量，runtime 可以据此知道自己由哪个安装入口托管。
const env = {
  ...process.env,
  MINI_CODEX_TARGET: target,
  MINI_CODEX_MANAGED_BY_NPM: "1",
  MINI_CODEX_MANAGED_PACKAGE_ROOT: realpathSync(path.join(__dirname, "..")),
};

// wrapper 不处理业务命令，只把原始参数转发给真正的 runtime dispatcher。
const child = spawn(process.execPath, [runtimePath, ...process.argv.slice(2)], {
  stdio: "inherit",
  env,
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});

// 父进程收到退出信号时转发给子进程，保持 CLI 生命周期和 Codex wrapper 一样可预测。
for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(signal, () => {
    if (!child.killed) {
      child.kill(signal);
    }
  });
}

// 子进程结束后，wrapper 镜像它的退出码或退出信号。
child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
