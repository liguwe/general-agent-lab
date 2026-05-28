# 002-agent-loop

今天拆的是 Codex 和 opencode 的 Agent Loop：一轮用户输入怎样变成模型的 prompt，模型返回后怎样解析，遇到工具调用怎样执行并继续下一轮。

## 源码证据

### Codex（Rust）

链路在 `codex-rs/core/src/session/turn.rs`，核心是 `run_turn()` 被外层 `loop` 包裹（`codex-rs/core/src/tasks/regular.rs`）：

```rust
// codex-rs/core/src/tasks/regular.rs
loop {
    let last_agent_message = run_turn(sess, ctx, extension_data, next_input, ...).await;
    if !sess.input_queue.has_pending_input(&sess.active_turn).await {
        break;
    }
    next_input = ...;  // 模型返回结果作为下一轮的输入
}

// codex-rs/core/src/session/turn.rs
// run_turn 内部：
loop {
    // 1. 收集 pending_input
    // 2. clone_history() 构造 sampling_request_input
    // 3. run_sampling_request() -> 调模型
    // 4. 处理 ResponseEvent：
    //    - text delta -> 发给 TUI
    //    - tool_call -> 执行工具，结果追加到 history
    //    - stop -> 检查 needs_follow_up
    // 5. 如果 needs_follow_up 或 token limit -> auto_compact -> 继续循环
}
```

更白话一点：
```
regular_task.run() ──loop──> run_turn()
                               |
                               +── 构造 prompt（history + pending_input）
                               +── run_sampling_request() ── 调模型 API
                               +── 流式解析 response：
                               |     文本 -> 发给 UI
                               |     tool_call -> 执行 -> 追加到 history
                               |     stop -> 判断是否还需要继续
                               +── needs_follow_up? ──yes──> 继续 loop
                               |                           ──no──> 退出
```

关键文件：

- `codex/codex-rs/core/src/session/turn.rs`
- `codex/codex-rs/core/src/tasks/regular.rs`

### opencode（TypeScript）

链路在 `packages/opencode/src/session/llm.ts`，用 Vercel AI SDK 的 `streamText`：

```typescript
// packages/opencode/src/session/llm.ts
const stream = streamText({
  model: languageModel,
  messages: prepared.messages,  // history + system prompt
  tools: prepared.tools,         // 工具注册表
  onStepFinish: async (result) => {
    // 每步完成后处理：
    // - 文本 -> 发给 UI
    // - tool_call -> 执行 -> 追加到 messages
    // - stop -> 决定是否继续
  },
});
```

opencode 把 loop 委托给了 AI SDK 的 `streamText`，它内部自动处理多步 tool call。Codex 是自己写的 Rust loop。

关键文件：

- `opencode/packages/opencode/src/session/llm.ts`
- `opencode/packages/opencode/src/session/llm/ai-sdk.ts`

## 架构对照

| 维度 | Codex | opencode |
|---|---|---|
| loop 实现 | 自己写的 Rust `loop` + `run_turn` | Vercel AI SDK `streamText` |
| prompt 构造 | `clone_history()` + `pending_input` | `prepared.messages` (ai SDK `ModelMessage[]`) |
| 工具执行 | `ToolRouter` + 并行 `ToolCallRuntime` | AI SDK `tools` + `onStepFinish` |
| 流式输出 | `ResponseEvent` stream（文本 delta、tool_call_delta） | `streamText` stream（textDelta、toolCall、toolResult） |
| 多轮继续 | `needs_follow_up` 判断，auto_compact 后重新采样 | `onStepFinish` 或 AI SDK 内部自动继续 |

## 这个原型验证什么

验证 Agent Loop 最小骨架：

- `src/agent-loop.js` 模拟一轮 turn：构造 prompt → mock 模型返回 → 解析 response。
- 支持 mock tool call round-trip：模型返回 "我要调用工具" → 执行 stub 工具 → 结果返回 → 模型得到结果后生成最终回复。
- 无真实 LLM 调用，用 mock 函数代替。
- 无真实工具执行，工具只是打印 stub。

## 运行

```bash
npm run demo          # 纯文本响应，不调用工具
npm run demo:tool     # mock tool call round-trip
npm test              # 单元测试
```

## 今天的判断

Codex 和 opencode 在 Agent Loop 这一层的核心模式一致：

```
prompt(history + user_input)
  -> model(streamText / chatCompletions)
  -> parse(text / tool_calls)
  -> if tool_calls: execute -> append results -> loop
  -> if stop: return final text
```

区别只在实现方式：Codex 自己用 Rust 写这个 loop（精细控制并行工具、compaction、retry），opencode 委托给 AI SDK（代码少，但控制力弱）。

`mini-code-agent-cli` 后续应该保留这个边界：Agent Loop 是 runtime 的核心，入口层（001）不应该知道它的存在。
