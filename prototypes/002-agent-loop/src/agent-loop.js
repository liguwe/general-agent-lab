#!/usr/bin/env node

// Agent Loop 最小骨架：模拟 Codex run_turn() 的核心循环。
// 无真实 LLM 调用，用 mock 函数验证流程。

// --- 工具注册表 -----------------------------------------------------------

const TOOLS = {
  "read-file": {
    description: "读取文件内容",
    parameters: { path: { type: "string", description: "文件路径" } },
    // 执行 stub：不真正读文件，返回模拟内容
    execute: async (args) => `模拟文件内容: ${args.path}`,
  },
  "write-file": {
    description: "写入文件内容",
    parameters: {
      path: { type: "string", description: "文件路径" },
      content: { type: "string", description: "写入内容" },
    },
    execute: async (args) => `已写入 ${args.path} (${args.content.length} 字符)`,
  },
  "shell": {
    description: "执行 shell 命令",
    parameters: { command: { type: "string", description: "要执行的命令" } },
    execute: async (args) => `[mock] 执行: ${args.command}\n输出: 模拟命令输出`,
  },
};

// --- mock LLM -----------------------------------------------------------

// 根据 prompt 和 history 决定模型返回什么。
// 这里硬编码了几种场景来验证 loop 分支。
function mockLLMResponse(messages, tools) {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const prompt = lastUser?.content ?? "";

  // 优先级 1: 收到工具执行结果 -> 生成最终文本回复（必须先判断）
  const hasToolResult = messages.some((m) => m.role === "tool");
  if (hasToolResult) {
    return {
      text: "好的，文件已处理完毕。内容已读取/写入完成。",
      toolCalls: [],
      stopReason: "stop",
    };
  }

  // 优先级 2: 用户请求读文件 -> 模型返回 tool_call
  if (prompt.toLowerCase().includes("读") || prompt.toLowerCase().includes("read")) {
    return {
      text: null,
      toolCalls: [
        {
          id: "call_001",
          name: "read-file",
          args: { path: "src/main.js" },
        },
      ],
      stopReason: null,
    };
  }

  // 优先级 3: 用户请求写文件 -> 模型返回 tool_call
  if (prompt.toLowerCase().includes("写") || prompt.toLowerCase().includes("write")) {
    return {
      text: null,
      toolCalls: [
        {
          id: "call_001",
          name: "write-file",
          args: { path: "output.txt", content: "hello world" },
        },
      ],
      stopReason: null,
    };
  }

  // 优先级 4: 默认 -> 纯文本回复
  return {
    text: `收到你的输入：${prompt}。这是 mock 模型的纯文本回复。`,
    toolCalls: [],
    stopReason: "stop",
  };
}

// --- prompt 构造 ----------------------------------------------------------

// 模拟 Codex 的 clone_history() + pending_input：把 system prompt + 历史 + 用户输入拼成 messages。
function buildPrompt(systemPrompt, history, userInput) {
  return [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: userInput },
  ];
}

// --- Agent Loop -----------------------------------------------------------

// 核心循环，对应 Codex 的 run_turn() loop。
// 每轮：构造 prompt -> 调模型 -> 解析 response -> 执行工具或退出。
async function runAgentLoop({ systemPrompt, history = [], userInput, modelFn, tools, logFn }) {
  const messages = buildPrompt(systemPrompt, history, userInput);
  const maxSteps = 5; // 安全阀：防止 mock loop 失控
  let step = 0;
  let toolResults = [];

  while (step < maxSteps) {
    step += 1;
    logFn(`[Agent Loop] 第 ${step} 步: 发送 prompt (${messages.length} 条消息)`);

    // 1. 调模型
    const response = await modelFn(messages, tools);

    // 2. 解析文本响应
    if (response.text) {
      logFn(`[Agent Loop] 模型返回文本: ${response.text}`);
    }

    // 3. 解析工具调用
    if (response.toolCalls && response.toolCalls.length > 0) {
      logFn(`[Agent Loop] 模型请求调用 ${response.toolCalls.length} 个工具`);

      for (const tc of response.toolCalls) {
        const tool = tools[tc.name];
        if (!tool) {
          logFn(`[Agent Loop] 错误: 未知工具 "${tc.name}"`);
          messages.push({ role: "tool", content: `错误: 未知工具 "${tc.name}"`, toolCallId: tc.id });
          continue;
        }

        logFn(`[Agent Loop] 执行工具 ${tc.name}(${JSON.stringify(tc.args)})`);
        const result = await tool.execute(tc.args);
        toolResults.push({ name: tc.name, result });
        logFn(`[Agent Loop] 工具返回: ${result}`);

        // 把工具结果追加到消息列表（对应 Codex 的 history.push(tool_result)）
        messages.push({ role: "tool", content: result, toolCallId: tc.id });
      }

      // 有工具调用，需要继续循环让模型看到结果
      continue;
    }

    // 4. 没有工具调用，模型已给出最终回复，退出循环
    logFn(`[Agent Loop] 模型无工具调用，结束本轮`);
    return {
      finalText: response.text ?? "",
      steps: step,
      toolResults,
      stopReason: response.stopReason ?? "stop",
    };
  }

  // 超出最大步数，安全退出
  logFn(`[Agent Loop] 超出最大步数 (${maxSteps})，强制退出`);
  return {
    finalText: "(超出最大执行步数)",
    steps: step,
    toolResults,
    stopReason: "max_steps",
  };
}

// --- CLI 入口 -------------------------------------------------------------

function printHeader(mode) {
  console.log(`[mini-codex] 模式=${mode} 工具=${Object.keys(TOOLS).join(", ")}`);
}

function printUsage() {
  console.log(`mini-codex-agent [PROMPT]

演示 Agent Loop 最小骨架。

用法:
  demo          纯文本回复（不调用工具）
  demo:tool     mock tool call round-trip

示例:
  node src/agent-loop.js "你好"
  node src/agent-loop.js "帮我读一下 src/main.js"
  node src/agent-loop.js "帮我写一个文件到 output.txt"
`);
}

async function main(argv) {
  const prompt = argv.join(" ");

  // 只有纯 "help" 或无参数时才显示帮助
  if (prompt === "help" || !prompt) {
    return printUsage();
  }

  // 打印 demo header
  printHeader("agent-loop");

  // 定义日志回调
  const log = (msg) => console.log(msg);

  // 运行 Agent Loop
  const result = await runAgentLoop({
    systemPrompt: "你是一个编码助手。你可以读取和写入文件，执行 shell 命令。",
    userInput: prompt,
    modelFn: mockLLMResponse,
    tools: TOOLS,
    logFn: log,
  });

  // 打印摘要
  console.log("\n--- 执行摘要 ---");
  console.log(`最终回复: ${result.finalText}`);
  console.log(`执行步数: ${result.steps}`);
  console.log(`停止原因: ${result.stopReason}`);
  if (result.toolResults.length > 0) {
    console.log(`工具执行: ${result.toolResults.map((t) => `${t.name} -> ${t.result}`).join("; ")}`);
  }
}

// 真实入口
main(process.argv.slice(2)).catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
