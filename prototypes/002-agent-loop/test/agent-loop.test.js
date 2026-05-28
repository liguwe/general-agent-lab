import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const agentLoop = path.join(__dirname, "..", "src", "agent-loop.js");

// 测试通过真实 Node 子进程执行 agent loop，验证完整循环流程。
function run(args) {
  const result = spawnSync(process.execPath, [agentLoop, ...args], {
    encoding: "utf8",
  });
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

{
  // 场景 1: 纯文本输入，不调用工具 -> 模型直接返回文本，一步完成。
  const result = run(["你好"]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /模式=agent-loop/);
  assert.match(result.stdout, /第 1 步/);
  assert.match(result.stdout, /模型返回文本/);
  assert.match(result.stdout, /模型无工具调用/);
  assert.match(result.stdout, /停止原因: stop/);
  assert.match(result.stdout, /执行步数: 1/);
  console.log("✓ 场景 1: 纯文本回复通过");
}

{
  // 场景 2: 请求读文件 -> 模型返回 tool_call -> 执行工具 -> 模型看到结果后返回最终文本。
  const result = run(["帮我读一下文件"]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /第 1 步/);
  assert.match(result.stdout, /模型请求调用 1 个工具/);
  assert.match(result.stdout, /执行工具 read-file/);
  assert.match(result.stdout, /工具返回: 模拟文件内容/);
  assert.match(result.stdout, /第 2 步/);
  assert.match(result.stdout, /模型返回文本/);
  assert.match(result.stdout, /停止原因: stop/);
  assert.match(result.stdout, /执行步数: 2/);
  console.log("✓ 场景 2: 工具调用 round-trip 通过");
}

{
  // 场景 3: 未知工具调用 -> 模型返回错误。
  const result = run(["帮我调用一个不存在的工具"]);
  assert.equal(result.status, 0);
  // "不存在的工具" 不会匹配 read/write，走默认纯文本回复
  assert.match(result.stdout, /收到你的输入/);
  assert.match(result.stdout, /停止原因: stop/);
  assert.match(result.stdout, /执行步数: 1/);
  console.log("✓ 场景 3: 默认路径通过");
}

{
  // 场景 4: 帮助信息
  const result = run(["help"]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /演示 Agent Loop 最小骨架/);
  console.log("✓ 场景 4: 帮助信息通过");
}

console.log("agent-loop prototype tests passed");
