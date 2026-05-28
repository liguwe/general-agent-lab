import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const bin = path.join(__dirname, "..", "bin", "mini-codex.js");

// 测试通过真实 Node 子进程执行 wrapper，确保验证的是完整入口链路而不是单个函数。
function run(args) {
  const result = spawnSync(process.execPath, [bin, ...args], {
    encoding: "utf8",
  });
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

{
  // 无 subcommand 时进入 mock interactive TUI，并继承 root flags。
  const result = run(["--profile", "daily", "-c", "model=mock", "hello"]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /mode=interactive-tui/);
  assert.match(result.stdout, /profile=daily/);
  assert.match(result.stdout, /prompt: hello/);
}

{
  // exec 子命令进入非交互路径，同时保留 root config。
  const result = run(["-c", "sandbox=workspace-write", "exec", "summarize cwd"]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /mode=exec/);
  assert.match(result.stdout, /config=sandbox=workspace-write/);
  assert.match(result.stdout, /route: exec -> non-interactive agent run/);
}

{
  // debug prompt-input 暴露 wrapper 注入的环境变量和 dispatcher 解析结果。
  const result = run(["debug", "prompt-input", "hello"]);
  assert.equal(result.status, 0);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.route, "debug prompt-input");
  assert.equal(payload.managedByNpm, true);
  assert.equal(payload.prompt, "hello");
  assert.ok(payload.target);
}

{
  // 错误路径要返回非零退出码，方便未来 shell/CI 判断失败。
  const result = run(["debug", "unknown"]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /debug only supports/);
}

console.log("cli-entry prototype tests passed");
